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
	table_Games           = db.getCollection('games')
	table_Abilities       = db.getCollection('gameAbilities')
	table_abilityFocus    = db.getCollection('abilityFocus')
	table_character       = db.getCollection('characters')
	table_characterStats  = db.getCollection('characterStats')
	table_characterFocus  = db.getCollection('characterFocus')
	table_stunts          = db.getCollection('stunts')
	if (!table_Games)           { table_Games           = db.addCollection('games') }
	if (!table_abilityFocus)    { table_abilityFocus    = db.addCollection('abilityFocus') }
	if (!table_Abilities)       { table_Abilities       = db.addCollection('gameAbilities'); loadAbilities(); }
	if (!table_character)       { table_character       = db.addCollection('characters') }
	if (!table_characterStats)  { table_characterStats  = db.addCollection('characterStats') }
	if (!table_characterFocus)  { table_characterFocus  = db.addCollection('characterFocus') }
	if (!table_stunts)          { table_stunts          = db.addCollection('stunts'); loadStunts(); }
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

			case 'initgame':
				try {
					var gameInit = {
						"ServerID"     : serverID,
						"GameMaster"   : "",
						"AbilityCheck" : 0,
						"FocusCheck"   : 0,
						"CheckActive"  : false
					}
					var gameCheck = table_Games.findOne({"ServerID": serverID})
					if (gameCheck && Object.keys(gameCheck).length) {
						gameCheck["GameMaster"]   = ""
						gameCheck["AbilityCheck"] = 0
						gameCheck["FocusCheck"]   = 0
						gameCheck["CheckActive"]  = false
						table_Games.update(gameCheck)
					} else {
						table_Games.insert(gameInit)
					}

					channels = bot.servers[serverID].channels
					channelKeys = Object.keys(channels)
					for (var i = 0; i < channelKeys.length; i++) {
						logger.info(channels[channelKeys[i]])
						if (channels[channelKeys[i]].name == "character-sheets" || channels[channelKeys[i]].name == "gm-channel") {
							bot.deleteChannel(channelKeys[i])
						}
					}

					bot.createChannel({
						serverID: serverID,
						name: 'gm-channel'
					}, function(err, rsp){
						var gameCheck = table_Games.findOne({"ServerID": serverID})
						if (gameCheck && Object.keys(gameCheck).length) {
							gameCheck["GMChannel"]   = rsp.id
							table_Games.update(gameCheck)
						}
						db.saveDatabase();
					})

					bot.createChannel({
						serverID: serverID,
						name: 'character-sheets',
						type: "category"
					}, function(err, rsp){
						var gameCheck = table_Games.findOne({"ServerID": serverID})
						if (gameCheck && Object.keys(gameCheck).length) {
							gameCheck["sheetChannel"]   = rsp.id
							table_Games.update(gameCheck)
						}
						db.saveDatabase();
					})

					db.saveDatabase();
				}
				catch(err) {
					handleError(err)
				}
			break;
			case 'loadgamedata':
				try {
					loadAbilities();
					loadStunts();
				}
				catch(err) {
					handleError(err)
				}

			case 'setgm':
				try {
					var gameCheck = table_Games.findOne({"ServerID": serverID})
					if (gameCheck && Object.keys(gameCheck).length) {
						gameCheck["GameMaster"] = userID
						table_Games.update(gameCheck)
					} else {
						// Game not found
					}
					db.saveDatabase();
				}
				catch(err) {
					handleError(err)
				}
			break;
			case 'setcheck':
				try {
					if (!isGameMaster(serverID, userID)){
						bot.sendMessage({
							to: channelID,
							message: "Command can only be used by the Game Master"
						});
						return
					}
					var FocusCheckID = 0;
					var abilityCheckID = 0;
					var checkName = args[0].toLowerCase()
					var FocusCheck = table_abilityFocus.findOne({"nameLower": checkName})
					var abilityCheck = table_Abilities.findOne({"nameLower": checkName})
					if (FocusCheck && Object.keys(FocusCheck).length) {
						FocusCheckID = FocusCheck['$loki'];
                        abilityCheckID = FocusCheck['abilityID'];
					} else if (abilityCheck && Object.keys(abilityCheck).length) {
                        abilityCheckID = abilityCheck['$loki'];
					} else {
						// Entered avlue didn't match ability or focus
						bot.sendMessage({
							to: channelID,
							message: "Could not find ability or focus matching '" + checkName + "'"
						});
						return
					}

					var gameCheck = table_Games.findOne({"ServerID": serverID})
					if (gameCheck && Object.keys(gameCheck).length) {
						gameCheck["AbilityCheck"] = abilityCheckID
						gameCheck["FocusCheck"]   = FocusCheckID
						gameCheck["CheckActive"]  = true
						table_Games.update(gameCheck)
					} else {
						// Game not found
					}
					db.saveDatabase();
				}
				catch(err) {
					handleError(err)
				}
			break;
			case 'endcheck':
				try {
					if (!isGameMaster(serverID, userID)){
						bot.sendMessage({
							to: channelID,
							message: "Command can only be used by the Game Master"
						});
						return
					}
					var gameCheck = table_Games.findOne({"ServerID": serverID})
					if (gameCheck && Object.keys(gameCheck).length) {
						gameCheck["AbilityCheck"] = 0
						gameCheck["FocusCheck"]   = 0
						gameCheck["CheckActive"]  = false
						table_Games.update(gameCheck)
					} else {
						// Game not found
					}
					db.saveDatabase();
				}
				catch(err) {
					handleError(err)
				}
			break;

			case 'addcharacter':
				try {
					var gameID = 0;
					var characterName = args[0]
					if (characterName.length == 0){
						return;
					}

					var gameCheck = table_Games.findOne({"ServerID": serverID})
					if (gameCheck && Object.keys(gameCheck).length) {
						gameID = gameCheck['$loki']
					} else {
						// Game not found
						return;
					}
					var sheetChannel = gameCheck['sheetChannel']

					var baseCharacter = {
						"GameID" : gameID,
						"UserID" : userID,
						"name"   : characterName
					}
					var characterCheck = table_character.findOne({"UserID" : userID})
					if (characterCheck && Object.keys(characterCheck).length) {
						var characterAbilityCheck = table_characterStats.find({"CharacterID" : characterCheck['$loki']})
						table_character.remove(characterCheck['$loki'])
						for (var i = 0; i < characterAbilityCheck.length; i++) {
							table_characterStats.remove(characterAbilityCheck[i]['$loki'])
						}
					}

					var newCharacter = table_character.insert(baseCharacter)
					var abilities = table_Abilities.find({})

					for (var i = 0; i < abilities.length; i++) {
						table_characterStats.insert({
							"CharacterID" : newCharacter['$loki'],
							"AbilityID"   : abilities[i]['$loki'],
							"score"       : 0
						})
					}

					bot.editNickname({
						"serverID" : serverID,
						"userID"   : userID,
						"nick"     : characterName
					}, handleError)
					bot.createChannel({
						"serverID"  : serverID,
						"name"      : characterName,
						"parentID"  : sheetChannel
					}, function(err, rsp){
						newCharacter["channelID"] = rsp.id
						table_character.update(newCharacter)
						db.saveDatabase();
						pinCharacterStats(userID)
					})

					db.saveDatabase();
				}
				catch(err){
					handleError(err)
				}
			break;
			case 'mystats':
				try {
					var characterCheck = table_character.findOne({"UserID" : userID})
					if (!characterCheck || !Object.keys(characterCheck).length) {
						//character not found
						console.log("character not found")
						return;
					}
					var stats = getCharacterStats(userID)
					var outputStr = ""
					outputStr += "**" + characterCheck['name'] + "**'s stats\n"
					for (var i = 0; i < stats.length; i++) {
						outputStr += stats[i]['name'] + ": " + stats[i]['score'] + "\n"
					}
					bot.sendMessage({
						to: channelID,
						message: outputStr
					});
				}
				catch(err){
					handleError(err)
				}
			break;
			case 'setstat':
				try {
					var statName = args[0].toLowerCase()
					var statValue = Number.parseInt(args[1])
					if (!Number.isInteger(statValue)) {
						//Value not an integer
						console.log("Value not an integer")
						return;
					}

					var characterCheck = table_character.findOne({"UserID" : userID})
					if (!characterCheck || !Object.keys(characterCheck).length) {
						//character not found
						console.log("character not found")
						return;
					}
					var characterID = characterCheck['$loki']

					var abilityCheck = table_Abilities.findOne({'$or':[{"nameLower":statName},{"shortName":statName}]})
					if (!abilityCheck || !Object.keys(abilityCheck).length) {
						//ability not found
						console.log("ability not found")
						return;
					}
					var abilityID = abilityCheck['$loki']

					var statCheck = table_characterStats.findOne({"CharacterID" : characterID, "AbilityID" : abilityID})
					if (statCheck && Object.keys(statCheck).length) {
						statCheck['score'] = statValue
						table_characterStats.update(statCheck)
					}

					pinCharacterStats(userID)
					db.saveDatabase()
				}
				catch(err){
					handleError(err)
				}
			break;

			default:
				try {
					logger.info("User " + user + " used an unknown command.")
					logger.info("'" + message + "'" )
				}
				catch(err){
					handleError(err)
				}
				bot.sendMessage({
					to: channelID,
					message: "I don't know that one"
				});
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
			"nameLower": AbilityList[i].name.toLowerCase(),
			"name": AbilityList[i].name,
			"shortName": AbilityList[i].shortName
		})
		var focusList = AbilityList[i].focusList;
		for (var j = 0; j < focusList.length; j++)
		{
			table_abilityFocus.insert({
				"nameLower": focusList[j].toLowerCase(),
				"name": focusList[j],
				"abilityID": insAbility['$loki']
			})
		}
	}
	db.saveDatabase()
}

