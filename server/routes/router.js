var express = require('express');
var dbService = require('../db/db.service');
var agentStatus = require('../agent_status/agent.status');
var constants = require('../constants');
var router = express.Router();

module.exports = router;
var plivo = require('plivo');
var plivoApi = plivo.RestAPI({
   authId: 'SAMZHMYMQ2NMFJMWM0OW',
   authToken: 'MjYwYTM1N2Y3NGNlNmZiNDJiN2U4MGZhYzY2NmE5'
});
var PLIVO_SONG = "https://s3.amazonaws.com/plivocloud/music.mp3";

var IVR_MESSAGE1 = "Welcome to the Plivo. Press 1 to forward the call. Press 2 to call on S.I.P. Press 3 for connect directly. Press 4 for wait to receive call.";

var NO_INPUT_MESSAGE = "Sorry, I didn't catch that. Please hangup and try again later.";

setTimeout(function () {
   console.log('router js');

}, 10000);

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
   plivoApi.make_call(params, function (status, response) {
      writeLog('Status: ', status);
      writeLog('API Response:\n', response);
   });

});

// router.all('/receive_customer_call/', function (request, response) {
//    var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
//    writeLog('receive_customer_call: ', data);
//    var from = data.From;
//    if (from === constants.FROM_SIP || data.To === constants.TO_NUMBER) {
//       inboundCallOld(request, response);
//    } else {
//       outboundCall(request, response);
//    }

// });

