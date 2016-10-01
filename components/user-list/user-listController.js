'use strict';

cs142App.controller('UserListController', ['$scope', '$resource',
    function ($scope, $resource) {
        $scope.main.title = 'Users';
    var UserList= $resource("/user/list");
    UserList.query({}, function(list){
            $scope.users = list;           
    });
}]);

