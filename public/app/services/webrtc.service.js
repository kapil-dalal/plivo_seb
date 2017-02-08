app.factory('webRtcService', ['websocketService', 'streamService', 'peerConnection', 'browserDetection', '$state',
   function (websocketService, streamService, peerConnection, browserDetection, $state) {
      'use strict';
      var utility = {
         userId: null,
         localStream: null,
         isSocketOpened: false,
         audio: {
            mandatory: {
               googEchoCancellation: false,
               googAutoGainControl: false,
               googNoiseSuppression: false,
               googTypingNoiseDetection: false,
            }
         },
         video: {
            width: 640,
            height: 360
         },
         streamSentToIds: {},
         streamInitiatedTo: {},
         detectRTC: undefined,
         isRequireNewStream: false,
         constraints: {
            audio: {
               mandatory: {
                  googEchoCancellation: false,
                  googAutoGainControl: false,
                  googNoiseSuppression: false,
                  googTypingNoiseDetection: false,
               }
            },
            video: {
               width: 640,
               height: 360
            },
            options: {
               muted: true,
               mirror: true
            },
            mandatory: {
               googNoiseReduction: true,
               googCpuOveruseDetection: true
            },
            optional: []
         },
         getParameters: function (sender) {
            var pc = peerConnection.getPeerConnection(sender) || {};
            return pc.parms;
         },
         onReceiveCall: function (userId, cb) {
            cb(true);
         },
         onSocketDisconnect: function (userId) {

         },
         onCallCompleted: function (userId) {

         },
         onRejectCall: function () {

         },
         onBrowserDetection: function (detectRtc) {

         },
         onSenderStream: function (stream) {

         },
         onReceiverStream: function (stream) {

         },
         removeMediaTraks: function () {
            streamService.removeStream();
            utility.localStream = null;
         },
         getSessionDescription: function (msgData) {
            var sd = null;
            var sessionDescription = window.SessionDescription || window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
            sd = new sessionDescription(msgData);
            return sd;
         },
         removeStream: function (sender, receiver) {
            if (utility.streamSentToIds[receiver])
               delete utility.streamSentToIds[receiver];
            if (utility.streamInitiatedTo[receiver])
               delete utility.streamInitiatedTo[receiver];
            var pc = peerConnection.createPeerConnection(sender, receiver);
            if (pc) {

               if (utility.localStream) {
                  try {
                     pc.removeStream(utility.localStream);
                     pc.removeTrack(pc, utility.localStream);
                  } catch (err) {
                     // console.log('remove stream error: ', err);
                  }
               }

               if (peerConnection.length() == 1)
                  utility.removeMediaTraks();
               if (document.getElementById(pc.elementId))
                  document.getElementById(pc.elementId).src = '';
               peerConnection.closeConnection(receiver);
            }
         },
         socketState: function (isSocketOpened) {
            utility.isSocketOpened = isSocketOpened;

            if (!isSocketOpened) {
               utility.onSocketDisconnect();
               if (utility.streamSentToIds && Object.keys(utility.streamSentToIds).length > 0) {
                  for (var userId in utility.streamSentToIds) {
                     utility.onCallCompleted(userId);
                  }
               }
            }
         },
         onTextMessage: function (sendById, message) {

         },
         onTextSocketMessage: function (msgData) {
            utility.onTextMessage(msgData.from, msgData.message);
         },
         onCandidate: function (msgData) {
            var sender = msgData.to;
            var receiver = msgData.from;
            var pc = peerConnection.createPeerConnection(sender, receiver);
            var candidate = new RTCIceCandidate({
               sdpMLineIndex: msgData.sdpMLineIndex,
               candidate: msgData.candidate,
               sdpMid: msgData.sdpMid
            });
            try {
               pc.addIceCandidate(candidate);
            } catch (err) {
               // TODO: error handler
               // console.log('adding ice candidate error: ', err);
            }
         },
         onOffer: function (msgData) {
            var sender = msgData.to;
            var receiver = msgData.from;
            var pc = peerConnection.createPeerConnection(sender, receiver);
            pc.parms = msgData.parms;
            utility.streamSentToIds = JSON.parse(JSON.stringify(utility.streamSentToIds));
            var doAnswer = function () {
               utility.createAnswer(pc, msgData,
                  function (desc) {
                     var msg = { sdp: desc, to: receiver, from: sender, type: desc.type };
                     websocketService.sendMessage(msg);
                  },
                  function (err) {
                     // TODO: error handler
                     console.log("createAnswer error: ", err);
                  });
            }

            var rejectCall = function () {
               peerConnection.closeConnection(receiver);
               var msg = { to: receiver, from: sender, type: 'callRejected' };
               websocketService.sendMessage(msg);
            }

            if (utility.streamSentToIds[receiver]) {
               doAnswer();
            } else {
               utility.onReceiveCall(receiver, function (isAccepted) {
                  if (isAccepted)
                     doAnswer();
                  else
                     rejectCall();
               })
            }
         },
         onAnswer: function (msgData) {
            var sender = msgData.to;
            var receiver = msgData.from;
            var pc = peerConnection.createPeerConnection(sender, receiver);
            pc.setRemoteDescription(utility.getSessionDescription(msgData.sdp)).then(function () {
               if (utility.streamInitiatedTo[receiver]) {
                  var msg = { to: receiver, from: sender, type: 'sendYourStream' };
                  websocketService.sendMessage(msg);
                  utility.onSenderStream(utility.localStream);
               } else {
                  utility.onReceiverStream(utility.localStream);
               }
            }).catch(function (err) {
               // TODO: error handler
               console.log('onAnswer setRemoteDescription error: ', err);
            })
         },
         onSendYourStream: function (msgData) {
            var sender = msgData.to;
            var receiver = msgData.from;
            doCall(sender, receiver);
         },
         onCallRejected: function (msgData) {
            var sender = msgData.to;
            var receiver = msgData.from;
            utility.onRejectCall();
            var pc = peerConnection.createPeerConnection(sender, receiver);
            if (utility.localStream)
               pc.removeStream(utility.localStream);
            if (peerConnection.length() == 1)
               utility.removeMediaTraks();
            if (document.getElementById(pc.elementId))
               document.getElementById(pc.elementId).src = '';
            peerConnection.closeConnection(receiver);
         },
         onCallEnd: function (msgData) {
            var sender = msgData.to;
            var receiver = msgData.from;
            utility.onCallCompleted(receiver);
            utility.removeStream(sender, receiver);
         },
         onSocketMessage: function (message) {
            /**
             * this is listener when we receive the message on socket
             * @message: message.data should be JSON object
             */
            var msgData = JSON.parse(message.data);
            var messageType = msgData.type;
            if (messageType == 'candidate') {
               utility.onCandidate(msgData)
            } else if (messageType === 'offer') {
               utility.onOffer(msgData);
            } else if (messageType === 'answer') {
               utility.onAnswer(msgData)
            } else if (messageType === 'callRejected') {
               utility.onCallRejected(msgData);
            } else if (messageType === 'endCall') {
               utility.onCallEnd(msgData);
            } else if (messageType === 'sendYourStream') {
               utility.onSendYourStream(msgData);
            } else if (messageType === 'textMessage') {
               utility.onTextSocketMessage(msgData);
            } else if (messageType === 'receiverSocketClosed') {
               utility.onCallEnd(msgData);
            }
         },
         createOffer: function (pc, successCallBack, errorCallBack) {
            var offer = null;
            pc.createOffer().then(function (offerSdp) {
               offer = offerSdp;
               return pc.setLocalDescription(offerSdp);
            }).then(function () {
               successCallBack(offer);
            }).catch(function (err) {
               // TODO: error handler
               console.log('createOffer error set remove description: ', err);
            });
         },
         createAnswer: function (pc, msgData, successCallBack, errorCallBack) {
            // if (utility.isFirefox)  {
            var sdp = msgData.sdp;
            var sender = msgData.to;
            var receiver = msgData.from;
            var sessionDescription = null;
            sdp = utility.getSessionDescription(sdp);
            pc.setRemoteDescription(sdp).then(function () {
               return pc.createAnswer();
            }).then(function (answer) {
               sessionDescription = answer;
               return pc.setLocalDescription(answer);
            }).then(function () {
               successCallBack(sessionDescription);
            }).catch(function (err) {
               // TODO: error handler
               console.log('createAnswer error set remove description: ', err);
            });
         }
      }

      /**
       * initiate the websocket connection with server
       */
      websocketService.createConnection(utility.onSocketMessage, utility.socketState);

      browserDetection.startDeductRTC(function (DetectRTC) {
         // DetectRTC.isOpera;
         // DetectRTC.isFirefox;
         // DetectRTC.isSafari;
         // DetectRTC.isChrome;
         // DetectRTC.isIE;
         // DetectRTC.isMobileDevice;
         // DetectRTC.hasWebcam
         // DetectRTC.hasMicrophone
         utility.detectRTC = DetectRTC;
         utility.onBrowserDetection(utility.detectRTC);
      });

      /**
       * end call
       * @sender: mandatory parameter
       * @receiver: mandatory parameter
       */
      function endCall(sender, receiver) {
         if (!sender || !receiver) {
            // handle error
            alert('Sender and Receiver both user id is mandatory');
            return;
         }
         utility.onCallCompleted(receiver);
         var msg = { to: receiver, from: sender, type: 'endCall' };
         websocketService.sendMessage(msg);
         utility.removeStream(sender, receiver);
      }

      /**
       * initiate the call
       * @sender: mandatory parameter
       * @receiver: mandatory parameter
       * @parms: to send extra parameters to receiver
       * @elementId: this is video element id where to add audio/video stream for user we are calling
       */
      function initiateCall(sender, receiver, parms, elementId) {
         var isInitiator = true;
         if (utility.streamSentToIds[receiver]) {
            throw new Error('Already initiated call for selected user');
            return;
         }
         doCall(sender, receiver, parms, elementId, isInitiator);
      }

      function doCall(sender, receiver, parms, elementId, isInitiator) {
         if (!utility.isSocketOpened) {
            throw new Error('Either you are not connected over net or your socket connection lost. Please wait or refresh your browser.');
            return;
         }
         if (!sender || !receiver) {
            // handle error
            throw new Error('Sender and Receiver both user id is mandatory');
            return;
         }

         if (isInitiator && !elementId) {
            throw new Error('Please set the element id to set audio/video stream.');
            return;
         }
         if (isInitiator) {
            utility.streamInitiatedTo[receiver] = true;
         }
         utility.userId = sender;
         getStream(function (stream) {
            utility.localStream = stream;
            var pc = peerConnection.createPeerConnection(sender, receiver);

            if (!pc.elementId)
               pc.elementId = elementId;
            pc.onnegotiationneeded = function () {
               utility.createOffer(pc,
                  function (desc) {
                     utility.streamSentToIds[receiver] = true;
                     var msg = { sdp: desc, to: receiver, from: sender, type: desc.type, parms: parms };
                     websocketService.sendMessage(msg);
                  },
                  function (err) {
                     delete utility.streamSentToIds[receiver];
                     if (utility.streamInitiatedTo[receiver])
                        delete utility.streamInitiatedTo[receiver];
                     // TODO: error handler
                     console.log("createOffer error: ", err);
                  });
            }

            // TODO: when all borwsers provide support then peerConn.onaddstream handler should be changed to peerConn.ontrack
            peerConn.onaddstream = onAddStream;
            pc.addStream(stream);
         }, function (error) {
            delete utility.streamSentToIds[receiver];
            if (utility.streamInitiatedTo[receiver])
               delete utility.streamInitiatedTo[receiver];
            // TODO: error handler
            console.log('stream getting error: ', error);
         })
      }

      function onAddStream(event) {
         if (document.getElementById(peerConn.elementId)) {
            if (utility.onStreamReceived)
               utility.onStreamReceived(peerConn.to, event.stream)
            var element = document.getElementById(peerConn.elementId);
            element.src = window.URL.createObjectURL(event.stream);
            element.autoplay = true;
         } else {
            // TODO: handle error if video element id not found
            console.log('element id not found to set sender\'s stream.');
         }
      };

      function onStreamReceived(cb) {
         utility.onStreamReceived = cb;
      }

      /**
        * this message send the message to receiver
        * @param: this contains the message and some other parms we need to send to receiver
        */
      function sendTextMessage(sender, receiver, message) {
         var msg = { from: sender, to: receiver, type: 'textMessage', message: message };
         websocketService.sendMessage(msg);
      }

      function getStream(successCB, errorCB) {
         streamService.getStream(utility.constraints, utility.isRequireNewStream, function (stream) {
            successCB(stream);
         }, function (error) {
            errorCB(error)
         })
      }

      function muteUnMuteAudio() {
         if (utility.localStream) {
            var audioTracks = utility.localStream.getAudioTracks();
            muteUnmute(audioTracks);
         }
      }

      function muteUnMuteVideo() {
         if (utility.localStream) {
            var videoTracks = utility.localStream.getVideoTracks();
            muteUnmute(videoTracks);
         }
      }

      function mute() {
         if (utility.localStream) {
            var tracks = utility.localStream.getTracks();
            muteUnmute(tracks);
         }
      }

      function muteUnmute(tracks) {
         if (tracks && tracks.length > 0) {
            for (var i = 0; i < tracks.length; i++) {
               tracks[i].enabled = !(tracks[i].enabled);
            }
         }
      }

      function onReceiveCall(cb) {
         utility.onReceiveCall = cb;
      }

      function onRejectCall(cb) {
         utility.onRejectCall = cb;
      }

      function isAudioRequired(isRequired) {
         if (isRequired) {
            utility.constraints.audio = utility.audio;
         } else {
            utility.audio = isRequired;
         }
      }

      function isVideoRequired(isRequired) {
         if (isRequired) {
            utility.constraints.video = utility.video;
         } else {
            utility.video = isRequired;
         }
      }

      function getParameters(sender) {
         return utility.getParameters(sender);
      }

      function reInitiateCall(sender, receiver) {
         utility.isRequireNewStream = true;
         doCall(sender, receiver);
         utility.isRequireNewStream = false;
      }

      function setVideoResolution(height, width) {
         if (utility.constraints.video) {
            utility.constraints.video = { width: width, height: height };
         }
      }

      function setEchoCancellation(value) {
         if (utility.constraints.audio && utility.constraints.audio.mandatory) {
            utility.constraints.audio.mandatory.googEchoCancellation = value;
         };
      }

      function setAutoGainControl(value) {
         if (utility.constraints.audio && utility.constraints.audio.mandatory) {
            utility.constraints.audio.mandatory.googAutoGainControl = value;
         };
      }

      function setElementIdForUser(userId, elementId) {
         var pc = peerConnection.getPeerConnection(userId);
         if (pc)
            pc.elementId = elementId;
      }

      function onSocketDisconnect(cb) {
         if (cb)
            utility.onSocketDisconnect = cb;
      }

      function onBrowserDetection(cb) {
         if (cb)
            utility.onBrowserDetection = cb;
      }

      function onCallCompleted(cb) {
         if (cb)
            utility.onCallCompleted = cb;
      }

      function onSenderStreamReceived(cb) {
         if (cb)
            utility.onSenderStream = cb;
      }

      function onReceiverStreamReceived(cb) {
         if (cb)
            utility.onReceiverStream = cb;
      }

      function onTextMessage(cb) {
         if (cb)
            utility.onTextMessage = cb;
      }

      function getLocalStream() {
         return utility.localStream;
      }

      function setLocalStream(elementId) {
         if (elementId && document.getElementById(elementId) && utility.localStream) {
            var element = document.getElementById(elementId);
            element.src = window.URL.createObjectURL(utility.localStream);
            element.autoplay = true;
            element.muted = true;
         }
      }

      var services = {
         endCall: endCall,
         getParameters: getParameters,
         initiateCall: initiateCall,
         isAudioRequired: isAudioRequired,
         isVideoRequired: isVideoRequired,
         getLocalStream: getLocalStream,
         mute: mute,
         muteUnMuteAudio: muteUnMuteAudio,
         muteUnMuteVideo: muteUnMuteVideo,
         onBrowserDetection: onBrowserDetection,
         onCallCompleted: onCallCompleted,
         onReceiveCall: onReceiveCall,
         onReceiverStreamReceived: onReceiverStreamReceived,
         onRejectCall: onRejectCall,
         onSenderStreamReceived: onSenderStreamReceived,
         onSocketDisconnect: onSocketDisconnect,
         onStreamReceived: onStreamReceived,
         onTextMessage: onTextMessage,
         reInitiateCall: reInitiateCall,
         sendTextMessage: sendTextMessage,
         setAutoGainControl: setAutoGainControl,
         setEchoCancellation: setEchoCancellation,
         setElementIdForUser: setElementIdForUser,
         setLocalStream: setLocalStream,
         setVideoResolution: setVideoResolution,
      };

      return services
   }]);