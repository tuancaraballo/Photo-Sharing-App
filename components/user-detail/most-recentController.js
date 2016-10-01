'use strict';

cs142App.controller('most-recentController', ['$scope', '$resource','$rootScope',
  function ($scope, $resource, $rootScope) {
       $scope.most_recent_FileName = $rootScope.most_recent_FileName;
       console.log("Most Recent Controller: " + $rootScope.most_recent_FileName);


  }]);