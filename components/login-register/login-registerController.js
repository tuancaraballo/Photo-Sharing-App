'use strict';


// cs142App.controller('MainController', ['$scope', '$resource',
//     function ($scope, $resource) {
cs142App.controller('login-registerController', ['$scope','$resource', '$rootScope','$location',
  function ($scope, $resource, $rootScope, $location) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
   // var userId = $routeParams.userId;

    //var User = $resource("/user/:id",{id: userId});
    //$rootScope.isLoggedIn = false;
   
     //$scope.userObject.test = "TEST!!";

    $scope.loginObject = {login_name: '' , password: ''};

    $scope.temp_password ='';
    $scope.userInfo = {first_name: '', last_name: '', location:'',description:'', occupation:'',login_name:'', password: '' };

    var checkInputs = function(){
       if($scope.temp_password != $scope.userInfo.password){
        alert("Your passwords don't match");
        return 1;
      }else if($scope.userInfo.first_name.length ===0 || $scope.userInfo.last_name.length ===0 || $scope.userInfo.location.length ===0
        || $scope.userInfo.description.length ===0 || $scope.userInfo.occupation.length === 0, $scope.userInfo.login_name.length ===0
        || $scope.userInfo.password.length ===0){
        alert("One or more fields are empty");
        return 1;
      }
      return 0;
    }
    $scope.register = function(){
        if(checkInputs() == 1){
          return;
        }
        console.log("REGISTRATION");
        console.log("First Name: " + $scope.userInfo.first_name);
        console.log("last_name Name: " + $scope.userInfo.last_name);
        console.log("Location: " + $scope.userInfo.location );
         console.log("Description: " + $scope.userInfo.description );
         console.log("Occupation: " + $scope.userInfo.occupation);
         console.log("Login: " + $scope.userInfo.login_name);
         console.log("Password: " + $scope.userInfo.password);

        var registration = $resource("/register");
        registration.save({first_name: $scope.userInfo.first_name, last_name: $scope.userInfo.last_name, location: $scope.userInfo.location, 
          description: $scope.userInfo.description, occupation: $scope.userInfo.occupation, login_name: $scope.userInfo.login_name,
          password: $scope.userInfo.password }, function(){
            alert("You have sucessfully registered");
            $location.path('/login-register');
            // clear things in your userinfo object
        }, function errorHandling(err){
            alert("Whoops! something went WRONG!!");
        });
    }

    
    $scope.login = function(){
      if($scope.loginObject.login_name.length ===0 ||  $scope.loginObject.password.length === 0 ){
        alert("One of your input fields is empty");
        return;
      }
      var userRes = $resource("/admin/login");
      userRes.save({login_name: $scope.loginObject.login_name, password: $scope.loginObject.password}, function (object) {
          $rootScope.isLoggedIn = true;
         $scope.userObject.first_name = object.first_name;
         $scope.userObject.lastActivity_type = object.last_activity_type;
         $scope.userObject.lastActivity_file_name = undefined;
           $rootScope.username = object.first_name;
           $rootScope.loggedInUserId = object._id;
           console.log("The user id for the user logged in is:" + $rootScope.loggedInUserId);
         $location.path("/users/" + object._id);
      }, function errorHandling(err) { 
        alert("WRONG USER NAME OR PASSWORD");
        console.log("Not cool, error");
    });
   
};
   

  }]);

// password: $scope.loginObject.password