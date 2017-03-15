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
   function getWaitingCallsAndFreeAgents() {
      var callDetailsQuery = {
         $table: constants.SCHEMA_NAMES.CALL_DETAILS,
         $filter: constants.SCHEMA_CALL_DETAILS.STATUS_ID + '="' + constants.CALL_STATUS.WAITING + '"',
         $limit: 10
      };

      var freeAgentQuery = {
         $table: constants.SCHEMA_NAMES.AGENT_STATUS,
         $filter: constants.SCHEMA_AGENT_STATUS.STATUS_ID + '="' + constants.AGENT_STATUS_TYPES.FREE + '"',
         $limit: 10
      };
      dbService.query(callDetailsQuery, function (err, callDetailsResult) {
         if (err) {
            console.log('callDetailsQuery error: ', err);
            setTimeout(function () {
               getWaitingCallsAndFreeAgents();
            }, 5000);
         } else {
            dbService.query(freeAgentQuery, function (err, freeAgentResult) {
               if (err) {
                  console.log('freeAgentQuery error: ', err);
                  setTimeout(function () {
                     getWaitingCallsAndFreeAgents();
                  }, 5000);
               } else {
                  transferCallToAgents(0, callDetailsResult, freeAgentResult, function () {
                     if (callDetailsResult && freeAgentResult && callDetailsResult.length > 0 && callDetailsResult.length == freeAgentResult.length) {
                        getWaitingCallsAndFreeAgents();
                     } else {
                        setTimeout(function () {
                           getWaitingCallsAndFreeAgents();
                        }, 5000);
                     }
                  })
               }
            })
         }
      });
   }
   getWaitingCallsAndFreeAgents();

   function transferCallToAgents(i, callDetailsResult, freeAgentResult, cb) {
      if (!callDetailsResult)
         callDetailsResult = [];
      if (!freeAgentResult)
         freeAgentResult = [];
      var callData = callDetailsResult[i];
      if (callData) {
         var callUuid = callData[constants.SCHEMA_CALL_DETAILS.CALL_UUID];
         var agentData = freeAgentResult[0];
         if (agentData) {
            freeAgentResult.splice(0, 1);

            var agentDetailQuerys = {
               $table: constants.SCHEMA_NAMES.AGENTS,
               $filter: constants.SCHEMA_AGENTS.ID + '="' + agentData[constants.SCHEMA_AGENT_STATUS.AGENT_ID] + '"',
            };
            dbService.query(agentDetailQuerys, function (err, agentDetails) {
               agentDetails = agentDetails[0];
               if (agentDetails) {
                  var sip = agentDetails[constants.SCHEMA_AGENTS.SIP];
                  transferCall(callUuid, sip);
                  agentStatus.updateAgentStatusagentDetails(agentDetails[constants.SCHEMA_AGENTS.ID], constants.AGENT_STATUS_TYPES.ENGAGED, callUuid, function () {
                     if (err) {
                        console.log('updateAgentStatusagentDetails error: ', err);
                        if (callDetailsResult.length > i) {
                           i++;
                           transferCallToAgents(i, callDetailsResult, freeAgentResult, cb);
                        } else {
                           cb();
                        }
                     } else {
                        var callUpdate = {}
                        callUpdate[constants.SCHEMA_CALL_DETAILS.STATUS_ID] = constants.CALL_STATUS.IN_PROGRESS;
                        callUpdate[constants.SCHEMA_CALL_DETAILS.AGENT_ID] = agentDetails[constants.SCHEMA_AGENTS.ID];
                        var updates = [
                           {
                              $table: constants.SCHEMA_NAMES.CALL_DETAILS,
                              $update: callUpdate,
                              $filter: constants.SCHEMA_CALL_DETAILS.CALL_UUID + "='" + callUuid + "'"
                           }
                        ];
                        dbService.update(updates, function (err, result) {
                           if (callDetailsResult.length > i) {
                              i++;
                              transferCallToAgents(i, callDetailsResult, freeAgentResult, cb);
                           } else {
                              cb();
                           }
                        })
                     }
                  })
               } else {
                  if (callDetailsResult.length > i) {
                     i++;
                     transferCallToAgents(i, callDetailsResult, freeAgentResult, cb);
                  } else {
                     cb();
                  }
               }
            });
         } else {
            cb();
         }
      } else {
         if (callDetailsResult.length > i) {
            i++;
            transferCallToAgents(i, callDetailsResult, freeAgentResult, cb);
         } else {
            cb();
         }
      }
   }
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

