app.controller('homeController', ['$scope', '$state',
   function ($scope, $state) {
      console.log('homeController called');
      $scope.goToContact = function () {
         console.log('goToContact called');
         $state.go('call');
      }
   }]);