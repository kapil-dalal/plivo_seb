var mysql = require('mysql');

var sqlConnection = null;
var ER_DUP_ENTRY = "ER_DUP_ENTRY";
var ER_NO_SUCH_TABLE = "ER_NO_SUCH_TABLE";
var ER_TABLE_EXISTS_ERROR = "ER_TABLE_EXISTS_ERROR";
/* GET home page. */

var sqlConfig = {
   //host: "192.168.100.132",
   host: "localhost",
   //port: "8888",
   port: "3306",
   user: "root",
   //password: "root",
   password: "",
   database: "test_kd"
};

sqlConfig = {
   host: "localhost",
   port: "3306",
   user: "root",
   password: "root",
   database: "plivo_test"
};

function createDB() {
   var STATUS = "CREATE TABLE IF NOT EXISTS user_status"
      + " ( "
      + " id INT NOT NULL AUTO_INCREMENT UNIQUE, "
      + " name VARCHAR(100) NOT NULL UNIQUE, "
      + " PRIMARY KEY (id) "
      + " );";

   var USER_TYPES = "CREATE TABLE IF NOT EXISTS user_types"
      + " ( "
      + " id INT NOT NULL AUTO_INCREMENT UNIQUE, "
      + " name VARCHAR(100) NOT NULL UNIQUE, "
      + " PRIMARY KEY (id) "
      + " );";

   var USERS = "CREATE TABLE IF NOT EXISTS users"
      + " ( "
      + " id INT NOT NULL AUTO_INCREMENT, "
      + " email_id VARCHAR(100) NOT NULL UNIQUE, "
      + " user_name VARCHAR(100) NOT NULL UNIQUE, "
      + " password VARCHAR(100) NOT NULL, "
      + " name VARCHAR(100) NOT NULL, "
      + " phone_number VARCHAR(100), "
      + " type_id INT, "
      + " status_id INT NOT NULL, "
      + " PRIMARY KEY (id), "
      + " FOREIGN KEY (type_id) REFERENCES user_types(id) ON DELETE NO ACTION ON UPDATE NO ACTION, "
      + " FOREIGN KEY (status_id) REFERENCES user_status(id) ON DELETE NO ACTION ON UPDATE NO ACTION "
      + " );";

   var AGENTS = "CREATE TABLE IF NOT EXISTS agents"
      + " ( "
      + " id INT NOT NULL AUTO_INCREMENT, "
      + " name VARCHAR(100) NOT NULL, "
      + " email_id VARCHAR(100) NOT NULL UNIQUE, "
      + " phone_number VARCHAR(100), "
      + " sip VARCHAR(100), "
      + " sip_id VARCHAR(100), "
      + " sip_app_id VARCHAR(100), "
      + " sip_user_name VARCHAR(100), "
      + " sip_password VARCHAR(100), "
      + " type_id INT, "
      + " user_id INT NOT NULL, "
      + " status_id INT NOT NULL, "
      + " PRIMARY KEY (id), "
      + " FOREIGN KEY (type_id) REFERENCES user_types(id) ON DELETE NO ACTION ON UPDATE NO ACTION, "
      + " FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION, "
      + " FOREIGN KEY (status_id) REFERENCES user_status(id) ON DELETE NO ACTION ON UPDATE NO ACTION "
      + " );";

   var USER_STATUS_DATA_1 = "INSERT INTO user_status(id, name) values(1, 'Active')";
   var USER_STATUS_DATA_2 = "INSERT INTO user_status(id, name) values(2, 'In-Active')";

   var USER_TYPE_DATA_1 = "INSERT INTO user_types(id, name) values(1, 'Customer')";
   var USER_TYPE_DATA_2 = "INSERT INTO user_types(id, name) values(2, 'Agent')";

   var allTables = [
      STATUS,
      USER_TYPES,
      USERS,
      AGENTS,
      USER_STATUS_DATA_1,
      USER_STATUS_DATA_2,
      USER_TYPE_DATA_1,
      USER_TYPE_DATA_2
   ];
   var tablesNameList = ["user_status", "user_types", "users",
      "agents", 'USER_STATUS_DATA_1', 'USER_STATUS_DATA_2',
      'USER_TYPE_DATA_1',
      'USER_TYPE_DATA_2'
   ];

   try {
      sqlConnection = mysql.createConnection(sqlConfig);
   } catch (err) {
      writeLog("creating connection err obj: ", err);
   }
   var i = 0;
   sqlConnection.connect(function (err) {
      if (err) {
         writeLog("connection err str: " + err);
         writeLog("connection err obj: ", err);
         throw new Error("Can not Connect To Database");
      } else {
         createTable(i);
      }
   });

   function createTable(i) {
      sqlConnection.query(allTables[i], function (err, result) {
         if (err) {
            if (err.code == ER_TABLE_EXISTS_ERROR) {
               writeLog("'" + tablesNameList[i] + "' table already exists");
            } else {
               //writeLog("error while create table '" + tablesNameList[i] + "': ", err);
            }
         } else {
            //writeLog("result of create table '" + allTables[i] + "': ", result);
         }
         createNest();
      });
   }
   function createNest() {
      i++;
      if (i < allTables.length) {
         createTable(i);
      } else {
         sqlConnection.end();
      }
   }
}

