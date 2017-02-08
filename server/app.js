var https = require('https');
var express = require('express');
var app = express();
var util = require('util');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var path = require('path');

var routes = require('./routes/router');

app.use(bodyParser.urlencoded({ extended: true }));
// console.log('__dirname: ',__dirname, path.join(__dirname, '../public'));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/', routes);

// p.get_account({}, function (status, response) {
//     console.log('Status: ', status);
//     console.log('API Response:\n', response);
// });

var options = {
   key: fs.readFileSync(__dirname + '/ssl/key_new_1.key', 'utf8'),
   cert: fs.readFileSync(__dirname + '/ssl/cert_new_1.crt', 'utf8')
};

var httpsNodeServer = https.createServer(options, app).listen(3001, function () {
   console.log('https server listen on 3001')
});

app.listen(3000, function () {
   console.log('Node app is running on port', 3000);
});

// var params = {
//    'call_uuid': 'dc85016b-b49a-4f70-a874-1d4e1a80b0c0' // ID of the call.
// };

// // Prints the complete response
// p.get_cdr(params, function (status, response) {
//    console.log('Status: ', status);
//    console.log('API Response:\n', response);
// });