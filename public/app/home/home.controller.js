app.controller('homeController', ['$scope', '$state',
   function ($scope, $state) {
      console.log('homeController called');
      $scope.goToContact = function () {
         console.log('goToContact called');
         $state.go('contact_us');
      }

      $scope.goToSignupAgent = function () {
         console.log('goToSignupAgent called');
         $state.go('signupAgent');
      }

      $scope.goToLogin = function () {
         console.log('goToLogin called');
         $state.go('login');
      }
   }]);