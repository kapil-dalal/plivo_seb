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
   } else {
      wrongSelection(request, response, plivoResponse, data, cb);
   }
}
function selectedFour(request, response, plivoResponse, data, cb) {

   plivoResponse.addSpeak("you pressed 4. Connecting your call. You will now be placed into a demo conference. This is brought to you by Plivo. To know more visit us at plivo.com");
   var params = {
      'enterSound': "beep:2", // Used to play a sound when a member enters the conference
      // 'record': "true", // Option to record the call
      // 'action': "https://intense-brook-8241.herokuapp.com/conf_action/", // URL to which the API can send back parameters
      // 'method': "GET", // method to invoke the action Url
      'callbackUrl': request.protocol + '://' + request.headers.host + "/play/", // If specified, information is sent back to this URL
      'callbackMethod': "GET", // Method used to notify callbackUrl
      // For moderated conference
      // 'startConferenceOnEnter': "true", // When a member joins the conference with this attribute set to true, the conference is started.
      // If a member joins a conference that has not yet started, with this attribute value set to false, 
      // the member is muted and hears background music until another member joins the conference
      // 'endConferenceOnExit': "true" // If a member with this attribute set to true leaves the conference, the conference ends and all 
      // other members are automatically removed from the conference. 
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