app.controller('mainController', ['$scope', '$state', 'webRtcService', 'websocketService', 'recordRtc', '$http',
   function ($scope, $state, webRtcService, websocketService, recordRtc, http) {
      'use strict';
      console.log('mainController called');
      var sender = null;
      var receiver = null;

      $scope.userOne = function () {
         console.log('user 1');
         sender = 1;
         receiver = 2;
         var msg = { from: sender, type: 'login' };
         websocketService.sendMessage(msg);
      }

      $scope.userTwo = function () {
         console.log('user 2');
         sender = 2;
         receiver = 1;
         var msg = { from: sender, type: 'login' };
         websocketService.sendMessage(msg);
      }

      $scope.goToTextChat = function () {
         $state.go('textChat');
      }

      $scope.sendMsg = function () {
         var message = 'testing msg sending.';
         webRtcService.sendTextMessage(sender, receiver, message);
      }

      webRtcService.onTextMessage(function (sendById, message) {
         console.log('sendById: ' + sendById + ', message: ' + message);
      });

      /**
       * this handler call when browser detect the media devices
       */
      webRtcService.onBrowserDetection(function (detectRTC) {
         // detectRTC.isOpera;
         // detectRTC.isFirefox;
         // detectRTC.isSafari;
         // detectRTC.isChrome;
         // detectRTC.isIE;
         // detectRTC.isMobileDevice;
         // detectRTC.hasWebcam;
         // detectRTC.hasMicrophone;

         var hasVideo = detectRTC.hasWebcam || false;
         var hasAudio = detectRTC.hasMicrophone || false;

         /**
          * with these we can define the type of call: (according to media devices available)
          * 1) audio and video
          * 2) audio
          * 3) video
          */
         webRtcService.isAudioRequired(hasVideo);
         webRtcService.isVideoRequired(hasAudio);
      });

      /**
       * this handler call when receiver accept the call and send his/her stream to sender
       */
      webRtcService.onSenderStreamReceived(function (stream) {

         /**
          * this handler call after every 5 second with 5 second recording
          * @userId: this recorded blobs belongs to witch user
          */
         let finalBlob = []; // to show you how we hundle chunks to make a complete file
         recordRtc.onBLobAvailable(function (userId, blobChunks) {
            //TODO: here we send the blobs to server side
            /**
             * we got hare actual blob if we want to run these blobs then we need to convert these in array e.g: [blobChunks],
             * then after some time we get more chunks then we have to push received chunks in old chunks array
             */
            finalBlob.push(blobChunks); // this can be done at server side
         })

         /**
          * startRecording method start the recording
          * @userId: for witch user we are sending stream
          */
         // recordRtc.startRecording(userId, stream);

         /**
          * stopRecording method stop the recording and handle a callback where we receive blobs data
          *
          * we can play the blob in video element
          * we can download the file
          * we can save/send blob to server
          */
         // recordRtc.stopRecording(function (recordedBlobs) {
         //    var elementId = 'recorded';
         //    recordRtc.playRecording(recordedBlobs, elementId);
         //    var fileName = 'senderFile';
         //    recordRtc.downloadRecording(recordedBlobs, fileName);
         // });


         /**
          * these statements is for testing purpose to show how it is working
          */
         // recordRtc.startRecording(stream);
         // setTimeout(() => {
         //    recordRtc.stopRecording(function (recordedBlobs) {
         //       var elementId = 'recorded';
         //       recordRtc.playRecording(recordedBlobs, elementId);
         //       var fileName = 'senderFile';
         //       recordRtc.downloadRecording(recordedBlobs, fileName);
         //    });
         // }, (10 * 1000));
      })

      /**
       * this handler call when receiver send his/her stream to sender
       */
      webRtcService.onReceiverStreamReceived(function (stream) {
         console.log("receiver's stream received");
      })

      /**
       * this handler call when we receive the call from sender
       * return type: boolean and by default false and call will auto accepted if this handler not handled according to you
       */
      webRtcService.onReceiveCall(function (userId, cb) {
         // TODO: if call is comming then we can handle our logic here

         // this is mandatory: set the video element id to set audio/video stream, userId: for which user you are assigning the video element;
         webRtcService.setElementIdForUser(userId, "videoElement");

         // you can receave the parameters here sent by sender
         var parms = webRtcService.getParameters(receiver);
         console.log('getParameters: ', parms);

         var isAccepted = confirm('do you want to accept call');
         cb(isAccepted);
      });

      /**
       * this handler call when receive reject the call
       */
      webRtcService.onRejectCall(function () {
         console.log('on call rejected by receiver');
         // TODO: if call is rejected by receiver then we can handle our logic here
      });

      /**
       * this handler call when socket connection disconnected
       * TODO: here we handle the logic on socket disconnection
       */
      webRtcService.onSocketDisconnect(function () {
         console.log('on socket disconnect');
         // TODO: if call is rejected by receiver then we can handle our logic here
      });

      /**
       * with this we can mute and un-mute audio from receiver
       */
      $scope.muteUnmuteAudio = function () {
         webRtcService.muteUnMuteAudio();
      }

      /**
       * with this we can mute and un-mute video from receiver
       */
      $scope.muteUnmuteVideo = function () {
         webRtcService.muteUnMuteVideo();
      }

      /**
       * with this we can mute and un-mute audio and video both from receiver
       */
      $scope.muteUnMute = function () {
         webRtcService.mute();
      }

      /**
       * end the call
       * @senderId: mandatory parameter
       * @receiverId: mandatory parameter
       * @parms: to send extra parameters to call receiver
       */
      $scope.endCall = function () {
         var parms = { freeCall: '10', maxAllowed: '20' };
         webRtcService.endCall(sender, receiver);
      }

      $scope.doCall = function (isAccepentenceRequired) {
         var parms = { freeCall: '10', maxAllowed: '20' };
         var elementId = "videoElement";
         /**
          * initiate the call
          * @senderId: mandatory, parameter
          * @receiverId: mandatory, parameter
          * @parms: to send extra parameters to receiver
          * @elementId: mandatory, this is video element id where to add audio/video stream for user we are calling 
          */
         webRtcService.initiateCall(sender, receiver, parms, elementId);
      }

      $scope.reCall = function () {

         var height = 1080;
         var width = 1920;
         /**
          * we can set here video resolution for stream
          */
         webRtcService.setVideoResolution(height, width);

         /**
          * here we regenerate the call after setting the video resolution
          */
         webRtcService.reInitiateCall(sender, receiver);
      }

      /**
       * you can get here self stream object only after call is initiated
       */
      var myStream = webRtcService.getLocalStream();

      /**
       * here we can set self stream to perticular video element as we have sent it as parameter
       * @videoElement2
       * <video id="videoElement2" controls muted="true"></video>
       * muted: define the we do not need self voice in my speaker
       */
      webRtcService.setLocalStream('videoElement2');

      /**
       * thic handler call when call end by user
       * @userId: this user id define for witch user call is ended/completed
       */
      webRtcService.onCallCompleted(function (userId) {
         console.log('call ended/completed for user id: ', userId);
      })

   }]);