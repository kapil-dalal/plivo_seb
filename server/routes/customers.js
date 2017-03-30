var express = require('express');
var dbService = require('../db/db.service');
var constants = require('../constants');
var router = express.Router();

module.exports = router;
var config = require('../config');
var plivoApi = config.plivoApi;

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

router.get('/customers', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('/customers/ data: ', data);

   var query = {
      $table: constants.SCHEMA_NAMES.CUSTOMERS,
      $filter: null,
      limit: data.limit || 100
   };
   dbService.query(query, function (err, customerResult) {
      if (err) {
         writeLog('customer list err: ', err);
         response.status(500).send(err);
      } else {
         response.send(JSON.stringify(customerResult));
      }
   });
});

router.post('/send_sms', function (request, response) {
   var data = (request.query && Object.keys(request.query).length > 0) ? request.query : request.body;
   writeLog('/send_sms/ data: ', data);
   var fromAgentId = data.agent_id;
   var toCustomerId = data.customer_id;
   var toCustomerNumber = data.number;
   var message = data.message;
   var smsData = {};
   smsData[constants.SCHEMA_SMS_DETAILS.AGENT_ID] = fromAgentId;
   smsData[constants.SCHEMA_SMS_DETAILS.TO_CUSTOMER_ID] = toCustomerId;
   smsData[constants.SCHEMA_SMS_DETAILS.TO_CUSTOMER_NUMBER] = toCustomerNumber;
   smsData[constants.SCHEMA_SMS_DETAILS.MESSAGE] = message;
   smsData[constants.SCHEMA_SMS_DETAILS.DATE] = new Date();

   var params = {
      'src': '1111111111', // Sender's phone number with country code
      'dst': toCustomerNumber, // Receiver's phone Number with country code
      'text': message,
      //  'url' : "https://intense-brook-8241.herokuapp.com/report/", // The URL to which with the status of the message is sent
      //  'method' : "GET" // The method used to call the url
   };

   plivoApi.send_message(params, function (status, res) {
      if (status >= 200 && status <= 300) {
         response.send(JSON.stringify({ code: 200, message: 'sms sent' }));
         smsData[constants.SCHEMA_SMS_DETAILS.UUID] = res.message_uuid[0];
         dbService.insert([{ $table: constants.SCHEMA_NAMES.SMS_DETAILS, $insert: [smsData] }], function (err, result) {
            if (err) {
               writeLog('SMS_DETAILS err: ', err);
            }
         });
      } else {
         response.status(500).send(new Error('not able to send sms'));
      }
   });
})

function writeLog(log1, log2) {
   // console.log(log1 + (log2 ? JSON.stringify(log2) : ""));
}
