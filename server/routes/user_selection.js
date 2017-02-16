var plivo = require('plivo');
var authId = 'MAM2M4ZGE3NJIWMGRIM2';
var p = plivo.RestAPI({
   authId: 'MAM2M4ZGE3NJIWMGRIM2',
   authToken: 'MzhlYjBhOGExNGQ0NzI0ZDY4YjFkOWM4MzEwNjI3'
});

var customerWiseResponse = {};

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
   } else if (digit === "3") {
      plivoResponse.addSpeak('you pressed 3. Connecting your call');
      cb(plivoResponse.toXML());
   } else if (digit === "4") {
      selectedFour(request, response, plivoResponse, data, cb);
   } else if (digit === "5") {
      var params = {
         'call_uuid': data.CallUUID, // ID of the call
         'aleg_url': request.protocol + '://' + request.headers.host + "/dial/",
         'aleg_method': "GET"
      };
      return p.transfer_call(params);
   } else {
      wrongSelection(request, response, plivoResponse, data, cb);
   }
}
function selectedFour(request, response, plivoResponse, data, cb) {

   plivoResponse.addSpeak("you pressed 4. Connecting your call.");
   var params = {
      callbackUrl: request.protocol + '://' + request.headers.host + "/confrence_callback/",
      callbackMethod: "GET",
      waitSound: request.protocol + '://' + request.headers.host + "/custom_ringing_tone/"
   };

   var conference_name = "demo"; // Conference Room name
   plivoResponse.addConference(conference_name, params);
   console.log(plivoResponse.toXML());

   cb(plivoResponse.toXML());
}

function selectedOne(request, response, plivoResponse, data, cb) {
   plivoResponse.addSpeak('Connecting your call');
   var params = {
      callerId: data.From,
      dialMusic: request.protocol + '://' + request.headers.host + "/custom_ringing_tone/" // Music to be played to the caller while the call is being connected.
   };
   var d = plivoResponse.addDial(params);
   var to = request.params.to || "+917065201417";// || "+918588842775";
   d.addNumber(to);
   console.log('plivoResponse.toXML(): ', plivoResponse.toXML());
   cb(plivoResponse.toXML());
}

function selectedTwo(request, response, plivoResponse, data, cb) {
   var params = {
      callerId: data.From,
      dialMusic: request.protocol + '://' + request.headers.host + "/custom_ringing_tone/" // Music to be played to the caller while the call is being connected.
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