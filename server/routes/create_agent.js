var express = require('express');
var dbService = require('../db/db.service');
var router = express.Router();

module.exports = router;
var plivo = require('plivo');
var p = plivo.RestAPI({
   authId: 'MAM2M4ZGE3NJIWMGRIM2',
   authToken: 'MzhlYjBhOGExNGQ0NzI0ZDY4YjFkOWM4MzEwNjI3'
});

router.post('/register_agent', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   var agentData = {
      name: data.name,
      email_id: data.email_id,
      phone_number: data.phone_number,
      sip_password: data.email_id,
      status_id: 1, // active agent
      type_id: 2 // agent type
   };
   var userData = {
      name: data.name,
      email_id: data.email_id,
      phone_number: data.phone_number,
      user_name: data.user_name,
      password: data.password,
      status_id: 1, // active user
      type_id: 2 // agent type
   };
   try {
      dbService.insert([{ $table: 'users', $insert: [userData] }], function (err, result) {
         if (err) {
            console.log('users err: ', err);
            response.status(500).send(err);
         } else {
            var userId = result.users[0].insertId;
            agentData.user_id = userId;
            dbService.insert([{ $table: 'agents', $insert: [agentData] }], function (err, agentResult) {
               if (err) {
                  console.log('agent err: ', err);
                  response.status(500).send(err);
               } else {
                  response.end(JSON.stringify(agentResult));

                  // create endpoint
                  var agentId = agentResult.agents[0].insertId;
                  createEndPoint(data, function (err, endPointResult) {
                     var params = {
                        'endpoint_id': endPointResult.endpoint_id // ID of the endpoint for which the details have to be retrieved
                     };
                     p.get_endpoint(params, function (status, endpointDetailResponse) {
                        var updateAgentData = {
                        }
                        updateAgentData.sip = endpointDetailResponse.sip_uri;
                        updateAgentData.sip_user_name = endpointDetailResponse.username;
                        updateAgentData.sip_id = endpointDetailResponse.endpoint_id;
                        updateAgentData.sip_app_id = endpointDetailResponse.api_id;
                        dbService.update([{ $table: 'agents', $update: updateAgentData, $filter: "id=" + agentId }], function (err, agentResult) {
                           if (err) {
                              console.log('agent err: ', err);
                           } else {
                              //console.log('agent agentResult: ', agentResult);
                           }
                        })
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

   p.create_endpoint(params, function (status, response) {
      console.log('create_endpoint Status: ', status);
      console.log('create_endpoint API Response:\n', response);
      if (status >= 200 && status <= 300) {
         cb(null, response);
      } else {
         cb(new Error(JSON.stringify({ msg: 'User not created', message: response })));
      }
   });
}
