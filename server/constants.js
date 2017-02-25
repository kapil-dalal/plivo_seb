
var USER_TYPES = {
   CUSTOMER: 1,
   AGENT: 2
}

var USER_STATUS = {
   ACTIVE: 1,
   INACTIVE: 2
}

var AGENT_STATUS_TYPE = {
   FREE: 1,
   ENGAGED: 2,
   OFF_LINE: 3
}

var SCHEMA_NAMES = {
   USER_STATUS: 'user_status',
   AGENT_STATUS_TYPE: 'agent_status_types',
   AGENT_STATUS: 'agent_status',
   USERS: 'users',
   AGENTS: 'agents',
   USER_TYPES: 'user_types'
}

var SCHEMA_USER_STATUS = {
   ID: 'id',
   NAME: 'name'
}

var SCHEMA_USER_TYPES = {
   ID: 'id',
   NAME: 'name'
}

var SCHEMA_AGENT_STATUS_TYPES = {
   ID: 'id',
   NAME: 'name'
}

var SCHEMA_AGENT_STATUS = {
   ID: 'id',
   AGENT_ID: 'agent_id',
   USER_ID: 'user_id',
   STATUS_ID: 'status_id',
   CALL_UUID: 'call_uuid',
}

var SCHEMA_USERS = {
   ID: 'id',
   EMAIL_ID: 'email_id',
   USER_NAME: 'user_name',
   PASSWORD: 'password',
   NAME: 'name',
   PHONE_NUMBER: 'phone_number',
   TYPE_ID: 'type_id',
   STATUS_ID: 'status_id',
}

var SCHEMA_AGENTS = {
   ID: 'id',
   NAME: 'name',
   EMAIL_ID: 'email_id',
   PHONE_NUMBER: 'phone_number',
   SIP: 'sip',
   SIP_ID: 'sip_id',
   SIP_APP_ID: 'sip_app_id',
   SIP_USER_NAME: 'sip_user_name',
   SIP_PASSWORD: 'sip_password',
   TYPE_ID: 'type_id',
   USER_ID: 'user_id',
   STATUS_ID: 'status_id',
}

var TO_SIP = "sip:kapilagent1170208155150@phone.plivo.com"

module.exports.USER_TYPES = USER_TYPES;
module.exports.USER_STATUS = USER_STATUS;
module.exports.AGENT_STATUS_TYPE = AGENT_STATUS_TYPE;
module.exports.SCHEMA_NAMES = SCHEMA_NAMES;

module.exports.SCHEMA_USER_STATUS = SCHEMA_USER_STATUS;
module.exports.SCHEMA_USER_TYPES = SCHEMA_USER_TYPES;
module.exports.SCHEMA_AGENT_STATUS_TYPES = SCHEMA_AGENT_STATUS_TYPES;
module.exports.SCHEMA_AGENT_STATUS = SCHEMA_AGENT_STATUS;
module.exports.SCHEMA_USERS = SCHEMA_USERS;
module.exports.SCHEMA_AGENTS = SCHEMA_AGENTS;
module.exports.TO_SIP = TO_SIP;