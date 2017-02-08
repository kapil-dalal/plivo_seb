app.factory('phoneService', [
   function () {
      console.log('phoneService initiated');
      var plivo = undefined;

      // p: plivo instance
      function setPlivo(p) {
         plivo = p;
      }

      function login() {
         Plivo.conn.login($("#username").val(), $("#password").val());
      }

      function logout() {
         Plivo.conn.logout();
      }
      


   }]);