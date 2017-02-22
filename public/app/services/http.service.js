
app.factory('httpService', ['$http', function ($http) {
   'use strict';
   var config = {
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
      }
   }

   function getParms(params) {
      return $.param(params);
   }

   function createAgent(params, successCB, errorCB) {
      var url = '/api/register_agent';
      $http.post(url, getParms(params), config)
         .then(
         function (response, status) {
            successCB(response);
         },
         function (err) {
            errorCB(err);
         });
   }

   function login(params, successCB, errorCB) {
      var url = '/user/login';
      $http.post(url, getParms(params), config)
         .then(
         function (response, status) {
            successCB(response);
         },
         function (err) {
            errorCB(err);
         });
   }

   return {
      createAgent: createAgent,
      login: login,
   }

}]);