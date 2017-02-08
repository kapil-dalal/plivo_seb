app.factory('browserDetection', ['peerConnection',
   function () {

      function startDeductRTC(callback) {
         var browser = getBrowserInfo();
         var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
         var isFirefox = typeof InstallTrigger !== 'undefined';
         var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
         var isChrome = !!window.chrome && !isOpera;
         var isIE = !!document.documentMode;
         var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

         var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);

         var isHTTPs = location.protocol === 'https:';

         var DetectRTC = {
            browser: browser,
            //hasMicrophone: navigator.enumerateDevices ? false : 'unable to detect',
            //hasSpeakers: navigator.enumerateDevices ? false : 'unable to detect',
            //hasWebcam: navigator.enumerateDevices ? false : 'unable to detect',

            isWebRTCSupported: !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection,
            isAudioContextSupported: (!!window.AudioContext && !!window.AudioContext.prototype.createMediaStreamSource) || (!!window.webkitAudioContext && !!window.webkitAudioContext.prototype.createMediaStreamSource),

            isScreenCapturingSupported: (isFirefox && browser.version >= 33) ||
            (isChrome && browser.version >= 26 && (isNodeWebkit ? true : location.protocol === 'https:')),

            isDesktopCapturingSupported: isHTTPs && ((isFirefox && browser.version >= 33) || (isChrome && browser.version >= 34) || isNodeWebkit || false),

            isSctpDataChannelsSupported: isFirefox || (isChrome && browser.version >= 25),
            isRtpDataChannelsSupported: isChrome && browser.version >= 31,
            isMobileDevice: !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i),
            isWebSocketsSupported: 'WebSocket' in window && 2 === window.WebSocket.CLOSING,
            isCanvasCaptureStreamSupported: false,
            isVideoCaptureStreamSupported: false
         };
         DetectRTC.isOpera = isOpera;
         DetectRTC.isFirefox = isFirefox;
         DetectRTC.isSafari = isSafari;
         DetectRTC.isChrome = isChrome;
         DetectRTC.isIE = isIE;
         DetectRTC.isMobileDevice = isMobileDevice;
         CheckDeviceSupport(DetectRTC, callback);
      }
      function CheckDeviceSupport(DetectRTC, callback) {
         // This method is useful only for Chrome!
         if (!DetectRTC) {
            return;
         }
         DetectRTC.MediaDevices = [];
         var processDevices = function (devices) {
            //console.log("devices: ", devices);
            devices.forEach(function (_device) {
               var device = {};
               for (var d in _device) {
                  device[d] = _device[d];
               }

               var skip;
               DetectRTC.MediaDevices.forEach(function (d) {
                  if (d.id === device.id) {
                     skip = true;
                  }
               });

               if (skip) {
                  return;
               }

               // if it is MediaStreamTrack.getSources
               if (device.kind === 'audio') {
                  device.kind = 'audioinput';
               }

               if (device.kind === 'video') {
                  device.kind = 'videoinput';
               }

               if (!device.deviceId) {
                  device.deviceId = device.id;
               }

               if (!device.id) {
                  device.id = device.deviceId;
               }

               if (!device.label) {
                  device.label = 'Please invoke getUserMedia once.';
               }

               if (device.kind === 'audioinput' || device.kind === 'audio') {
                  DetectRTC.hasMicrophone = true;
                  if (device.deviceId) {
                     DetectRTC.hasMicrophoneId = device.deviceId;
                  }
               }

               if (device.kind === 'audiooutput') {
                  DetectRTC.hasSpeakers = true;
               }

               if (device.kind === 'videoinput' || device.kind === 'video') {
                  DetectRTC.hasWebcam = true;
                  if (device.deviceId) {
                     DetectRTC.hasWebcamId = device.deviceId;
                  }
               }

               // there is no 'videoouput' in the spec.

               DetectRTC.MediaDevices.push(device);
            });
            if (callback) {
               callback(DetectRTC);
            }
         };

         if (window.navigator && window.navigator.mediaDevices && window.navigator.mediaDevices.enumerateDevices) {
            window.navigator.mediaDevices.enumerateDevices().then(processDevices);
         } else if (window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
            window.MediaStreamTrack.getSources(processDevices);
         } else {
            alert("Device enumeration not supported.");
            //cb({
            //    message: 'Device enumeration not supported.',
            //    kind: 'METHOD_NOT_AVAILABLE'
            //});
         }
         //navigator.enumerateDevices(processDevices);
      }

      function getBrowserInfo() {
         var nVer = navigator.appVersion;
         var nAgt = navigator.userAgent;
         var browserName = navigator.appName;
         var fullVersion = '' + parseFloat(navigator.appVersion);
         var majorVersion = parseInt(navigator.appVersion, 10);
         var nameOffset, verOffset, ix;

         // In Opera, the true version is after 'Opera' or after 'Version'
         if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
            browserName = 'Opera';
            fullVersion = nAgt.substring(verOffset + 6);

            if ((verOffset = nAgt.indexOf('Version')) !== -1) {
               fullVersion = nAgt.substring(verOffset + 8);
            }
         }
         // In MSIE, the true version is after 'MSIE' in userAgent
         else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
            browserName = 'IE';
            fullVersion = nAgt.substring(verOffset + 5);
         }
         // In Chrome, the true version is after 'Chrome'
         else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
            browserName = 'Chrome';
            fullVersion = nAgt.substring(verOffset + 7);
         }
         // In Safari, the true version is after 'Safari' or after 'Version'
         else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
            browserName = 'Safari';
            fullVersion = nAgt.substring(verOffset + 7);

            if ((verOffset = nAgt.indexOf('Version')) !== -1) {
               fullVersion = nAgt.substring(verOffset + 8);
            }
         }
         // In Firefox, the true version is after 'Firefox'
         else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
            browserName = 'Firefox';
            fullVersion = nAgt.substring(verOffset + 8);
         }
         // In most other browsers, 'name/version' is at the end of userAgent
         else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            fullVersion = nAgt.substring(verOffset + 1);

            if (browserName.toLowerCase() === browserName.toUpperCase()) {
               browserName = navigator.appName;
            }
         }
         // trim the fullVersion string at semicolon/space if present
         if ((ix = fullVersion.indexOf(';')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
         }

         if ((ix = fullVersion.indexOf(' ')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
         }

         majorVersion = parseInt('' + fullVersion, 10);

         if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
         }

         return {
            fullVersion: fullVersion,
            version: majorVersion,
            name: browserName
         };
      }

      return {
         startDeductRTC: startDeductRTC
      }

   }]);