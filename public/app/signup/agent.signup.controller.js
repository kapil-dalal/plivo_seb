app.controller('signupAgentController', ["$scope", '$state', 'httpService',
   function ($scope, $state, httpService) {
      console.log('signupAgentController called');

      $scope.name = '';
      $scope.email_id = '';
      $scope.phone_number = '';
      $scope.user_name = '';
      $scope.password = '';
      $scope.cpassword = '';

      $scope.createAgent = function () {
         if ($scope.password != $scope.cpassword) {
            alert('password and confirm password not match.');
            return;
         }
         if (!$scope.name || $scope.name.length == 0) {
            alert('name is required.');
            return;
         }

         if (!$scope.email_id || $scope.email_id.length == 0) {
            alert('email is required.');
            return;
         }
         if (!$scope.phone_number || $scope.phone_number.length == 0) {
            alert('phone number is required.');
            return;
         }
         if (!$scope.user_name || $scope.user_name.length == 0) {
            alert('user name is required.');
            return;
         }

         var letterNumber = /^[0-9a-zA-Z]+$/;
         if (!($scope.user_name.match(letterNumber))) {
            alert('Username can not have special characters, it should contain only alphanumeric.');
            return;
         }

         if (!$scope.password || $scope.password.length == 0) {
            alert('password is required.');
            return;
         }

         var agentForm = {
            name: $scope.name,
            email_id: $scope.email_id,
            phone_number: $scope.phone_number,
            user_name: $scope.user_name,
            password: $scope.password
         }
         console.log('agentForm: ', agentForm);
         httpService.createAgent(agentForm,
            function (response) {
               console.log("controller createAgent response: ", response);
               $state.go('call');
            },
            function (err) {
               console.log("controller createAgent err: ", err);
            })
      }
   }]);