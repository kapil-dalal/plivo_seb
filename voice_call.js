var express = require('express');
// var plivo = require('plivo');
var app = express();

// var p = plivo.RestAPI({
//    authId: 'MAYTA5NZA0MZK1NZK3N2',
//    authToken: 'ZDdlNTkyMGFhNWY2YzM4ZGIwN2UxZDRhZmY5NmI1'
// });

app.get('/make_call', function (req, res) {
   var params = {
      'to': '+918588842775', // The phone numer to which the all has to be placed
      'from': '1111111111', // The phone number to be used as the caller id
      'answer_url': "https://intense-brook-8241.herokuapp.com/speak/", // The URL invoked by Plivo when the outbound call is answered
      'answer_method': "GET", // The method used to call the answer_url
      // Example for Asynchrnous request
      // 'callback_url' : "https://intense-brook-8241.herokuapp.com/callback/", // The URL notified by the API response is available and to which the response is sent.
      // 'callback_method' : "GET" // The method used to notify the callback_url.

   };

   // Prints the complete response
   p.make_call(params, function (status, response) {
      console.log('Status: ', status);
      console.log('API Response:\n', response);
   });

});

app.listen(3000, function () {
   console.log('Node app is running on port', app.get('port'));
});
