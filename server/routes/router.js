var express = require('express');
var router = express.Router();

module.exports = router;
var plivo = require('plivo');
var p = plivo.RestAPI({
   authId: 'MAM2M4ZGE3NJIWMGRIM2',
   authToken: 'MzhlYjBhOGExNGQ0NzI0ZDY4YjFkOWM4MzEwNjI3'
});
var PLIVO_SONG = "https://s3.amazonaws.com/plivocloud/music.mp3";

var IVR_MESSAGE1 = "Welcome to the Plivo. Press 1 to forward the call. Press 2 to call on S.I.P. Press 3 for connect directly. Press 4 for wait to receive call.";

var NO_INPUT_MESSAGE = "Sorry, I didn't catch that. Please hangup and try again later.";

router.get('/make_call', function (req, res) {
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

router.get('/receive_call/', function (request, response) {
   console.log('request: ', request.query);
   var data = request.query;

   var r = plivo.Response();
   var getdigits_action_url, params, getDigits;
   getdigits_action_url = request.protocol + '://' + request.headers.host + '/user_selection/' + data.To;
   params = {
      'action': getdigits_action_url,
      'method': 'POST',
      'timeout': '7',
      'numDigits': '1',
      'retries': '1'
   };
   getDigits = r.addGetDigits(params);
   getDigits.addSpeak(IVR_MESSAGE1);
   r.addSpeak(NO_INPUT_MESSAGE);
   params_wait = {
      'length': "1"
   };
   r.addWait(params_wait);
   response.set({ 'Content-Type': 'text/xml' });
   response.end(r.toXML());
});

router.all('/user_selection/:to', function (request, response) {
   require('./user_selection').userSelection(request, response, function (result) {
      response.set({
         'Content-Type': 'text/xml'
      });
      response.send(result);
   });
});

router.get('/forward_call/', function (req, res) {
   console.log('call is forwarding');
   var r = plivo.Response();
   r.addSpeak('Connecting your call');
   var d = r.addDial();
   d.addNumber("+918588842775");
   console.log(r.toXML());

   res.set({
      'Content-Type': 'text/xml'
   });
   res.end(r.toXML());
});

router.all('/custom_ringing_tone/', function (request, response) {
   var r = plivo.Response();

   r.addPlay("https://s3.amazonaws.com/plivocloud/music.mp3");
   console.log('custom_ringing_tone: ' + r.toXML());

   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('/custom_ringing_tone/ to queue call data: ', data);

   setTimeout(function () {
      var params = {
         'call_uuid': data.CallUUID
      };
      console.log('after 20 second to transfer the call: ', params);
      p.get_cdr(params, function (status, response) {
         console.log('call details status: ', status);
         console.log('call details API Response: ', response);
         var plivoResponse = plivo.Response();
         var params = {
            callerId: data.From,
            dialMusic: request.protocol + '://' + request.headers.host + "/custom_ringing_tone/" // Music to be played to the caller while the call is being connected.
         };
         var mySIP = 'sip:kapilagent1170208155150@phone.plivo.com';
         var dial_element = plivoResponse.addDial(params);
         dial_element.addUser(mySIP);
         // dial_element.addNumber('+918588842775');

         plivoResponse.addSpeak('Connecting your call');
         // response.send(plivoResponse.toXML());

      });
   }, 20000);

   response.set({
      'Content-Type': 'text/xml'
   });
   response.end(r.toXML());

});

router.all('/confrence_callback/', function (request, response) {
   console.log('call on uri /confrence_callback/');
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('/confrence_callback/ to hold call data: ', data);
   // var params = {
   //    call_uuid: data.CallUUID,
   //    urls: "https://s3.amazonaws.com/plivocloud/music.mp3",
   //    length: 120,
   // };
   // console.log('/play/ to hold call params: ', params);
   // p.play(params, function (status, holeResponse) {
   //    console.log('/play/ after request post call Status: ', status);
   //    console.log('/play/ after request post call holeResponse: ', holeResponse);
   // });


   response.send();
});

router.all('/play/', function (request, response) {
   console.log('call on uri /play/');
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('/play/ to hold call data: ', data);
   // var params = {
   //    call_uuid: data.CallUUID,
   //    urls: "https://s3.amazonaws.com/plivocloud/music.mp3",
   //    length: 120,
   // };
   // console.log('/play/ to hold call params: ', params);
   // p.play(params, function (status, holeResponse) {
   //    console.log('/play/ after request post call Status: ', status);
   //    console.log('/play/ after request post call holeResponse: ', holeResponse);
   // });


   response.send();
});

router.get('/speak/', function (request, response) {
   // Generate a Speak XML with the details of the text to play on the call.
   var r = plivo.Response();
   console.log('get /speak/ received');
   r.addSpeak('Hello, you just received your first call');
   console.log(r.toXML());
   console.log('API Response:\n', response);
   response.set({ 'Content-Type': 'text/xml' });
   response.send(r.toXML());
});