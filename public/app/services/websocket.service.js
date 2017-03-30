app.factory('websocketService', ['$websocket', function ($websocket) {
   'use strict';
   // require https socket connection
   // var serverURI = "wss://localhost:3010";
   var serverURI = "wss://35.165.241.189:3010";
   var socket = null;
   var retryConnectTime = 5 * 1000; // one second
   function sendMessage(data) {
      if (socket) {
         socket.send(JSON.stringify(data));
      }
   }

   function createConnection(onSocketMessage, socketState) {
      socket = $websocket(serverURI);
      socket.onOpen(onOpen);
      socket.onClose(onClose);
      socket.onError(onError);
      socket.onMessage(onSocketMessage);
      var isSocketNewState = false;
      var isSocketOldState = false;
      function onOpen() {
         console.log('connection opened');
         clearTimeout(reConnectSocket)
         isSocketNewState = true;
         isSocketOldState = false;
         socketState(true);
      }

      function reConnectSocket() {
         createConnection(onSocketMessage, socketState);
      }

      function onClose() {
         if (isSocketNewState != isSocketOldState) {
            isSocketOldState = isSocketNewState;
            socketState(false);
         }
         setTimeout(reConnectSocket, retryConnectTime);
      }

      function onError(error) {
         console.log('connection open error: ', error);
         socket.close()
         if (isSocketNewState != isSocketOldState) {
            isSocketOldState = isSocketNewState;
            socketState(false);
         }
      }
   }



   var service = {
      createConnection: createConnection,
      sendMessage: sendMessage
   };

   return service;
}]);