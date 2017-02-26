var app = angular.module('plivo', [
   'ui.router',
   'ngWebSocket',
   'ngCookies'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
   console.log('app config');

   $urlRouterProvider.otherwise("/home");

   $stateProvider
      .state('login', {
         url: '/login',
         templateUrl: 'app/login/login.controller.html',
         controller: 'loginController'
      })
      .state('home', {
         url: '/home',
         templateUrl: 'app/home/home.controller.html',
         controller: 'homeController'
      })
      .state('contact_us', {
         url: '/contact_us',
         templateUrl: 'app/contact/contact.controller.html',
         controller: 'contactController'
      })
      .state('signupAgent', {
         url: '/signupAgent',
         templateUrl: 'app/signup/agent.signup.controller.html',
         controller: 'signupAgentController'
      })
      .state('dashboard', {
         url: '/dashboard',
         templateUrl: 'app/agent/dashboard/dashboard.controller.html',
         controller: 'dashboardController'
      })
      // .state('dashboard.contacts', {
      //    url: '/contacts',
      //    templateUrl: 'app/contact/contact.controller.html',
      //    controller: 'contactController'
      // })
      ;
}).run(function ($rootScope, $templateCache) {
   $rootScope.$on('$viewContentLoaded', function () {
      console.log('content loaded');
      $templateCache.removeAll();
   });
});;