function transferCall(callUuid, sip) {
   var params = {
      "legs": "aleg",
      'call_uuid': callUuid, // ID of the call
      'aleg_url': 'https://35.165.241.189:3010/dial/' + sip + '/',
      'aleg_method': "GET"
   };

   plivoApi.transfer_call(params, function (status, response) {
      writeLog('transfer_call Status: ', status);
      writeLog('transfer_call API Response:\n', response);
   });
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

function outboundCall(request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('receive_customer_call outboundCall: ', data);

   var errorMsg = "Something happen wrong. please try after some time";
   var connectingMessage = "connecting your call.";
   var r = plivo.Response();
   var from = data.From;
   var to = data.To;
   try {
      var query = { $table: constants.SCHEMA_NAMES.AGENTS, $filter: constants.SCHEMA_AGENTS.SIP + ' = "' + from + '"' };
      dbService.query(query, function (err, agentResult) {
         if (err) {
            r.addSpeak(errorMsg);
            sendResponse(response, r);
            return;
         }
         agentResult = agentResult[0];
         if (agentResult) {
            var callDetailData = {};
            callDetailData[constants.SCHEMA_CALL_DETAILS.TO_CUSTOMER_NUMBER] = data.To;
            callDetailData[constants.SCHEMA_CALL_DETAILS.CALL_UUID] = data.CallUUID;
            callDetailData[constants.SCHEMA_CALL_DETAILS.DIRECTION] = constants.CALL_TYPES.OUTBOUND;
            callDetailData[constants.SCHEMA_CALL_DETAILS.DATE] = constants.formatDate(new Date()).date;
            callDetailData[constants.SCHEMA_CALL_DETAILS.JOIN_TIME] = constants.formatDate(new Date()).time;
            callDetailData[constants.SCHEMA_CALL_DETAILS.STATUS_ID] = constants.CALL_STATUS.IN_PROGRESS;
            callDetailData[constants.SCHEMA_CALL_DETAILS.AGENT_ID] = agentResult[constants.SCHEMA_AGENTS.ID];
            var callDetails = [
               {
                  $table: constants.SCHEMA_NAMES.CALL_DETAILS,
                  $insert: [
                     callDetailData
                  ]
               }
            ];
            dbService.insert(callDetails, function (err, callDetailsResult) {
               if (err) {
                  console.log('confrence_callback callDetails err: ', err);
               }
            })
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
      console.log('err: ', err);
      r.addSpeak(errorMsg);
      sendResponse(response, r);
   }
}

function sendResponse(response, r) {
   response.set({
      'Content-Type': 'text/xml'
   });
   response.end(r.toXML());
}

router.all('/hangup_customer_call/', function (request, response) {
   response.end('');

   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;

   var callDetailsQuery = {
      $table: constants.SCHEMA_NAMES.CALL_DETAILS,
      $filter: constants.SCHEMA_CALL_DETAILS.CALL_UUID + '="' + data.CallUUID + '"',
   };

   dbService.query(callDetailsQuery, function (err, callDetailsResult) {
      if (callDetailsResult && callDetailsResult[0]) {
         callDetailsResult = callDetailsResult[0];
         let callStatus = callDetailsResult[constants.SCHEMA_CALL_DETAILS.STATUS_ID];
         var callUpdate = {}
         callUpdate[constants.SCHEMA_CALL_DETAILS.STATUS_ID] = constants.CALL_STATUS.COMPLETED;
         callUpdate[constants.SCHEMA_CALL_DETAILS.END_TIME] = constants.formatDate(new Date()).time;
         callUpdate[constants.SCHEMA_CALL_DETAILS.DURATION] = data.Duration;
         callUpdate[constants.SCHEMA_CALL_DETAILS.BILLED_DURATION] = data.BillDuration;
         callUpdate[constants.SCHEMA_CALL_DETAILS.AMOUNT] = data.TotalCost;
         if (callStatus == constants.CALL_STATUS.WAITING) {
            callUpdate[constants.SCHEMA_CALL_DETAILS.STATUS_ID] = constants.CALL_STATUS.NOT_ANSWERED;
         }
         var callUpdates = [
            {
               $table: constants.SCHEMA_NAMES.CALL_DETAILS,
               $update: callUpdate,
               $filter: constants.SCHEMA_CALL_DETAILS.CALL_UUID + "='" + data.CallUUID + "'"
            }
         ];
         dbService.update(callUpdates, function (err, result) {
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
         })
      }
   });
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
   // console.log('call on uri /confrence_callback/ to hold call data: ', data);
   response.set({
      'Content-Type': 'text/xml'
   });
   response.send();
   // TODO: create new call record with status waiting
   var callDetailData = {};
   callDetailData[constants.SCHEMA_CALL_DETAILS.FROM_CUSTOMER_ID] = data.To;
   callDetailData[constants.SCHEMA_CALL_DETAILS.CALL_UUID] = data.CallUUID;
   callDetailData[constants.SCHEMA_CALL_DETAILS.DIRECTION] = constants.CALL_TYPES.INBOUND;
   callDetailData[constants.SCHEMA_CALL_DETAILS.DATE] = constants.formatDate(new Date()).date;
   callDetailData[constants.SCHEMA_CALL_DETAILS.JOIN_TIME] = constants.formatDate(new Date()).time;
   callDetailData[constants.SCHEMA_CALL_DETAILS.STATUS_ID] = constants.CALL_STATUS.WAITING;
   if (data.ConferenceAction != "exit") {
      var callDetails = [
         {
            $table: constants.SCHEMA_NAMES.CALL_DETAILS,
            $insert: [
               callDetailData
            ]
         }
      ];
      dbService.insert(callDetails, function (err, callDetailsResult) {
         if (err) {
            // TODO: disconnect the call
            console.log('confrence_callback callDetails err: ', err);
         } else {
            // console.log('confrence_callback callDetailsResult: ', callDetailsResult);
         }
      })
   } else {
      // TODO: update status of call
   }
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

router.all('/dial/:sip', function (request, response) {
   writeLog('call on uri /dial/');
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('/dial/ data: ', data);

   var mySIP = request.param('sip'); //'sip:agent1170223182308@phone.plivo.com';
   writeLog('/dial/ to call sip: ', mySIP);
   var params = {
      'dialMusic': request.protocol + '://' + request.headers.host + "/custom_ringing_tone/"
   };
   var r = plivo.Response();

   var record_params = {
      'action': 'https://35.165.241.189:3010/record_action/', // Submit the result of the record to this URL
      'method': "GET", // HTTP method to submit the action URL
      // 'callbackUrl': "https://intense-brook-8241.herokuapp.com/record_callback/", // If set, this URL is fired in background when the recorded file is ready to be used.
      // 'callbackMethod': "GET" // Method used to notify the callbackUrl.
   }

   r.addRecord(record_params)


   var dial_element = r.addDial(params);
   dial_element.addUser(mySIP);
   var xml = r.toXML();
   writeLog('dial XML: ', xml);
   response.set({
      'Content-Type': 'text/xml'
   });
   response.end(xml);
});

router.all('/record_action/', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('/record_action/ data: ', data);

   var record_url = request.param('RecordUrl');
   var record_duration = request.param('RecordingDuration');
   var record_id = request.param('RecordingID');

   console.log('Record Url : ' + record_url + ' Recording Duration : ' + record_duration + ' Recording ID : ' + record_id);

   response.set({
      'Content-Type': 'text/xml'
   });
   response.send();

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

function writeLog(log1, log2) {
   // console.log(log1 + (log2 ? JSON.stringify(log2) : ""));
}
