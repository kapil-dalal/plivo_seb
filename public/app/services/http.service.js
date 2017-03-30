
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

   function createCustomerSession(params, successCB, errorCB) {
      var url = '/customer/session';
      $http.post(url, getParms(params), config)
         .then(
         function (response, status) {
            successCB(response);
         },
         function (err) {
            errorCB(err);
         });
   }

   function getCustomers(successCB, errorCB) {
      var url = '/customer/customers';
      $http.get(url, config)
         .then(
         function (response, status) {
            successCB(response);
         },
         function (err) {
            errorCB(err);
         });
   }

   function sendSMS(params, successCB, errorCB) {
      var url = '/customer/send_sms';
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
      createCustomerSession: createCustomerSession,
      getCustomers: getCustomers,
      sendSMS: sendSMS,

   }

}]);