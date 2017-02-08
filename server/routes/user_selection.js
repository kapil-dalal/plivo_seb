var plivo = require('plivo');

var p = plivo.RestAPI({
   authId: 'MAM2M4ZGE3NJIWMGRIM2',
   authToken: 'MzhlYjBhOGExNGQ0NzI0ZDY4YjFkOWM4MzEwNjI3'
});

var mySIP = 'sip:kapilagent1170208155150@phone.plivo.com';

function userSelection(request, response, cb) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('userSelection request data: ', request.query, request.body);

   var digit = data.Digits;
   var plivoResponse = plivo.Response();
   if (digit === "1") {
      selectedOne(request, response, plivoResponse, data, cb);
   } else if (digit === "2") {
      selectedTwo(request, response, plivoResponse, data, cb);
   } else {
      wrongSelection(request, response, plivoResponse, data, cb);
   }
}

function selectedOne(request, response, plivoResponse, data, cb) {
   plivoResponse.addSpeak('Connecting your call');
   var d = plivoResponse.addDial();
   var to = request.params.to || "+917065201417";// || "+918588842775";
   d.addNumber(to);
   cb(plivoResponse.toXML());
}

function selectedTwo(request, response, plivoResponse, data, cb) {
   var clid = data.From;
   var params = {
      callerId: clid
   };
   var dial_element = plivoResponse.addDial(params);
   dial_element.addUser(mySIP);
   // dial_element.addNumber('+918588842775');

   plivoResponse.addSpeak('Connecting your call');
   cb(plivoResponse.toXML());
}

function wrongSelection(request, response, plivoResponse, data, cb) {
   var params = {
      'call_uuid': data.CallUUID // UUID of the call to be hung up
   };
   plivoResponse.addSpeak('Thankyou for calling');
   cb(plivoResponse.toXML());
   setTimeout(function () {
      p.hangup_call(params, function (status, response) {
         console.log('Status: ', status);
         console.log('API Response:\n', response);
      });
   }, 0);
}

module.exports.userSelection = userSelection;