function inboundCallOld(request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('inbound data: ', data);

   var speakBusy = "All lines are busy. Please call after some time.";
   var speakForward = "Thanks for calling. We are forwarding call to our customer care support.";
   var speakError = "error got";
   try {
      var r = plivo.Response();
      agentStatus.getFreeAgent(function (err, agentDetail) {
         if (err) {
            writeLog('get free agent error: ', err);
            r.addSpeak(speakError);
            sendResponse(response, r);
         } else {
            if (agentDetail) {
               agentStatus.updateAgentStatusagentDetails(agentDetail[constants.SCHEMA_AGENTS.ID], constants.AGENT_STATUS_TYPES.ENGAGED, data.CallUUID, function () {
                  if (err) {
                     writeLog('get free agent error: ', err);
                     r.addSpeak(speakError);
                     sendResponse(response, r);
                  } else {
                     writeLog('call is forwarding: ', agentDetail);

                     transferCall(data, agentDetail);

                     r.addSpeak(speakForward);
                     writeLog('forward call xml: ', r.toXML());
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
      writeLog('receive_customer_call error: ', err);
      r.addSpeak(speakError);
      sendResponse(response, r);
   }
}

function transferCall(callUuid, sip) {
   var params = {
      "legs": "aleg",
      'call_uuid': callUuid, // ID of the call
      'aleg_url': request.protocol + '://' + request.headers.host + "/dial/" + sip + "/",
      'aleg_method': "GET"
   };

   plivoApi.transfer_call(params, function (status, response) {
      writeLog('transfer_call Status: ', status);
      writeLog('transfer_call API Response:\n', response);
   });
}

function outboundCall(request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('receive_customer_call outboundCall: ', data);
   var from = data.From;
   var to = data.To;
   var r = plivo.Response();
   var errorMsg = "Something happen wrong. please try after some time";
   var connectingMessage = "connecting your call.";
   try {
      var query = { $table: constants.SCHEMA_NAMES.AGENTS, $filter: constants.SCHEMA_AGENTS.SIP + ' = "' + from + '"' };
      dbService.query(query, function (err, result) {
         if (err) {
            r.addSpeak(errorMsg);
            sendResponse(response, r);
            return;
         }
         result = result[0];
         if (result) {
            var agentStatusUpdate = {}
            agentStatusUpdate[constants.SCHEMA_AGENT_STATUS.STATUS_ID] = constants.AGENT_STATUS_TYPES.ENGAGED;
            agentStatusUpdate[constants.SCHEMA_AGENT_STATUS.CALL_UUID] = data.CallUUID;
            var updates = [
               {
                  $table: constants.SCHEMA_NAMES.AGENT_STATUS,
                  $update: agentStatusUpdate,
                  $filter: constants.SCHEMA_AGENT_STATUS.AGENT_ID + "='" + data.CallUUID + "'"
               }
            ];
            dbService.update(updates, function (err, result) {

            })
            r.addSpeak(connectingMessage);
            var d = r.addDial();
            d.addNumber(to);
            sendResponse(response, r);
         } else {
            r.addSpeak(errorMsg);
            sendResponse(response, r);
         }
      });
   } catch (err) {
      r.addSpeak(errorMsg);
      sendResponse(response, r);
   }
}

router.all('/hangup_customer_call/', function (request, response) {
   response.end('');

   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('hangup_customer_call: ', data);

   var agentStatusUpdate = {}
   agentStatusUpdate[constants.SCHEMA_AGENT_STATUS.STATUS_ID] = constants.AGENT_STATUS_TYPES.FREE;
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

   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('receive_customer_call: ', data);
   if (data.From === constants.FROM_SIP || data.To === constants.TO_NUMBER) {
      addCallToConference(request, response, data);
   } else {
      outboundCall(request, response);
   }
});

function addCallToConference(request, response, data) {
   var plivoResponse = plivo.Response();
   plivoResponse.addSpeak("Thanks for calling. Please wait.");
   var params = {
      callbackUrl: request.protocol + '://' + request.headers.host + "/confrence_callback/",
      callbackMethod: "GET",
      waitSound: request.protocol + '://' + request.headers.host + "/custom_ringing_tone/"
   };

   var conference_name = "" + data.CallUUID; // Conference Room name
   plivoResponse.addConference(conference_name, params);
   writeLog(plivoResponse.toXML());

   response.set({ 'Content-Type': 'text/xml' });
   response.end(plivoResponse.toXML());

   // TODO: save call details
}

router.all('/confrence_callback/', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('call on uri /confrence_callback/ to hold call data: ', data);
   response.set({
      'Content-Type': 'text/xml'
   });
   response.send();
   // TODO: create new call record with status waiting
   var callDetailData = {};
   callDetailData[constants.SCHEMA_CALL_DETAILS.FROM_CUSTOMER_ID] = data.To;
   callDetailData[constants.SCHEMA_CALL_DETAILS.CALL_UUID] = data.callUuid;
   callDetailData[constants.SCHEMA_CALL_DETAILS.DIRECTION] = constants.CALL_TYPES.INBOUND;
   callDetailData[constants.SCHEMA_CALL_DETAILS.DATE] = new Date();
   callDetailData[constants.SCHEMA_CALL_DETAILS.STATUS_ID] = constants.CALL_STATUS.WAITING;
   var callDetails = [
      {
         $table: constants.SCHEMA_NAMES.CALL_DETAILS,
         $insert: [
            callDetailData
         ]
      }
   ];
   console.log('callDetails: ' + JSON.stringify(callDetails));
   // TODO: transfer call if agent is free
   // inboundCall(data.CallUUID);

});

function inboundCall(callUuid, sip) {
   try {
      if (!sip) {
         agentStatus.getFreeAgent(function (err, agentDetail) {
            if (err) {
               writeLog('get free agent error: ', err);
               // TODO: hangup the call/conference
            } else {
               if (agentDetail) {
                  agentStatus.updateAgentStatusagentDetails(agentDetail[constants.SCHEMA_AGENTS.ID], constants.AGENT_STATUS_TYPES.ENGAGED, callUuid, function () {
                     if (err) {
                        writeLog('get free agent error: ', err);
                        // TODO: hangup the call/conference
                     } else {
                        writeLog('call is forwarding: ', agentDetail);
                        transferCall(callUuid, agentDetail[constants.SCHEMA_AGENTS.SIP]);
                     }
                  })
               }
            }
         });
      } else {
         transferCall(callUuid, sip);
      }
   } catch (err) {
      writeLog('receive_customer_call error: ', err);
      // TODO: hangup the call/conference
   }
}

router.all('/user_selection/:to', function (request, response) {
   require('./user_selection').userSelection(request, response, function (result) {
      response.set({
         'Content-Type': 'text/xml'
      });
      response.send(result);
   });
});

router.get('/forward_call/', function (req, res) {
   writeLog('call is forwarding');
   var r = plivo.Response();
   r.addSpeak('Connecting your call');
   var d = r.addDial();
   d.addNumber("+918588842775");
   writeLog(r.toXML());

   res.set({
      'Content-Type': 'text/xml'
   });
   res.end(r.toXML());
});

router.all('/custom_ringing_tone/', function (request, response) {
   var r = plivo.Response();

   r.addPlay("https://s3.amazonaws.com/plivocloud/music.mp3");
   writeLog('custom_ringing_tone: ' + r.toXML());

   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('/custom_ringing_tone/ to queue call data: ', data);
   response.set({
      'Content-Type': 'text/xml'
   });
   response.end(r.toXML());

});

router.all('/dial/', function (request, response) {
   writeLog('call on uri /dial/');
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('/dial/ to hold call data: ', data);

   var mySIP = 'sip:agent1170223182308@phone.plivo.com';
   var r = plivo.Response();
   var dial_element = r.addDial();
   dial_element.addUser(mySIP);
   var xml = r.toXML();
   writeLog('dial XML: ', xml);
   response.set({
      'Content-Type': 'text/xml'
   });
   response.end(xml);
});

router.all('/play/', function (request, response) {
   writeLog('call on uri /play/');
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('/play/ to hold call data: ', data);
   // var params = {
   //    call_uuid: data.CallUUID,
   //    urls: "https://s3.amazonaws.com/plivocloud/music.mp3",
   //    length: 120,
   // };
   // writeLog('/play/ to hold call params: ', params);
   // plivoApi.play(params, function (status, holeResponse) {
   //    writeLog('/play/ after request post call Status: ', status);
   //    writeLog('/play/ after request post call holeResponse: ', holeResponse);
   // });


   response.send();
});

router.get('/speak/', function (request, response) {
   // Generate a Speak XML with the details of the text to play on the call.
   var r = plivo.Response();
   writeLog('get /speak/ received');
   r.addSpeak('Hello, you just received your first call');
   writeLog(r.toXML());
   writeLog('API Response:\n', response);
   response.set({ 'Content-Type': 'text/xml' });
   response.send(r.toXML());
});

function writeLog(log1, log2) {
   // console.log(log1 + (log2 ? JSON.stringify(log2) : ""));
}



// writeLog('request: ', request.query);
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

// router.all('/user_selection/', function (request, response) {
//    var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
//    writeLog('receive_customer_call: ', data);

//    // var params = {
//    //    'call_uuid': '55309cee-821d-11e4-9a73-498d468c930b' // ID of the call.
//    // };

//    // // Prints the complete response
//    // plivoApi.get_cdr(params, function (status, response) {
//    //    console.log('Status: ', status);
//    //    console.log('API Response:\n', response);
//    // });

//    require('./user_selection').userSelection(request, response, function (result) {
//       response.send(result);
//    });
// });