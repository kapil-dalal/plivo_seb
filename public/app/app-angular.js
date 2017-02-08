var app = angular.module('plivo', [
   'ui.router',
   //  'ngWebSocket'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
   console.log('app config');

   $urlRouterProvider.otherwise("/home");

   $stateProvider
      .state('home', {
         url: '/home',
         templateUrl: 'app/home/home.controller.html',
         controller: 'homeController'
      })
      .state('call', {
         url: '/call',
         templateUrl: 'app/phone/phone.controller.html',
         controller: 'phoneController'
      });
}).run(function ($rootScope, $templateCache) {
   $rootScope.$on('$viewContentLoaded', function () {
      console.log('content loaded');
      $templateCache.removeAll();
   });
});;