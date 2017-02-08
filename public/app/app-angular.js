var app = angular.module('plivo', [
   'ui.router',
   //  'ngWebSocket'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
   console.log('app config');

   $urlRouterProvider.otherwise("/call");

   $stateProvider
      .state('home', {
         url: '/home',
         templateUrl: 'app/home/home.controller.html',
         controller: 'homeController'
      })
      .state('call', {
         url: '/call',
         templateUrl: 'app/contact/contact.controller.html',
         controller: 'contactController'
      });
}).run(function ($rootScope, $templateCache) {
   $rootScope.$on('$viewContentLoaded', function () {
      console.log('content loaded');
      $templateCache.removeAll();
   });
});;