'use strict';
cs142App.controller('activityFeed-Controller', ['$scope', '$routeParams', '$resource', '$rootScope',
  function ($scope, $routeParams, $resource, $rootScope) {

  	 var activity = $resource('/activityFeed');
  	 activity.query({},function(activityFeed){
  	 	$scope.activityFeed = activityFeed;
  	 	console.log("Activity Feed " + activityFeed);
      });


  	 $scope.checkIfPhoto = function(activity){
  	 	if(activity.photoUpload){
  	 		return true;
  	 	}
  	 	return false;
  	 }

  }]);