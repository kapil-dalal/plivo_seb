var serverHOST = "https://35.165.241.189:3010";

var sqlConfig = {
   host: "plivotest.csa6sdoa57s6.us-west-2.rds.amazonaws.com",
   port: "3306",
   user: "root",
   password: "root1234",
   database: "plivo_test"
};
var sqlLocalConfig = {
   host: "localhost",
   port: "3306",
   user: "root",
   password: "root",
   database: "plivo_test"
}

var plivoAuthId = "SAMZHMYMQ2NMFJMWM0OW";
var plivoTokenId = "MjYwYTM1N2Y3NGNlNmZiNDJiN2U4MGZhYzY2NmE5";

var plivoApi = require('plivo').RestAPI({
   authId: plivoAuthId,
   authToken: plivoTokenId
});

module.exports.server = serverHOST;
module.exports.sqlConfig = sqlConfig;
module.exports.sqlLocalConfig = sqlLocalConfig;
module.exports.plivoApi = plivoApi;