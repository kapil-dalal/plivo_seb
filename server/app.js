var https = require('https');
var express = require('express');
var app = express();
var util = require('util');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var path = require('path');
var WebSocketServer = require('websocket').server;

var routes = require('./routes/router');
var createAgent = require('./routes/create_agent');

app.use(bodyParser.urlencoded({ extended: true }));
// console.log('__dirname: ',__dirname, path.join(__dirname, '../public'));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/user', require('./routes/login'));
app.use('/api', require('./routes/create_agent'));
app.use('/', require('./routes/router'));

// p.get_account({}, function (status, response) {
//     console.log('Status: ', status);
//     console.log('API Response:\n', response);
// });

var options = {
   key: fs.readFileSync(__dirname + '/ssl/key_new_1.key', 'utf8'),
   cert: fs.readFileSync(__dirname + '/ssl/cert_new_1.crt', 'utf8')
};

var httpsNodeServer = https.createServer(options, app).listen(3010, function () {
   console.log('https server listen on 3010')
});

app.listen(3011, function () {
   console.log('Node app is running on port', 3011);
});

var wsServer = new WebSocketServer({
   httpServer: httpsNodeServer
});

var constants = require('./constants');
var agentStatus = require('./agent_status/agent.status');
var dbService = require('./db/db.service');
dbService.createDB();

var userConnections = {};
var userConnectionsCounter = {};
// WebSocket server
wsServer.on('request', function (request) {
   console.log('websocket server side request');
   var connection = request.accept(null, request.origin);
   // console.log('websocket connection on server: ', connection.socket);
   // This is the most important callback for us, we'll handle
   // all messages from users here.
   connection.on('message', function (message) {
      console.log('websocket message on server: ', message);
      if (message.type === 'utf8') {
         var utfMessage = message.utf8Data;
         console.log('utfMessage: ' + utfMessage);
         var jsonData = JSON.parse(utfMessage);
         var fromUserId = jsonData.from;

         if (jsonData.type == 'login') {
            console.log('connections for user: ' + fromUserId);
            connection.userId = fromUserId;
            userConnections[fromUserId] = connection;

            agentStatus.updateAgentStatusagentDetails(fromUserId, constants.AGENT_STATUS_TYPE.FREE, function () {

            });
            // var connObject = userConnections[fromUserId];
            // if (connObject) {
            //    connection.index = Object.keys(connObject).length;
            //    userConnections[fromUserId].push(connection);
            // } else {
            //    connection.index = 0;
            //    userConnections[fromUserId] = [connection];
            // }
         }

         // var toUserId = jsonData.to;
         // if (jsonData.type == 'textMessage') {
         //    var message = jsonData.message;
         //    console.log('message got: ', message);
         // }

         // var conn = userConnections[toUserId];
         // if (conn) {
         //    conn.send(utfMessage);
         // }
      }
   });

   connection.on('close', function (detailId) {
      console.log('on connection closed: ', connection.userId);
      delete userConnections[connection.userId];
      agentStatus.updateAgentStatusagentDetails(connection.userId, constants.AGENT_STATUS_TYPE.OFF_LINE, function () {

      });
      if (userConnections && Object.keys(userConnections).length > 0) {
         // for (var receiver in userConnections) {
         //    var conn = userConnections[receiver];
         //    if (conn && conn.userId != connection.userId) {
         //       var msg = { to: conn.userId, from: connection.userId, type: 'receiverSocketClosed' };
         //       conn.send(JSON.stringify(msg));
         //    }
         // }
      }
      // close user connection
   });
});

var plivo = require('plivo');
var p = plivo.RestAPI({
   authId: 'MAM2M4ZGE3NJIWMGRIM2',
   authToken: 'MzhlYjBhOGExNGQ0NzI0ZDY4YjFkOWM4MzEwNjI3'
});

// p.get_live_conferences({}, function (status, response) {
//    console.log('get_live_conference Status: ', status);
//    console.log('get_live_conference API Response:\n', response);
// })

// var params = {
//     'endpoint_id': '77815552817411' // ID of the endpoint for which the details have to be retrieved
// };
// p.get_endpoint(params, function (status, response) {
//     console.log('Status: ', status);
//     console.log('API Response:\n', response);
// });

// var params = {
//    'username': 'testuser', // The username for the endpoint to be created
//    'password': 'test123', // The password for your endpoint username
//    'alias': 'K_Test', // Alias for this endpoint
//    app_id: '15250876692469854'
// };

// p.create_endpoint(params, function (status, response) {
//    console.log('create_endpoint Status: ', status);
//    console.log('create_endpoint API Response:\n', response);
// });

// var params = {
// //   'limit': '10', // The number of results per page
// //   'offset': '0', // The number of items by which the results should be offset
//   "app_id": '15250876692469854'
// };

// p.get_application(params, function (status, response) {
//   console.log('Status: ', status);
//   console.log('API Response:\n', response);
// //   console.log("Total count: " + response.meta.total_count);
// //   for (var i = 0; i < response.meta.total_count; i++) {
// //     console.log("--------");
// //     console.log("App Name: " + response.objects[i].app_name);
// //     console.log("Answer URL: " + response.objects[i].answer_url);
// //     console.log("Hangup URL: " + response.objects[i].hangup_url);
// //     console.log("Message URL: " + response.objects[i].message_url);
// //   }
// });


// var params = {
//    'call_uuid': '9a7c10a6-f130-11e6-9883-794fb1d4fde8' // ID of the call.
// };

// // Prints the complete response
// p.get_cdr(params, function (status, response) {
//    console.log('Status: ', status);
//    console.log('API Response:\n', response);
// });