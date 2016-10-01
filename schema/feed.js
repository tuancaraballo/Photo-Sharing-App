
"use strict";

/*
 * Defined the Mongoose Schema and return a Model for a Photo
 */

/* jshint node: true */

var mongoose = require('mongoose');



var feedSchema = new mongoose.Schema({
	 userName: String,
	 type: String,
	 description: String,
	 date: Date, type: String, 
	 photoUpload: String, 
	 comments_authorName: String
});

var activityFeed = mongoose.model('activityFeed', feedSchema);
module.exports = activityFeed;