app.controller('contactController', ["$scope", "$cookies", '$window', "httpService",
   function ($scope, $cookies, $window, httpService) {
      console.log('phoneController called');
      $scope.isSession = false;
      var customerSessionPlivo = $cookies.get('customerSessionPlivo');
      console.log('customerSessionPlivo: ', customerSessionPlivo);
      if (customerSessionPlivo) {
         $scope.isSession = true;
         console.log('session found');
      }
      // set session
      $scope.name = '';
      $scope.email_id = '';
      $scope.phone_number = '';
      $scope.address_1 = '';
      $scope.address_2 = '';
      $scope.city = '';
      $scope.state = '';
      $scope.country = '';

      $scope.createCustomerSession = function () {
         console.log();

         if (!$scope.name || $scope.name.length == 0) {
            alert('name is required.');
            return;
         }

         if (!$scope.email_id || $scope.email_id.length == 0) {
            alert('email is required.');
            return;
         }
         if (!$scope.phone_number || $scope.phone_number.length == 0) {
            alert('phone number is required.');
            return;
         }

         var customerForm = {
            name: $scope.name,
            email_id: $scope.email_id,
            phone_number: $scope.phone_number,
            address_1: $scope.address_1,
            address_2: $scope.address_2,
            city: $scope.city,
            state: $scope.state,
            country: $scope.country,
         }
         console.log('customer form: ', customerForm);
         httpService.createCustomerSession(customerForm,
            function (response) {
               console.log("controller createAgent response: ", response);
               $scope.isSession = true;
               initPlivo();

               var now = new $window.Date();
               var exp = new $window.Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

               $cookies.put('customerSessionPlivo', response.data.customerId, {
                  expires: exp
               });
            },
            function (err) {
               console.log("controller createAgent err: ", err);
            })
      }

      // contact support team
      $scope.userName = 'kapilmakecall170208155025';
      // $scope.userName1 = 'kapilmakecall170208155025';
      // $scope.userName2 = 'kapilagent1170208155150';
      $scope.password = 'kapil@1234';
      $scope.statusTxt = '';
      $scope.makeCallTxt = '';
      $scope.sip = 'sip:kapilagent1170208155150@phone.plivo.com';
      $scope.btnContainerBox = false;
      $scope.linkMute = false;
      $scope.linkUnmute = false;
      $scope.loginButton = true;
      // buttons
      $scope.loginBox = true;
      $scope.logoutBox = false;
      $scope.callContainerBox = false;

      function onReady() {
         console.log("onReady...");
         $scope.statusTxt = 'Login';
         $scope.loginBox = true;
         login();
      }

      // $scope.user1 = function () {
      //    $scope.userName = $scope.userName1;
      //    login();
      // }

      // $scope.user2 = function () {
      //    $scope.userName = $scope.userName2;
      //    login();
      // }

      login = function () {
         console.log('user name, password: ', $scope.userName, $scope.password);
         if ($scope.userName && $scope.password) {
            $scope.statusTxt = 'Logging-in';
            Plivo.conn.login($scope.userName, $scope.password);
         }
      }

      function onLogin() {
         $scope.statusTxt = 'Logged in';
         $scope.callContainerBox = true;
         $scope.makeCallTxt = 'Call';
         $scope.loginBox = false;
         $scope.logoutBox = true;
         $scope.loginButton = false;
         setTimeout(function () {
            $scope.$apply();
         }, 0);
      }

      $scope.logout = function () {
         console.log('logout called');
         Plivo.conn.logout();
      }

      function onLogout() {
         $scope.callContainerBox = false;
         $scope.btnContainerBox = false;
         $scope.statusTxt = 'Waiting login';

         $scope.loginBox = true;
         $scope.logoutBox = false;
         $scope.loginButton = true;
         setTimeout(function () {
            $scope.$apply();
         }, 0);
      }


      function webrtcNotSupportedAlert() {
         $('#txtStatus').text("");
         alert("Your browser doesn't support WebRTC. You need Chrome 25 to use this demo");
      }

      function isNotEmpty(n) {
         return n.length > 0;
      }

      function formatUSNumber(n) {
         var dest = n.replace(/-/g, '');
         dest = dest.replace(/ /g, '');
         dest = dest.replace(/\+/g, '');
         dest = dest.replace(/\(/g, '');
         dest = dest.replace(/\)/g, '');
         if (!isNaN(dest)) {
            n = dest
            if (n.length == 10 && n.substr(0, 1) != "1") {
               n = "1" + n;
            }
         }
         return n;
      }

      function replaceAll(txt, replace, with_this) {
         return txt.replace(new RegExp(replace, 'g'), with_this);
      }

      function callUI() {
         //show outbound call UI
         dialpadHide();
         $('#incoming_callbox').hide('slow');
         $scope.callContainerBox = true;
         $scope.statusTxt = 'Ready';
         $scope.makeCallTxt = 'Call';
         setTimeout(function () {
            $scope.$apply();
         }, 0);
      }

      function IncomingCallUI() {
         //show incoming call UI
         $scope.statusTxt = 'Incoming Call';
         $scope.callContainerBox = false;
         $('#incoming_callbox').show('slow');
      }

      function callAnsweredUI() {
         $('#incoming_callbox').hide('slow');
         $scope.callContainerBox = false;
         dialpadShow();
         setTimeout(function () {
            $scope.$apply();
         }, 0);
      }

      function onLoginFailed() {
         $scope.statusTxt = 'Login Failed';
      }



      function onCalling() {
         console.log("onCalling");
         $scope.statusTxt = 'Connecting....';
      }

      function onCallRemoteRinging() {
         $scope.statusTxt = 'Ringing..';
      }

      function onCallAnswered() {
         console.log('onCallAnswered');
         callAnsweredUI();
         $scope.statusTxt = 'Call Answered';
      }

      function onCallTerminated() {
         console.log("onCallTerminated");
         callUI();
      }

      function onCallFailed(cause) {
         console.log("onCallFailed:" + cause);
         callUI();
         $scope.statusTxt = "Call Failed:" + cause;
      }

      $scope.call = function () {
         if ($scope.makeCallTxt == "Call") {
            var dest = customerSessionPlivo; // $scope.sip;
            console.log('dest: ', dest);
            if (dest && isNotEmpty(dest)) {
               $scope.statusTxt = 'Calling..';
               $scope.makeCallTxt = 'End';

               Plivo.conn.call(dest);
            }
            else {
               $scope.statusTxt = 'Invalid Destination';
            }
         }
         else if ($scope.makeCallTxt == "End") {
            $scope.statusTxt = 'Ending..';
            Plivo.conn.hangup();
            $scope.makeCallTxt = 'Call';
            $scope.statusTxt = 'Ready';
         }
      }

      $scope.hangup = function () {
         $scope.statusTxt = 'Hanging up..';
         Plivo.conn.hangup();
         callUI()
      }

      $scope.dtmf = function (digit) {
         console.log("send dtmf=" + digit);
         Plivo.conn.send_dtmf(digit);
      }
      function dialpadShow() {
         $scope.btnContainerBox = true;
      }

      function dialpadHide() {
         $scope.btnContainerBox = false;
      }

      $scope.mute = function () {
         Plivo.conn.mute();
         $scope.linkUnmute = true;
         $scope.linkMute = false;
      }

      $scope.unmute = function () {
         Plivo.conn.unmute();
         $scope.linkUnmute = false;
         $scope.linkMute = true;
      }

      function onIncomingCall(account_name, extraHeaders) {
         console.log("onIncomingCall:" + account_name);
         console.log("extraHeaders=");
         for (var key in extraHeaders) {
            console.log("key=" + key + ".val=" + extraHeaders[key]);
         }
         IncomingCallUI();
      }

      function onIncomingCallCanceled() {
         callUI();
      }

      function onMediaPermission(result) {
         if (result) {
            console.log("get media permission");
         } else {
            alert("you don't allow media permission, you will can't make a call until you allow it");
         }
      }

      $scope.answer = function () {
         console.log("answering")
         $scope.statusTxt = 'Answering....';
         Plivo.conn.answer();
         callAnsweredUI()
      }

      $scope.reject = function () {
         callUI()
         Plivo.conn.reject();
      }

      var initPlivo = function () {
         Plivo.onWebrtcNotSupported = webrtcNotSupportedAlert;
         Plivo.onReady = onReady;
         Plivo.onLogin = onLogin;
         Plivo.onLoginFailed = onLoginFailed;
         Plivo.onLogout = onLogout;
         Plivo.onCalling = onCalling;
         Plivo.onCallRemoteRinging = onCallRemoteRinging;
         Plivo.onCallAnswered = onCallAnswered;
         Plivo.onCallTerminated = onCallTerminated;
         Plivo.onCallFailed = onCallFailed;
         Plivo.onMediaPermission = onMediaPermission;
         Plivo.onIncomingCall = onIncomingCall;
         Plivo.onIncomingCallCanceled = onIncomingCallCanceled;
         Plivo.init();
      }
      if ($scope.isSession) {
         initPlivo();
      }

   }]);