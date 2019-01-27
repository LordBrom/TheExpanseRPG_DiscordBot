// invite URL: https://discordapp.com/oauth2/authorize?&client_id=539184567492280350&scope=bot&permissions=8
const Discord       = require('discord.io');
const auth          = require('./auth.json');
const loki          = require('lokijs');
const logger        = require('logger').createLogger('./logs/log_dev.log');
const errorLog      = require('logger').createLogger('./logs/log_error.log');
const serverLog     = require('logger').createLogger('./logs/log_server.log');

const StuntList     = require('./StuntList.js');
const AbilityList   = require('./AbilityList.js');

var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

var db = new loki('GameDB.json')
db.loadDatabase({}, function (result) {
	// logger.info(result);
	// put your log call here.
	table_Abilities    = db.getCollection('gameAbilities')
	table_abilityFocus = db.getCollection('abilityFocus')
	table_playerStats  = db.getCollection('playerStats')
	table_stunts       = db.getCollection('stunts')
	if (!table_abilityFocus) { table_abilityFocus = db.addCollection('abilityFocus') }
	if (!table_Abilities)    { table_Abilities    = db.addCollection('gameAbilities'); loadAbilities(); }
	if (!table_playerStats)  { table_playerStats  = db.addCollection('playerStats') }
	if (!table_stunts)       { table_stunts       = db.addCollection('stunts'); loadStunts(); }
});

bot.on('ready', function (evt) {
	serverLog.info('Connected');
	serverLog.info('Logged in as: ');
	serverLog.info(bot.username + ' - (' + bot.id + ')');
}, handleError);

bot.on('message', function (user, userID, channelID, message, evt) {
	if (userID == bot.id) {
		return;
	}
	var serverID  = evt.d.guild_id;
	var messageID = evt.d.id;
	var channels  = bot.servers[serverID].channels;

	// Our bot needs to know if it will execute a command
	// It will listen for messages that will start with `!`
	if (message.substring(0, 1) == '!') {
		var args = message.substring(1).split(' ');
		var cmd = args[0];

		args = args.splice(1);
		switch(cmd.toLowerCase()) {
			// !ping
			case 'ping':
				try {
					bot.sendMessage({
						to: channelID,
						message: 'Pong!'
					});
				}
				catch(err) {
					handleError(err)
				}
			break;
		}
	}
});

var loadStunts = function() {
	table_stunts.clear();
	for (var i = 0; i < StuntList.length; i++)
	{
		table_stunts.insert({
			"name": StuntList[i].name,
			"type": StuntList[i].type,
			"desc": StuntList[i].desc,
			"min":  StuntList[i].min,
			"max":  StuntList[i].max
		})
	}
	db.saveDatabase()
}

var loadAbilities = function() {
	table_Abilities.clear();
	table_abilityFocus.clear();
	for (var i = 0; i < AbilityList.length; i++)
	{
		var insAbility = table_Abilities.insert({
			"name": AbilityList[i].name,
			"shortName": AbilityList[i].shortName
		})
		var focusList = AbilityList[i].focusList;
		for (var j = 0; j < focusList.length; j++)
		{
			table_abilityFocus.insert({
				"name": focusList[j],
				"abilityID": insAbility['$loki']
			})
		}
	}
	logger.info(table_Abilities)
	logger.info(table_abilityFocus)
	db.saveDatabase()
}

var handleError = function(err, rsp) {
	errorLog.error("======================")
	errorLog.error(err, rsp)
	errorLog.error("======================")
}