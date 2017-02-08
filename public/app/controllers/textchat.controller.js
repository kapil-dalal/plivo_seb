app.controller('chatController', ['$scope', '$state', 'webRtcService', 'websocketService',
   function ($scope, $state, webRtcService, websocketService) {
      'use strict';
      console.log('chatController called');
      var sender = null;
      var receiver = null;

      /**
       * this function just for testing because in this we are not using registration proocess
       * in production this should be removed
       */
      $scope.userOne = function () {
         console.log('user 1');
         sender = 1;
         receiver = 2;
         var msg = { from: sender, type: 'login' };
         websocketService.sendMessage(msg);
      }

      /**
       * this function just for testing because in this we are not using registration proocess
       * in production this should be removed
       */
      $scope.userTwo = function () {
         console.log('user 2');
         sender = 2;
         receiver = 1;
         var msg = { from: sender, type: 'login' };
         websocketService.sendMessage(msg);
      }

      $scope.goToVideoChat = function () {
         $state.go('videoChat');
      }

      $scope.sendMsg = function () {
         var message = document.getElementById('text').value || 'testing msg sending.';
         webRtcService.sendTextMessage(sender, receiver, message);
      }

      webRtcService.onTextMessage(function (sendByUserId, message) {
         console.log('sendByUserId: ' + sendByUserId + ', message: ' + message);
         $scope.msg = message + ', from user: ' + sendByUserId;
      });

   }]);