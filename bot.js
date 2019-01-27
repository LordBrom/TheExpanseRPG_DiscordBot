const Discord       = require('discord.io');
const auth          = require('./auth.json');
const loki          = require('lokijs');
const logger        = require('logger').createLogger('log_dev.log');
const errorLog      = require('logger').createLogger('log_error.log');
const serverLog     = require('logger').createLogger('log_server.log');

const StuntList     = require('./StuntList.js');
const abilityList   = require('./AbilityList.js');

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});