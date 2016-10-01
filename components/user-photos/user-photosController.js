'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource', '$rootScope',
  function ($scope, $routeParams, $resource, $rootScope) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */

  $scope.username = $rootScope.username;
// ---------------- GET USER ID AND USER OBJECT ----------------------------------------//     
    var userId = $routeParams.userId;
    var User = $resource("/user/:id");
    User.get({id: userId}, function (users) {
          $scope.user = users;
          $scope.userObject.name = $scope.user.first_name;
    } );

// ----------------------- GETTING THE USER'S PHOTO -------------------------------//
    var UserPhoto = $resource("/photosOfUser/:id");
    UserPhoto.query({id: userId}, function(photos){
      $scope.userphotos = photos;
      delete $scope.userphotos.__v;
      $scope.userObject.status = $scope.userObject.name + "'s Photos";
      console.log($scope.userphotos);
    });
  
//------------------------ ADDING A COMMENT -------------------------------------- //
     $scope.addComment = function(photoId,yourComment){ // on this side I need to add the comment to the html document.        
        if(yourComment === undefined ){
          alert("Your comment is empty");
          return;
        }
        var userCmt = $resource("/commentsOfPhoto/"+photoId);
         userCmt.save({addComment: yourComment},function(){ 
            UserPhoto.query({id: userId}, function(photos){
              $scope.userphotos = photos;
              delete $scope.userphotos.__v;
              $scope.userObject.lastActivity_type = "Post Comment";
              $scope.userObject.lastActivity_file_name = undefined;
              $scope.userObject.status = $scope.userObject.name + "'s Photos";
              $scope.lastActivity_type = "Registered";

            });
        }, function errorHandling(err) { 
              console.log("Not cool, error");
        });
      }; 
// -------------- CHECKS IF THE LOGGED IN USER HAS LIKED THIS SPECIFIC PHOTO -----------//
 
  $scope.hasLiked = function (photo) {
      console.log("Photo id is : "  + photo._id);
      $scope.numberofLikes = photo.likeUsers.length;
      if (photo.likeUsers.indexOf($rootScope.loggedInUserId) != -1) { 
          $scope.link= "/images/like.png";  
          return true;    
      }
      $scope.link = "/images/dislike.png";
      return false;
  }
// --------------------------- REMOVE LIKE  -----------------------------//
  $scope.removeLike = function (photoId) {
        console.log("Inside remove function photoid: " + photoId);

        var userRemLike = $resource('/photoRemoveLike/:photoId', {photoId: photoId});
        userRemLike.save({}, function(){

          // rerender the page using the same code you use for comments.
          UserPhoto.query({id: userId}, function(photos){
              $scope.userphotos = photos;
              delete $scope.userphotos.__v;
              $scope.userObject.lastActivity_type = "Disliked a Photo";
              $scope.userObject.lastActivity_file_name = undefined;
              $scope.userObject.status = $scope.userObject.name + "'s Photos";
            });          
        });
  }

// --------------------------- ADD LIKE  -----------------------------//
  $scope.addLike = function (photoId) {
    var userAddLike = $resource('/photoAddLike/:photoId', {photoId: photoId});
    userAddLike.save({}, function(){

    // rerender the page using the same code you use for comments.
        UserPhoto.query({id: userId}, function(photos){
          $scope.userphotos = photos;
          $scope.userObject.lastActivity_type = "Liked a Photo";
          $scope.userObject.lastActivity_file_name = undefined;
          delete $scope.userphotos.__v;
          $scope.userObject.status = $scope.userObject.name + "'s Photos";
        });          
     });
  }



  }]);



 