// sample data to query
// { $table: 'tab', $fields: ['col1', 'col2'], $filter: 'col3="fildata"' }
function query(queryObj, callback) {
   writeLog("call on query");
   if (!queryObj) {
      return;
   }

   var i = 0;
   try {
      sqlConnection = mysql.createConnection(sqlConfig);

   } catch (err) {
      writeLog("creating connection err obj: ", err);
      callback(err);
   }
   sqlConnection.connect(function (err) {
      if (err) {
         writeLog("connection err obj: ", err);
         callback(err);
      } else {
         var tableName = queryObj.$table;
         var fields = queryObj.$fields || [];
         var filter = queryObj.$filter;
         var columns = "";
         if (!Array.isArray(fields)) {
            fields = [fields];
         }
         if (fields.length == 0) {
            columns = " * ";
         } else {
            for (var i = 0; i < fields.length; i++) {
               if (columns && columns.length > 0) {
                  columns += ",";
               }
               columns += (fields[i] && fields[i].length > 0 ? fields[i] : "");
            }
         }
         var actualQuery = "select " + columns + " from " + tableName;
         if (filter && filter.length > 0) {
            actualQuery += " WHERE " + filter;
         }
         writeLog("actualQuery: " + actualQuery);
         sqlConnection.query(actualQuery, function (err, rows) {
            sqlConnection.end();
            if (err) {
               if (callback) {
                  callback(err)
               }
            } else {
               if (callback) {
                  callback(null, rows);
               }
            }
         });
      }
   });
}

