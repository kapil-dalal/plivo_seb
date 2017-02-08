app.factory('recordRtc', ['websocketService', function (websocketService) {
   'use strict';


   var mediaSource = new MediaSource();
   mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
   var mediaRecorder;
   var userWiseRecordedBlobData = {};
   var sourceBuffer;
   var blobAvailable = null;
   function handleSourceOpen(event) {
      sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
   }

   function handleDataAvailable(userId, event) {
      if (event.data && event.data.size > 0) {
         userWiseRecordedBlobData[userId].push(event.data);
         if (blobAvailable) {
            blobAvailable(userId, event.data);
         }
      }
   }

   function handleStop(event) {
      console.log('Recorder stopped: ', event);
   }

   function startRecording(userId, stream) {
      userWiseRecordedBlobData[userId] = [];
      var options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
         console.log(options.mimeType + ' is not Supported');
         options = { mimeType: 'video/webm;codecs=vp8' };
         if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + ' is not Supported');
            options = { mimeType: 'video/webm' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
               console.log(options.mimeType + ' is not Supported');
               options = { mimeType: '' };
            }
         }
      }
      try {
         mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
         console.error('Exception while creating MediaRecorder: ' + e);
         alert('Exception while creating MediaRecorder: '
            + e + '. mimeType: ' + options.mimeType);
         return;
      }
      mediaRecorder.onstop = handleStop;
      mediaRecorder.ondataavailable = function (event) {
         handleDataAvailable(userId, event);
      }
      // handleDataAvailable;
      mediaRecorder.start(5000); // collect 5sec of data
   }

   function stopRecording(cb) {
      mediaRecorder.stop();
      if (cb)
         cb(recordedBlobData);
   }

   function playRecording(recordedBlobs, elementId) {
      var superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
      document.getElementById(elementId).src = window.URL.createObjectURL(superBuffer);
   }

   function downloadRecording(recordedBlobs, fileName) {
      var blob = new Blob(recordedBlobs, { type: 'video/mp4' });
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName + '.mp4';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
         document.body.removeChild(a);
         window.URL.revokeObjectURL(url);
      }, 100);
   }

   function onBLobAvailable(cb) {
      blobAvailable = cb;
   }

   return {
      downloadRecording: downloadRecording,
      onBLobAvailable: onBLobAvailable,
      playRecording: playRecording,
      startRecording: startRecording,
      stopRecording: stopRecording,
   }
}]);