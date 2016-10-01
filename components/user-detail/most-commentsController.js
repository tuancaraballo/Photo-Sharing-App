'use strict';

cs142App.controller('most-commentsController', ['$scope', '$resource','$rootScope',
  function ($scope, $resource, $rootScope) {
       $scope.mostComments = $rootScope.mostComments;
       console.log("Most Recent Controller: " + $rootScope.most_recent_FileName);


  }]);