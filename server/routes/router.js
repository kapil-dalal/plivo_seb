var express = require('express');
var dbService = require('../db/db.service');
var agentStatus = require('../agent_status/agent.status');
var constants = require('../constants');
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

router.all('/receive_customer_call/', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('receive_customer_call: ', data);

   var speakBusy = "All lines are busy. Please call after some time.";
   var speakForward = "Thanks for calling. We are forwarding call to our customer care support.";
   var speakError = "error got";
   try {
      var r = plivo.Response();
      agentStatus.getFreeAgent(function (err, agentDetail) {
         if (err) {
            console.log('get free agent error: ', err);
            r.addSpeak(speakError);
            sendResponse(response, r);
         } else {
            if (agentDetail) {
               agentStatus.updateAgentStatusagentDetails(agentDetail[constants.SCHEMA_AGENTS.ID], constants.AGENT_STATUS_TYPE.ENGAGED, data.CallUUID, function () {
                  if (err) {
                     console.log('get free agent error: ', err);
                     r.addSpeak(speakError);
                     sendResponse(response, r);
                  } else {
                     console.log('call is forwarding: ', agentDetail);

                     r.addSpeak(speakForward);
                     var params = {
                        dialMusic: request.protocol + '://' + request.headers.host + "/custom_ringing_tone/"
                     }
                     var d = r.addDial(params);
                     d.addUser(agentDetail[constants.SCHEMA_AGENTS.SIP]);
                     console.log('forward call xml: ', r.toXML());
                     sendResponse(response, r);
                  }
               })
            } else {
               r.addSpeak(speakBusy);
               sendResponse(response, r);
            }
         }
      });
   } catch (err) {
      console.log('receive_customer_call error: ', err);
      r.addSpeak(speakError);
      sendResponse(response, r);
   }
});

router.all('/hangup_customer_call/', function (request, response) {
   response.end('');

   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('hangup_customer_call: ', data);

   var agentStatusUpdate = {}
   agentStatusUpdate[constants.SCHEMA_AGENT_STATUS.STATUS_ID] = constants.AGENT_STATUS_TYPE.FREE;
   agentStatusUpdate[constants.SCHEMA_AGENT_STATUS.CALL_UUID] = null;
   var updates = [
      {
         $table: constants.SCHEMA_NAMES.AGENT_STATUS,
         $update: agentStatusUpdate,
         $filter: constants.SCHEMA_AGENT_STATUS.CALL_UUID + "='" + data.CallUUID + "'"
      }
   ];
   dbService.update(updates, function (err, result) {

   })
});

function sendResponse(response, r) {
   response.set({
      'Content-Type': 'text/xml'
   });
   response.end(r.toXML());
}

router.get('/receive_call/', function (request, response) {
   // console.log('request: ', request.query);
   // var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;

   // var r = plivo.Response();
   // var getdigits_action_url, params, getDigits;
   // getdigits_action_url = request.protocol + '://' + request.headers.host + '/user_selection/' + data.To;
   // params = {
   //    'action': getdigits_action_url,
   //    'method': 'POST',
   //    'timeout': '7',
   //    'numDigits': '1',
   //    'retries': '1'
   // };
   // getDigits = r.addGetDigits(params);
   // getDigits.addSpeak(IVR_MESSAGE1);
   // r.addSpeak(NO_INPUT_MESSAGE);
   // params_wait = {
   //    'length': "1"
   // };
   // r.addWait(params_wait);


   var plivoResponse = plivo.Response();
   plivoResponse.addSpeak("Thanks for calling. Please wait.");
   var params = {
      callbackUrl: request.protocol + '://' + request.headers.host + "/confrence_callback/",
      callbackMethod: "GET",
      waitSound: request.protocol + '://' + request.headers.host + "/custom_ringing_tone/"
   };

   var conference_name = "My Conf"; // Conference Room name
   plivoResponse.addConference(conference_name, params);
   console.log(plivoResponse.toXML());

   // cb(plivoResponse.toXML());

   response.set({ 'Content-Type': 'text/xml' });
   response.end(plivoResponse.toXML());
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
   response.set({
      'Content-Type': 'text/xml'
   });
   response.end(r.toXML());

});

router.all('/dial/', function (request, response) {
   console.log('call on uri /confrence_callback/');
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('/confrence_callback/ to hold call data: ', data);

   var mySIP = 'sip:kapilagent1170208155150@phone.plivo.com';
   var r = plivo.Response();
   var dial_element = r.addDial();
   dial_element.addUser(mySIP);
   var xml = r.toXML();
   console.log('dial XML: ', xml);
   response.set({
      'Content-Type': 'text/xml'
   });
   response.send(xml);
});

router.all('/confrence_callback/', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('call on uri /confrence_callback/ to hold call data: ', data);
   response.set({
      'Content-Type': 'text/xml'
   });
   response.send();

   // test transfer call
   if (data.Event != 'ConferenceExit') {
      setTimeout(function () {
         var params = {
            "legs": "aleg",
            'call_uuid': data.CallUUID, // ID of the call
            'aleg_url': request.protocol + '://' + request.headers.host + "/dial/",
            'aleg_method': "GET"
            // urls: "https://s3.amazonaws.com/plivocloud/music.mp3",
            // length: 120,
         };
         // var d = {
         //    Direction: 'inbound',
         //    From: 'sip:kapilmakecall170208155025@phone.plivo.com',
         //    ConferenceMemberID: '8398',
         //    CallerName: 'kapilmakecall170208155025',
         //    ConferenceName: 'demo',
         //    ConferenceAction: 'enter',
         //    BillRate: '0.003',
         //    To: 'sip:kapilagent1170208155150@phone.plivo.com',
         //    ConferenceUUID: 'f0a7239c-f92a-11e6-87d6-d3f6ab578519',
         //    CallUUID: 'e7d6125a-f92a-11e6-85a7-d3f6ab578519',
         //    CallStatus: 'in-progress',
         //    Event: 'ConferenceEnter',
         //    ConferenceFirstMember: 'true'
         // }


         var getConParm = {
            conference_id: data.ConferenceName
         }
         console.log('after 20 second to transfer the call getConParm: ', getConParm);
         p.get_live_conference(getConParm, function (status, response) {
            console.log('get_live_conference Status: ', status);
            console.log('get_live_conference API Response:\n', response);
         })
         // p.transfer_call(params, function (status, response) {
         //    console.log('transfer_call Status: ', status);
         //    console.log('transfer_call API Response:\n', response);
         // });
      }, 0);
   }
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