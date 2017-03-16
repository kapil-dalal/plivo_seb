var mysql = require('mysql');

var sqlConnection = null;

var config = require('../config');

var sqlConfig = config.sqlConfig;

// sqlConfig = config.sqlLocalConfig;


function endConnection() {
   if (sqlConnection) {
      sqlConnection.end();
   }
}

function createSqlConnection(successCB, errCB) {
   if (sqlConnection) {
      successCB(sqlConnection);
      return;
   }
   try {
      sqlConnection = mysql.createConnection(sqlConfig);
   } catch (err) {
      errCB(err);
      return;
   }
   sqlConnection.connect(function (err) {
      if (err) {
         errCB(err);
      } else {
         successCB(sqlConnection);
      }
   });
}

module.exports.createSqlConnection = createSqlConnection;
module.exports.endConnection = endConnection;

