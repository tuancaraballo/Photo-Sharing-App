"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

/*-----------------------------SOME REQUIRED INJECTIONS AND STUFF ------------------------ */
var mongoose = require('mongoose');

// Added by me:
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
var async = require('async');

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var activityFeed = require('./schema/feed.js');


var express = require('express');
var app = express();
var fs = require("fs");

// Added by me: 
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// XXX - Your submission should work without this line
var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});


 /*------------------------- GET USERS LIST ------------------------------------------- */
app.get('/user/list', function (request, response) {
    if(request.session.login_name === undefined || request.session._id === undefined){
        response.status(401).send("Haven't logged in");
        return;
    }

    User.find({}, function(err,listOfUsers){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        }else if( listOfUsers.length ===0){
            response.status(400).send("no users found");
            return;
        } 
        var len = listOfUsers.length;
        var listToReturn = [];
        for (var i = 0; i < len; i++) {
            var obj = {};
            obj.first_name = listOfUsers[i].first_name;
            obj.last_name = listOfUsers[i].last_name;
            obj._id =  listOfUsers[i]._id;
            listToReturn.push(obj);
        }
        response.status(200).send(JSON.stringify(listToReturn));
    })
});

/*------------------------- GET A USER'S DETAILS -------------------------------------------- */
app.get('/user/:id', function (request, response) {
    
    if(request.session.login_name === undefined || request.session._id === undefined){
        response.status(401).send("Haven't logged in");
        return;
    }
    var id = request.params.id;
    User.findOne({'_id':id}, function(err,user){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        } else if (user === null) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
       var usercopy = {}
       usercopy.first_name = user.first_name;
       usercopy.last_name = user.last_name;
       usercopy.location = user.location;
       usercopy.description = user.description;
       usercopy.occupation = user.occupation;
       usercopy._id = user._id;

        Photo.find({'user_id': id},function(err,photos){
            if(err){
                console.log("ERROR");
                response.status(400).send(JSON.stringify(err));
                return;
            } else if (photos.length === 0) {
                response.status(400).send('Not found');
                return;
            }
           var most_recent_date = 0;  // add a very old date here
            var most_recent_file_name = '';
            var most_comments = 0;
            var most_comments_file_name = '';

            for(var i = 0; i < photos.length; i++){
                if (photos[i].date_time > most_recent_date) {
                    most_recent_date = photos[i].date_time;
                    most_recent_file_name = photos[i].file_name;
                }
                if(photos[i].comments.length > most_comments){
                      var most_comments = photos[i].comments.length;
                      most_comments_file_name= photos[i].file_name;
                }
            }
           usercopy.most_recent_fileName = most_recent_file_name;
           usercopy.most_comments_fileName=  most_comments_file_name;
           usercopy.most_recent_date = most_recent_date;
              response.status(200).send(JSON.stringify(usercopy));
              return;
        });     
        return;
    });
});

/*------------------------- GET ALL USER'S PHOTOS -------------------------------------------- */
app.get('/photosOfUser/:id', function (request, response) {
    if(request.session.login_name === undefined || request.session._id === undefined){
        response.status(401).send("Haven't logged in");
        return;
    }
    var id = request.params.id;
    Photo.find({'user_id': id},function(err,photos){
        if(err){
            console.log("ERROR");
            response.status(400).send(JSON.stringify(err));
            return;
        } else if (photos.length === 0) {
        response.status(400).send('Not found');
        return;
        }
        var photocopy = JSON.parse(JSON.stringify(photos));
        async.each(photocopy, function(photo,callbackPhotos){
            delete photo.__v;
            async.each(photo.comments, function(comment,callbackComments){
                var userObject = {};                
                User.findOne({'_id':comment.user_id}, function(err,user){
                     if(err){
                         console.log("ERROR second async");
                        response.status(400).send(JSON.stringify(err));
                        return;
                     } else if (user === null) {
                        console.log('User with _id:' + id + ' not found.');
                        response.status(400).send('Not found');
                        return;
                    }
                    userObject.first_name = user.first_name;
                    userObject.last_name = user.last_name;
                    userObject._id = user._id;
                    comment.user = userObject;
                    // delete comment.user_id;
                    callbackComments(err);
            });
            }, function(err){
                if(err){
                    console.log("GOT an error");
                } else{
                    callbackPhotos(err);
                }
            });
    }, function(err){
                if(err){
                    response.status(400).send(JSON.stringify(err));
                    console.log("GOT an error");
                } else{
                    console.log(photocopy);                   
                    response.status(200).send(photocopy);
                }
            });
    });
});

