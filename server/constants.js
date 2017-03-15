
var USER_TYPES = {
   CUSTOMER: 1,
   AGENT: 2
}

var CALL_TYPES = {
   INBOUND: 'Inbound',
   OUTBOUND: 'Outbound'
}

var USER_STATUS = {
   ACTIVE: 1,
   INACTIVE: 2
}

var CALL_STATUS = {
   WAITING: 1,
   IN_PROGRESS: 2,
   COMPLETED: 3,
   NOT_ANSWERED: 4
}

var AGENT_STATUS_TYPES = {
   FREE: 1,
   ENGAGED: 2,
   OFF_LINE: 3
}

var SCHEMA_NAMES = {
   CALL_STATUS_TYPES: 'call_status_types',
   CALL_DETAILS: 'call_details',
   USER_STATUS: 'user_status',
   AGENT_STATUS_TYPES: 'agent_status_types',
   AGENT_STATUS: 'agent_status',
   CUSTOMERS: 'customers',
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

var SCHEMA_CALL_STATUS_TYPES = {
   ID: 'id',
   NAME: 'name'
}

var SCHEMA_CALL_DETAILS = {
   ID: 'id',
   FROM_CUSTOMER_ID: 'from_customer_id',
   CALL_UUID: 'uuid',
   RECORD_URI: 'record_url',
   DURATION: 'duration',
   BILLED_DURATION: 'billed_duration',
   DIRECTION: 'direction',
   JOIN_TIME: 'join_time',
   END_TIME: 'end_time',
   DATE: 'date',
   AMOUNT: 'amount',
   STATUS_ID: 'status_id',
   AGENT_ID: 'agent_id',
}

var SCHEMA_CUSTOMERS = {
   ID: 'id',
   NAME: 'name',
   EMAIL_ID: 'email_id',
   PHONE_NUMBER: 'phone_number',
   ADDRESS_1: 'address_1',
   ADDRESS_2: 'address_2',
   CITY: 'city',
   STATE: 'state',
   COUNTRY: 'country',
}

var FROM_SIP = "sip:kapilmakecall170208155025@phone.plivo.com"
var TO_NUMBER = "+41615019508"

module.exports.USER_TYPES = USER_TYPES;
module.exports.CALL_TYPES = CALL_TYPES;
module.exports.USER_STATUS = USER_STATUS;
module.exports.CALL_STATUS = CALL_STATUS;

module.exports.AGENT_STATUS_TYPES = AGENT_STATUS_TYPES;
module.exports.SCHEMA_NAMES = SCHEMA_NAMES;

module.exports.SCHEMA_CUSTOMERS = SCHEMA_CUSTOMERS;
module.exports.SCHEMA_USER_STATUS = SCHEMA_USER_STATUS;
module.exports.SCHEMA_USER_TYPES = SCHEMA_USER_TYPES;
module.exports.SCHEMA_AGENT_STATUS_TYPES = SCHEMA_AGENT_STATUS_TYPES;
module.exports.SCHEMA_AGENT_STATUS = SCHEMA_AGENT_STATUS;
module.exports.SCHEMA_USERS = SCHEMA_USERS;
module.exports.SCHEMA_AGENTS = SCHEMA_AGENTS;
module.exports.SCHEMA_CALL_STATUS_TYPES = SCHEMA_CALL_STATUS_TYPES;
module.exports.SCHEMA_CALL_DETAILS = SCHEMA_CALL_DETAILS;

module.exports.FROM_SIP = FROM_SIP;
module.exports.TO_NUMBER = TO_NUMBER;