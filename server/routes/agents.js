var express = require('express');
var dbService = require('../db/db.service');
var constants = require('../constants');
var router = express.Router();

module.exports = router;
var config = require('../config');
var plivoApi = config.plivoApi;

router.post('/register_agent', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   if (!data.email_id || !data.name || !data.user_name) {
      response.status(500).send(new Error('Name / Email / User Name can not left blank'));
      return;
   }

   var letterNumber = /^[0-9a-zA-Z]+$/;
   if (!(data.user_name.match(letterNumber))) {
      alert('in name only alphanumeric is required.');
      response.status(500).send(new Error('Username can not have special characters, it should contain only alphanumeric.'));
      return;
   }
   var agentData = {};
   agentData[constants.SCHEMA_AGENTS.NAME] = data.name;
   agentData[constants.SCHEMA_AGENTS.EMAIL_ID] = data.email_id;
   agentData[constants.SCHEMA_AGENTS.PHONE_NUMBER] = data.phone_number;
   agentData[constants.SCHEMA_AGENTS.SIP_PASSWORD] = data.email_id;
   agentData[constants.SCHEMA_AGENTS.STATUS_ID] = constants.USER_TYPES.AGENT;
   agentData[constants.SCHEMA_AGENTS.TYPE_ID] = constants.USER_TYPES.AGENT;

   var userData = {};
   userData[constants.SCHEMA_USERS.NAME] = data.name;
   userData[constants.SCHEMA_USERS.EMAIL_ID] = data.email_id;
   userData[constants.SCHEMA_USERS.PHONE_NUMBER] = data.phone_number;
   userData[constants.SCHEMA_USERS.USER_NAME] = data.user_name;
   userData[constants.SCHEMA_USERS.PASSWORD] = data.user_name;
   userData[constants.SCHEMA_USERS.STATUS_ID] = constants.USER_STATUS.ACTIVE;
   userData[constants.SCHEMA_USERS.TYPE_ID] = constants.USER_TYPES.AGENT;

   try {
      dbService.insert([{ $table: constants.SCHEMA_NAMES.USERS, $insert: [userData] }], function (err, result) {
         if (err) {
            writeLog('users err: ', err);
            response.status(500).send(err);
         } else {
            var userId = result.users[0].insertId;
            agentData[constants.SCHEMA_AGENTS.USER_ID] = userId;
            dbService.insert([{ $table: constants.SCHEMA_NAMES.AGENTS, $insert: [agentData] }], function (err, agentResult) {
               if (err) {
                  writeLog('agent err: ', err);
                  response.status(500).send(err);
               } else {
                  response.end(JSON.stringify(agentResult));
                  // create endpoint
                  var agentId = agentResult.agents[0].insertId;
                  var agentStatus = {};
                  agentStatus[constants.SCHEMA_AGENT_STATUS.AGENT_ID] = agentId;
                  agentStatus[constants.SCHEMA_AGENT_STATUS.STATUS_ID] = constants.AGENT_STATUS_TYPES.OFF_LINE;
                  agentStatus[constants.SCHEMA_AGENT_STATUS.USER_ID] = userId;
                  dbService.insert([{ $table: constants.SCHEMA_NAMES.AGENT_STATUS, $insert: [agentStatus] }], function (err, agentResult) {
                     createEndPoint(data, function (err, endPointResult) {
                        var params = {
                           'endpoint_id': endPointResult.endpoint_id // ID of the endpoint for which the details have to be retrieved
                        };
                        plivoApi.get_endpoint(params, function (status, endpointDetailResponse) {
                           var updateAgentData = {};
                           updateAgentData[constants.SCHEMA_AGENTS.SIP] = endpointDetailResponse.sip_uri;
                           updateAgentData[constants.SCHEMA_AGENTS.SIP_USER_NAME] = endpointDetailResponse.username;
                           updateAgentData[constants.SCHEMA_AGENTS.SIP_ID] = endpointDetailResponse.endpoint_id;
                           updateAgentData[constants.SCHEMA_AGENTS.SIP_APP_ID] = endpointDetailResponse.api_id;
                           dbService.update([{ $table: constants.SCHEMA_NAMES.AGENTS, $update: updateAgentData, $filter: constants.SCHEMA_AGENTS.ID + "=" + agentId }], function (err, agentResult) {
                              if (err) {
                                 writeLog('agent err: ', err);
                              } else {
                                 //writeLog('agent agentResult: ', agentResult);
                              }
                           })
                        });
                     });
                  });
               }
            })
         }
      })
   } catch (err) {
      response.status(500).send(err);
   }
});

function createEndPoint(agentData, cb) {
   var params = {
      username: agentData.user_name, // The username for the endpoint to be created
      password: agentData.email_id, // The password for your endpoint username
      alias: agentData.user_name, // Alias for this endpoint
      app_id: '15250876692469854'
   };

   plivoApi.create_endpoint(params, function (status, response) {
      writeLog('create_endpoint Status: ', status);
      writeLog('create_endpoint API Response:\n', response);
      if (status >= 200 && status <= 300) {
         cb(null, response);
      } else {
         cb(new Error(JSON.stringify({ msg: 'User not created', message: response })));
      }
   });
}

router.get('/agents', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('/agents/ data: ', data);

   var query = {
      $table: constants.SCHEMA_NAMES.AGENTS,
      $filter: null,
      limit: data.limit || 100
   };
   dbService.query(query, function (err, customerResult) {
      if (err) {
         writeLog('customer list err: ', err);
         response.status(500).send(err);
      } else {
         response.send(JSON.stringify(customerResult));
      }
   });
});

function writeLog(log1, log2) {
   // console.log(log1 + (log2 ? JSON.stringify(log2) : ""));
}