/*----------------------------- LOGIN -------------------------------------------- */
app.post('/admin/login', function(request, response){
    User.findOne({login_name:request.body.login_name, password: request.body.password}, function (err,user){
        if(err){
            response.status(401).send(JSON.stringify(err));
            return;
        }else if (user === null){
            response.status(401).send('Not found');
            return;   
        }    
        var newActivity = {userName: user.first_name, date: new Date(), type: "Log in", description: "User logged in", photoUpload: undefined, comments_authorName: undefined};
        activityFeed.create(newActivity, function (err, activity){
            // 0- do some error checking
            if(err){
                response.status(400).send(JSON.stringify(err));
                return;
            }else if(activity.length ===0){
                response.status(400).send("no users found");
                return;
            } 
            var activity_type = "Log in";
            user.last_activity_type = activity_type;
            user.save();           
            var usercopy = JSON.parse(JSON.stringify(user));
            delete usercopy.__v;
            request.session.first_name = user.first_name;
            request.session.login_name = user.login_name;
            request.session._id = user._id;
            response.status(200).send(usercopy);
        });
    });
});

/*------------------------- LOGOUT -------------------------------------------- */
app.post('/admin/logout', function(request, response){
    if(!request.session){
        response.status(400).send('Not found');
        return;
    }else{
        User.findOne({_id:request.session._id}, function (error,user){
            var newActivity = {userName: request.session.first_name, date: new Date(), type: "Log out", description: "User logged out", 
            photoUpload: undefined, comments_authorName: undefined };
            activityFeed.create(newActivity, function (err, activity){
                if(err){
                    response.status(400).send(JSON.stringify(err));
                    return;
                }else if(activity.length ===0){
                    response.status(400).send("no users found");
                    return;
                }      
                var activity_type = "Log out";
                user.last_activity_type = activity_type;
                user.save();
                delete request.session.login_name;
                delete request.session._id;
                request.session.destroy(function (err) {
                    if(err){
                        response.status(400).send(JSON.stringify(err));
                        return;
                    }
                    console.log(err);
                    return;
                });
                response.status(200).send("Logged out");
            });
        });
    }            
});

/*------------------------- ADD NEW COMMENT -------------------------------------------- */
app.post('/commentsOfPhoto/:photo_id', function (request,response){
    if(request.session.login_name === undefined || request.session._id === undefined){
        response.status(400).send("Haven't logged in");
    }
    var photo_id = request.params.photo_id;
    Photo.findOne({'_id':photo_id}, function(err,photo){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        }else if (photo === null){
            response.status(400).send('Not found');
            return;   
        }
        var comment = {comment: request.body.addComment, date_time : new Date(), user_id : request.session._id};
        photo.comments.push(comment);
        photo.save();
        var newActivity = {userName: request.session.first_name, date: new Date(), type: "Comment", description: request.session.first_name + " commented a photo", 
            photoUpload: photo.file_name, comments_authorName: request.session.first_name};
            activityFeed.create(newActivity, function (err, activity){
                if(err){
                    response.status(400).send(JSON.stringify(err));
                    return;
                }else if(activity.length ===0){
                    response.status(400).send("no users found");
                    return;
                }             
                response.status(200).send("Success");
                return;
        });     
    });

});
/*------------------------- ADD NEW PHOTO -------------------------------------------- */
app.post('/photos/new', function(request,response){
    if(request.session.login_name === undefined || request.session._id === undefined){
        response.status(400).send("Haven't logged in");
    }
    processFormBody(request, response, function (err) {
        if (err || !request.file) {
            response.status(400).send(JSON.stringify(err));
            console.log("Firs error");
            return;
        }
        var timestamp = new Date().valueOf();
        var filename = 'U' +  String(timestamp) + request.file.originalname;
        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {     
            var photoObject = { id:'', file_name: filename, date_time: timestamp, user_id: request.session._id, comments: []};
            Photo.create( photoObject, function(err, newPhoto) {
                if(err){
                     response.status(400).send(JSON.stringify(err));
                    console.log("Second error");
                    return;
                } else {
                    var newActivity = {userName: request.session.first_name, date: new Date(), type: "Photo Upload", description: "User uploaded new photo", 
                    photoUpload: filename, comments_authorName: undefined};
                    activityFeed.create(newActivity, function (err, activity){
                        if(err){
                            response.status(400).send(JSON.stringify(err));
                            return;
                        }else if(activity.length ===0){
                            response.status(400).send("no users found");
                            return;
                        } 
                        response.status(200).send(newPhoto);
                        return;
                    });               
                }
            });
        });
    });
});



