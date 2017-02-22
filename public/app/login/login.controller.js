app.controller('loginController', ["$rootScope", "$scope", "$state", "httpService",
   function ($rootScope, $scope, $state, httpService) {
      console.log('loginController called');
      $scope.user_name = undefined;
      $scope.password = undefined;

      $scope.login = function () {
         if (!$scope.user_name || $scope.user_name.length == 0) {
            alert('user name is required.');
            return;
         }
         if (!$scope.password || $scope.password.length == 0) {
            alert('password is required.');
            return;
         }
         var loginData = {
            user_name: $scope.user_name,
            password: $scope.password
         }
         console.log('loginData: ', loginData);
         httpService.login(loginData,
            function (result) {
               console.log('login success.', result);
               $rootScope.agentDetails = result.data;
               sessionStorage.agentDetails = JSON.stringify(result.data);
               $state.go("dashboard");
            },
            function (err) {
               console.log('login error:', err);

            });
      }
   }]);