var express = require('express');
var dbService = require('../db/db.service');
var constants = require('../constants');
var router = express.Router();

module.exports = router;
// http://host:port/user/login
router.post('/login', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   var user_name = data.user_name;
   var password = data.password;
   var query = { $table: 'users', $filter: "user_name = '" + user_name + "' and password = '" + password + "'" };
   dbService.query(query, function (err, result) {
      if (err) {
         response.status(500).send(err);
         return;
      }
      result = result[0];
      if (result && result.status_id == constants.USER_STATUS.ACTIVE) {
         var agentQuery = { $table: 'agents', $filter: "user_id = '" + result.id + "'" };
         dbService.query(agentQuery, function (err, agetntResult) {
            if (err) {
               response.status(500).send(err);
               return;
            }
            agetntResult = agetntResult[0];
            response.send(JSON.stringify(agetntResult));
         });
      } else if (result && result.status_id == constants.USER_STATUS.INACTIVE) {
         response.status(500).send(JSON.stringify({ code: 'INACTIVE', message: 'account is inactive.' }));
      } else {
         response.status(500).send(JSON.stringify({ code: 'INVALID', message: 'invalid credintials.' }));
      }
   });
});


router.post('/reset/password', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   console.log('user login data: ', data);
   var user_name = data.user_name;
   var password = data.password;

});