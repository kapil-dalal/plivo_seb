var dbService = require('../db/db.service');
var constants = require('../constants');

function getFreeAgent(cb) {
   var agentStatusQuery = {
      $table: constants.SCHEMA_NAMES.AGENT_STATUS,
      $filter: constants.SCHEMA_AGENT_STATUS.STATUS_ID + " = " + constants.AGENT_STATUS_TYPE.FREE,
      $limit: 1
   };
   dbService.query(agentStatusQuery, function (err, agetntStatusResult) {
      if (err) {
         response.status(500).send(err);
         return;
      }
      if (agetntStatusResult && agetntStatusResult.length > 0) {
         var agentId = agetntStatusResult[0][constants.SCHEMA_AGENT_STATUS.AGENT_ID];
         var agentQuery = {
            $table: constants.SCHEMA_NAMES.AGENTS,
            $filter: constants.SCHEMA_AGENTS.ID + " = " + agentId
         };
         dbService.query(agentQuery, function (err, agetntResult) {
            if (err) {
               response.status(500).send(err);
               return;
            }
            if (cb)
               cb(agetntResult[0]);
         });
      } else {
         if (cb)
            cb(null);
      }

   });
}

function updateAgentStatusagentDetails(agentDetails, status, cb) {
   var agentId = agentDetails[constants.SCHEMA_AGENTS.ID];
   var agentUpdate = {}
   agentUpdate[constants.SCHEMA_AGENT_STATUS.STATUS_ID] = status;

   var updates = [
      {
         $table: constants.SCHEMA_NAMES.AGENT_STATUS,
         $update: agentUpdate,
         $filter: constants.SCHEMA_AGENT_STATUS.ID + "=" + agentId
      }
   ];
   dbService.update(updates, function (err, result) {
      if (cb)
         cb();
   })
}

module.exports.updateAgentStatusagentDetails = updateAgentStatusagentDetails;
module.exports.getFreeAgent = getFreeAgent;
