'use strict';


// cs142App.controller('MainController', ['$scope', '$resource',
//     function ($scope, $resource) {
cs142App.controller('UserDetailController', ['$scope', '$routeParams','$resource','$location', '$http', '$rootScope',
  function ($scope, $routeParams, $resource, $location, $http, $rootScope) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;

    var User = $resource("/user/:id",{id: userId});
    var user = User.get({}, function(){
            $scope.user = user;
            delete $scope.user.__v
            console.log(user);
            $scope.userObject.name = user.first_name;
            $scope.userObject.status=  user.first_name + "'s Profile";
            
            $scope.mostCommentFileName = user.most_comments_fileName;
            $scope.most_recent_FileName = user.most_recent_fileName;
            $scope.most_recent_date = user.most_recent_date ;

            $rootScope.most_recent_FileName = $scope.most_recent_FileName;
            $rootScope.mostComments =  $scope.mostCommentFileName;

            

            console.log("Most recent: "+ $scope.mostCommentFileName );
            console.log("Most comments: " + $scope.mostCommentFileName);
            // console.log("photo with most comments: " + $scope.mostCommentsId);
            // console.log("photo most recently uploaded" +  $scope.most_recent_id);
    })

    $scope.mostRecent = function(){
        $location.path("/most-recent");
    }
    $scope.mostComments = function(){
        $location.path("/most-comments");
    }


  }]);
