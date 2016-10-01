    'use strict';

    var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource', ]);

    cs142App.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/users', {
                    templateUrl: 'components/user-list/user-listTemplate.html',
                    controller: 'UserListController'
                }).
                when('/users/:userId', {
                    templateUrl: 'components/user-detail/user-detailTemplate.html',
                    controller: 'UserDetailController'
                }).
                when('/login-register', {
                    templateUrl: 'components/login-register/login-registerTemplate.html',
                    controller: 'login-registerController'
                }).
                when('/photos/:userId', {
                    templateUrl: 'components/user-photos/user-photosTemplate.html',
                    controller: 'UserPhotosController'
                }).
                when('/most-recent', {
                    templateUrl: 'components/user-detail/mostRecent.html',
                    controller: 'most-recentController'
                }).
                when('/most-comments', {
                    templateUrl: 'components/user-detail/mostComments.html',
                    controller: 'most-commentsController'
                }).
                when('/activityFeed', {
                    templateUrl: 'components/activity-feed/activityFeed.html',
                    controller: 'activityFeed-Controller'
                }).
                otherwise({
                    redirectTo: '/users'
                });
        }]);

    cs142App.controller('MainController', ['$scope', '$resource', '$rootScope','$location', '$http', '$route', '$window',
        function ($scope, $resource, $rootScope, $location, $http, $route, $window) {
            $scope.main = {};
            $scope.main.title = 'Users';
            $scope.userObject = {};
           var Info = $resource("/test/info");

            $rootScope.isLoggedIn = false;
            $rootScope.username = '';


        $scope.logout = function(){
          var outRes = $resource("/admin/logout");
          outRes.save({}, function () {
             $scope.userObject.lastActivity_type = "Log out";
             $rootScope.isLoggedIn = false;
             $location.path("/login-register");
          }, function errorHandling(err) { 
            console.log("Not cool, error");
        });
      }
        var data = Info.get({}, function(){
                $scope.version =  data.version;
           });           
        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
            if ($rootScope.isLoggedIn == false) {
                 // no logged user, redirect to /login-register unless already there
                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
              }
           });


    //       User.get({id: userId}, function (users) {
    //       $scope.user = users;
    //       $scope.userObject.name = $scope.user.first_name;
    // } );      
        
      $scope.showActivityFeed = function(){
        console.log("got to the showActivityFunction");
        $location.path('/activityFeed');
      }      



     var selectedPhotoFile;   // Holds the last file selected by the user

            // Called on file selection - we simply save a reference to the file in selectedPhotoFile
            $scope.inputFileNameChanged = function (element) {
                selectedPhotoFile = element.files[0];
            };

            // Has the user selected a file?
            $scope.inputFileNameSelected = function () {
                return !!selectedPhotoFile;
            };

            // Upload the photo file selected by the user using a post request to the URL /photos/new
            $scope.uploadPhoto = function () {
                if (!$scope.inputFileNameSelected()) {
                    alert("uploadPhoto called will no selected file");
                    return;
                }


                console.log('fileSubmitted', selectedPhotoFile);

                // Create a DOM form and add the file to it under the name uploadedphoto
                var domForm = new FormData();
                domForm.append('uploadedphoto', selectedPhotoFile);

                // Using $http to POST the form
                $http.post('/photos/new', domForm, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).success(function(newPhoto){
                    // The photo was successfully uploaded. XXX - Do whatever you want on success.
                   // // $route.reload();
                   //  window.location.reload(); 
   //                 $window.location.reload();
                    $scope.userObject.lastActivity_type = "Post Photo";
                    $scope.userObject.lastActivity_file_name = newPhoto.file_name;
 
                }).error(function(err){
                    // Couldn't upload the photo. XXX  - Do whatever you want on failure.
                    console.error('ERROR uploading photo', err);
                });

            };

}]);