/*------------------------- REGISTERING A NEW USER ---------------------------------------- */
app.post('/register',function(request,response){
    var newUserObject = { first_name: request.body.first_name, last_name: request.body.last_name, location:request.body.location,
    description: request.body.description, occupation:request.body.occupation, login_name:request.body.login_name, password:request.body.password, activity_type: "", last_activity_file_name: "" };
    User.findOne({login_name: request.body.login_name}, function(err,user){
        if(err){
            response.status(500).send(JSON.stringify(err));
            console.log("Second error");
            return;
        } 
        if(!user){
            User.create(newUserObject, function(err,newuser){
                if(err){
                    response.status(500).send(JSON.stringify(err));
                    console.log("Second error");
                    return;
                }else{
                    var newActivity = {userName: newuser.first_name, date: new Date(), type: "Registration", description: "User registering", 
                    photoUpload: undefined, comments_authorName: undefined};
                    activityFeed.create(newActivity, function (err, activity){
                        if(err){
                            response.status(400).send(JSON.stringify(err));
                            return;
                        }
                        console.log('INSIDE USER REGISTRATION');
                       var activity_type = "Log out";
                        newuser.last_activity_type = activity_type ;
                        newuser.save();
                        response.status(200).send("Success registering!! ");
                        return;
                    });                  
                } 
            });
        }else{
           response.status(200).send("User already exists!");
            return;
        }
    });
});



/*------------------------- REMOVES A LIKE ---------------------------------------- */
app.post('/photoRemoveLike/:photoId', function (request,response) {
    if(request.session.login_name === undefined || request.session._id === undefined){
        response.status(400).send("Haven't logged in");
    }
    var photoId = request.params.photoId;
    Photo.findOne({_id:photoId}, function (err,photo){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        }else if(photo.length ===0){
                response.status(400).send("no users found");
                return;
            } 
        var index = photo.likeUsers.indexOf(request.session._id);
        photo.likeUsers.splice(index,1);
        photo.save();
        var newActivity = {userName: request.session.first_name, date: new Date(), type: "Dislike", description: "User disliked a photo", 
        photoUpload: photo.file_name, comments_authorName: undefined};
        activityFeed.create(newActivity, function (err, activity){
            if(err){
                response.status(400).send(JSON.stringify(err));
                return;
            }else if(activity.length ===0){
                response.status(400).send("no users found");
                return;
            } 
            response.status(200).send("Success");
         });
    });

});
/*------------------------- ADDS A LIKE ------------------------------------ */
app.post('/photoAddLike/:photoId', function (request,response) {
    if(request.session.login_name === undefined || request.session._id === undefined){
        response.status(400).send("Haven't logged in");
    }
    var photoId = request.params.photoId;
    Photo.findOne({_id:photoId}, function (err,photo){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        }else if(!photo){
           response.status(400).send("no users found");
           return;
        } 
        photo.likeUsers.push(request.session._id);
        photo.save();
        var newActivity = {userName: request.session.first_name, date: new Date(), type: "Like", description: "User Liked a photo", 
        photoUpload: photo.file_name, comments_authorName: undefined};
        activityFeed.create(newActivity, function (err, activity){
            if(err){
                response.status(400).send(JSON.stringify(err));
                return;
            }else if(!activity){
                response.status(400).send("no users found");
                return;
            } 
            response.status(200).send("Success");
         });        
    });
});

// ---------------------- ACTIVITY FEED ----------------------------------------///

app.get('/activityFeed', function (request, response) {
    if(request.session.login_name === undefined || request.session._id === undefined){
        response.status(401).send("Haven't logged in");
        return;
    }
    activityFeed.find({}).sort({'date': -1}).limit(20).exec(function (err, activity){
        if(err){
            response.status(400).send(JSON.stringify(err));
            return;
        }else if(!activity){
                response.status(400).send("no users found");
                return;
        } 
        delete activity._v;
        response.status(200).send(JSON.stringify(activity));
    });
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