// sample data to insert
// [{ $table: 'tab', $insert: [{ column1: 'value1' }, { column2: 'value2' }] }]
function insert(updates, callback) {
   if (!updates) {
      return;
   }
   var finalResult = {};
   if (!Array.isArray(updates)) {
      updates = [updates];
   }
   writeLog("coming updates: ", updates);
   var i = 0;
   try {
      sqlConnection = mysql.createConnection(sqlConfig);

   } catch (err) {
      writeLog("creating connection err obj: ", err);
   }
   sqlConnection.connect(function (err) {
      if (err) {
         writeLog("connection err obj: ", err);
         callback(err);
      } else {
         function insertDataArray(i) {
            var insertObject = updates[i];
            var tableName = insertObject.$table;

            var insertValues = insertObject.$insert;
            if (!Array.isArray(insertValues)) {
               insertValues = [insertValues];
            }
            var j = 0;

            function insertActualValues(j) {

               var insertValueObject = insertValues[j];
               var columns = "";
               var values = "";
               if (Object.keys(insertValueObject).length > 0) {
                  for (var field in insertValueObject) {
                     if (columns && columns.length > 0) {
                        columns += ",";
                     }
                     columns += field;
                     if (values && values.length > 0) {
                        values += ",";
                     }
                     values += "'" + insertValueObject[field] + "'";
                  }
               }
               var insert = "insert into " + tableName + " (" + columns + ") values (" + values + ")";
               writeLog("calling insert in table: '" + tableName + "' with: " + insert);
               sqlConnection.query(insert, function (err, result) {
                  if (err) {
                     sqlConnection.end();
                     if (callback) {
                        err.tableName = tableName;
                        callback(err);
                     }
                  } else {
                     writeLog("result of inserting table: '" + tableName + "', result: ", result);

                     if (finalResult && finalResult[tableName]) {
                        finalResult[tableName].push(result);
                     } else {
                        finalResult[tableName] = [result];
                     }
                     ++j;
                     if (j < insertValues.length) {
                        insertActualValues(j);
                     } else {
                        ++i;
                        if (i < updates.length) {
                           insertDataArray(i);
                        } else {
                           sqlConnection.end();
                           if (callback) {
                              callback(null, finalResult);
                           }
                        }
                     }
                  }
               });
            }

            insertActualValues(j);
         }

         insertDataArray(i);
      }
   });
}

// sample data to insert
// [{ $table: 'tab', $update: { column1: 'value1' } }]
function update(updates, callback) {
   if (!updates) {
      return;
   }
   var finalResult = {};
   if (!Array.isArray(updates)) {
      updates = [updates];
   }
   writeLog("coming updates: ", updates);
   var i = 0;
   try {
      sqlConnection = mysql.createConnection(sqlConfig);

   } catch (err) {
      writeLog("creating connection err obj: ", err);
   }
   sqlConnection.connect(function (err) {
      if (err) {
         writeLog("connection err obj: ", err);
         callback(err);
      } else {
         function updateDataArray(i) {
            var updateObject = updates[i];
            var tableName = updateObject.$table;

            var updateValueObject = updateObject.$update;
            var updateFilter = updateObject.$filter;
            var updateColumnValue = "";
            if (Object.keys(updateValueObject).length > 0) {
               for (var field in updateValueObject) {
                  if (updateColumnValue && updateColumnValue.length > 0) {
                     updateColumnValue += ",";
                  }
                  updateColumnValue = updateColumnValue + field + " = '" + updateValueObject[field] + "'";
               }
            }
            if (updateFilter && updateFilter.length > 0) {
               updateFilter = " where " + updateFilter
            }
            var updateQuery = "UPDATE " + tableName + " set " + updateColumnValue + updateFilter;
            writeLog("calling updateQuery in table: '" + tableName + "' with: " + updateQuery);
            sqlConnection.query(updateQuery, function (err, result) {
               if (err) {
                  sqlConnection.end();
                  if (callback) {
                     err.tableName = tableName;
                     callback(err);
                  }
               } else {
                  writeLog("result of updating table: '" + tableName + "', result: ", result);

                  i++;
                  if (i < updates.length) {
                     updateDataArray(i);
                  } else {
                     sqlConnection.end();
                     if (callback) {
                        callback(null, { table: tableName, result: result });
                     }
                  }
               }
            });
         }
         updateDataArray(i);
      }
   });
}

function writeLog(log1, log2) {
   console.log(log1 + (log2 ? JSON.stringify(log2) : ""));
}

// var ins = [{ $table: 'tab', $insert: [{ column1: 'value1' }, { column2: 'value2' }] }];
// insert(ins, function (err, result) {
//    writeLog('insert comp');
// });

// var qu = { $table: 'tab', $fields: ['col1', 'col2'], $filter: 'col3="fildata"' };
// query(qu, function () {
//    writeLog('query comp');
// });

// var upd = [{ $table: 'tab', $update: { column1: 'value1' }, $filter: "col1='col2'" }];
// update(upd, function () {
//    writeLog('update completed');
// })

module.exports.query = query;
module.exports.insert = insert;
module.exports.update = update;
module.exports.createDB = createDB;