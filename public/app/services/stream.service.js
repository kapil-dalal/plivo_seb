app.factory('streamService', ['$websocket', function ($websocket) {
   'use strict';
   var localStream = undefined;
   function getStream(constraints, newStream, successCallback, errorCallback) {
      console.log('constraints: ', constraints);
      // if (!constraints) {
         constraints = {
            audio: true,
            video: true
         };
      // }
      if (localStream && !newStream) {
         successCallback(localStream);
         return;
      }
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
         navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
            localStream = mediaStream;
            successCallback(mediaStream);
         }).catch(function (err) {
            errorCallback(err);
         });
      } else if (navigator.getUserMedia) {
         navigator.getUserMedia(constraints, function (mediaStream) {
            localStream = mediaStream;
            successCallback(mediaStream);
         }, function (err) {
            errorCallback(err);
         });
      } else {
         alert('webrtc not supported');
         errorCallback(new Error('WebRTC not supported on your browser.'));
      }
   }

   function removeStream() {
      if (!localStream)
         return;
      var tracks = localStream.getTracks();
      localStream = undefined;
      if (tracks) {
         for (var i = 0; i < tracks.length; i++) {
            tracks[i].stop();
         }
      }
   }

   var service = {
      getStream: getStream,
      removeStream: removeStream
   };

   return service;
}]);