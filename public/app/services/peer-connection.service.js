app.factory('peerConnection', ['websocketService', '$http', function (websocketService, $http) {
   'use strict';
   var peerConnections = {};
   var pc_config = {
      iceServers: []
   };
   pc_config.iceServers.push({ urls: "stun:stun.1.google.com:19302" });

   /**
    * here we set the ice_servers
    * as per requirements we can get these servers from backend server
    */
   var getIceServersURL = 'https://service.xirsys.com/ice?ident=kapildalal&secret=23177f34-d5c7-11e6-b3cb-2ad443166aa1&domain=sebastine.com&application=sebastine&room=sebastine&secure=1';
   $http.get(getIceServersURL).then(
      function (data, status) {
         var response = data.data;
         if (response.s == 200 && response.d && response.d.iceServers) {
            // console.log("response.d.iceServers: ", response.d.iceServers);
            var iceConfig = response.d.iceServers;
            pc_config.iceServers = [...iceConfig];
            console.log(JSON.stringify(pc_config));
         }
      }).catch(
      function (err) {
         console.log("err: ", err);
      });


   var options = [];
   var moz = !!navigator.mozGetUserMedia;
   if (!moz) {
      // options.push({ 'RtpDataChannels': 'true' });
      options.push({ 'DtlsSrtpKeyAgreement': 'true' }); // for interoperability
   }
   // options.push({ 'RtpDataChannels': 'true' });
   var optional = { optional: options };


   function createPeerConnection(sender, receiver) {
      if (peerConnections[receiver])
         return peerConnections[receiver];
      try {
         optional = null;
         var peerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
         var peerConn = new peerConnection(pc_config, optional);
         peerConn.from = sender;
         peerConn.to = receiver;
         peerConn.onicecandidate = function (event) {
            try {
               if (event && event.candidate) {
                  var message = {
                     type: 'candidate',
                     sdpMLineIndex: event.candidate.sdpMLineIndex,
                     sdpMid: event.candidate.sdpMid,
                     candidate: event.candidate.candidate,
                     to: peerConn.to,
                     from: peerConn.from
                  };
                  websocketService.sendMessage(message)
               } else {
                  console.log("onIceCandidate event candidate not found");
               }
            } catch (err) {
               console.log("onIceCandidate event candidate not found");
            }
         };

         peerConn.onremovestream = function () {
            if (document.getElementById(peerConn.elementId)) {
               document.getElementById(peerConn.elementId).src = '';
            }
         }
         // console.log("Created webkitRTCPeerConnection with config:", peerConn);
      } catch (e) {
         // error handler
         console.log("Failed to create PeerConnection, exception: ", e.message);
         alert("Cannot create webkitRTCPeerConnection object; WebRTC is not supported by this browser.");
         return null;
      }
      peerConnections[receiver] = peerConn;
      return peerConn;
   }

   function closeConnection(userId) {
      if (peerConnections[userId]) {
         peerConnections[userId].close();
         delete peerConnections[userId];
      }
   }

   function getPeerConnection(userId) {
      return peerConnections[userId];
   }

   function length() {
      return Object.keys(peerConnections).length;
   }

   var service = {
      createPeerConnection: createPeerConnection,
      closeConnection: closeConnection,
      getPeerConnection: getPeerConnection,
      length: length
   };

   return service;
}]);