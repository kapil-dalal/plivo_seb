var express = require('express');
var dbService = require('../db/db.service');
var constants = require('../constants');
var router = express.Router();

module.exports = router;
// var config = require('../config');
// var plivoApi = config.plivoApi;

router.post('/session', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   if (!data.email_id || !data.name || !data.phone_number) {
      response.status(500).send(new Error('Name / Email / Phone Number can not left blank'));
      return;
   }


   var customerData = {};
   customerData[constants.SCHEMA_CUSTOMERS.NAME] = data.name;
   customerData[constants.SCHEMA_CUSTOMERS.EMAIL_ID] = data.email_id;
   customerData[constants.SCHEMA_CUSTOMERS.PHONE_NUMBER] = data.phone_number;
   customerData[constants.SCHEMA_CUSTOMERS.ADDRESS_1] = data.address_1;
   customerData[constants.SCHEMA_CUSTOMERS.ADDRESS_2] = data.address_2;
   customerData[constants.SCHEMA_CUSTOMERS.CITY] = data.city;
   customerData[constants.SCHEMA_CUSTOMERS.STATE] = data.state;
   customerData[constants.SCHEMA_CUSTOMERS.COUNTRY] = data.country;
   writeLog('customerData: ', customerData);

   try {
      var query = {
         $table: constants.SCHEMA_NAMES.CUSTOMERS,
         $filter: constants.SCHEMA_CUSTOMERS.EMAIL_ID + " = '" + data.email_id + "' and " + constants.SCHEMA_CUSTOMERS.PHONE_NUMBER + " = '" + data.phone_number + "'"
      };
      dbService.query(query, function (err, customerResult) {
         if (err) {
            writeLog('users err: ', err);
            response.status(500).send(err);
         } else {
            customerResult = customerResult[0];
            if (customerResult) {
               var updates = [
                  {
                     $table: constants.SCHEMA_NAMES.CUSTOMERS,
                     $update: customerData,
                     $filter: constants.SCHEMA_CUSTOMERS.ID + "='" + customerResult[constants.SCHEMA_CUSTOMERS.ID] + "'"
                  }
               ];
               dbService.update(updates, function (err, customerUpdateResult) {
                  if (err) {
                     writeLog('customer session err: ', err);
                     response.status(500).send(err);
                  } else {
                     var customerId = customerResult[constants.SCHEMA_CUSTOMERS.ID];
                     // response.cookie("customerSessionPlivo", customerId);
                     response.send(JSON.stringify({ customerId: customerId }));
                  }
               });
            } else {
               dbService.insert([{ $table: constants.SCHEMA_NAMES.CUSTOMERS, $insert: [customerData] }], function (err, customerInsertResult) {
                  if (err) {
                     writeLog('customer session err: ', err);
                     response.status(500).send(err);
                  } else {
                     var customerId = customerInsertResult[constants.SCHEMA_NAMES.CUSTOMERS][0].insertId;
                     // response.cookie("customerSessionPlivo", customerId);
                     response.send(JSON.stringify({ customerId: customerId }));
                  }
               });
            }
         }
      })
   } catch (err) {
      response.status(500).send(err);
   }
});

function writeLog(log1, log2) {
   // console.log(log1 + (log2 ? JSON.stringify(log2) : ""));
}
