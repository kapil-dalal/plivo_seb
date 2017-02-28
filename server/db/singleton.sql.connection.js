var mysql = require('mysql');

var sqlConnection = null;

var sqlConfig = {
   host: "localhost",
   port: "3306",
   user: "root",
   password: "root",
   database: "plivo_test"
};

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