var isGameMaster = function(serverID, userID) {
	var gameCheck = table_Games.findOne({"ServerID": serverID})
	if (gameCheck && Object.keys(gameCheck).length) {
		return gameCheck["GameMaster"] == userID
	} else {
		// Game not found
	}
	return false;
}

var getCharacterStats = function(userID) {
	var characterCheck = table_character.findOne({"UserID" : userID})
	if (!characterCheck || !Object.keys(characterCheck).length) {
		//character not found
		console.log("character not found")
		return [];
	}
	var characterID = characterCheck['$loki']
	// var characterStats = table_characterStats.find({"CharacterID" : characterID})

	var join = table_Abilities.chain().eqJoin(table_characterStats.chain(), '$loki', 'AbilityID').data()

	var results = []
	for (var i = 0; i < join.length; i++) {
		results.push({"name": join[i]['left']['name'], "score": join[i]['right']['score']})
	}
	return results;
}

var pinCharacterStats = function(userID) {
	var characterCheck = table_character.findOne({"UserID" : userID})
	if (!characterCheck || !Object.keys(characterCheck).length) {
		//character not found
		console.log("character not found")
		return [];
	}
	var stats = getCharacterStats(userID)
	var characterChannel = characterCheck["channelID"]
	var characterPinnedStats = characterCheck["pinnedStats"]
	var outputStr = ""
	outputStr += "**" + characterCheck['name'] + "**'s stats\n"
	for (var i = 0; i < stats.length; i++) {
		outputStr += stats[i]['name'] + ": " + stats[i]['score'] + "\n"
	}
	if (characterPinnedStats) {
		bot.deleteMessage({
			channelID: characterChannel,
			messageID: characterPinnedStats
		})
	}
	bot.sendMessage({
		to: characterChannel,
		message: outputStr
	}, function(err, rsp){
		characterCheck["pinnedStats"] = rsp.id;
		bot.pinMessage({
			channelID: characterChannel,
			messageID: rsp.id
		})
	});

}

var handleError = function(err, rsp) {
	errorLog.error("======================")
	errorLog.error(err, rsp)
	errorLog.error("======================")
}