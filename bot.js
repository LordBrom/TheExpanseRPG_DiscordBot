// invite URL: https://discordapp.com/oauth2/authorize?&client_id=539184567492280350&scope=bot&permissions=8
const Discord       = require('discord.io');
const auth          = require('./auth.json');
const loki          = require('lokijs');
const logger        = require('logger').createLogger('./logs/log_dev.log');
const errorLog      = require('logger').createLogger('./logs/log_error.log');
const serverLog     = require('logger').createLogger('./logs/log_server.log');
const commandLog    = require('logger').createLogger('./logs/log_command.log');

const StuntList     = require('./StuntList.js');
const AbilityList   = require('./AbilityList.js');

const ExpanseRPG = require('./ExpanseRPG.js');

const bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
// Production Database
//var db = new loki('GameDB.json')
// Development Database
const db = new loki('GameDB_DEV.json')

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
		commandLog.info(channelID + " " + user + ": " + message)
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
					handleError(err, {}, new Error().stack)
				}
			break;

			case 'initgame':
				try {
					initGame(serverID)
				}
				catch(err) {
					handleError(err, {}, new Error().stack)
				}
			break;
			case 'loadgamedata':
				try {
					loadAbilities();
					loadStunts();
				}
				catch(err) {
					handleError(err, {}, new Error().stack)
				}

			case 'setgm':
				try {
					setGameMaster(serverID, userID)
				}
				catch(err) {
					handleError(err, {}, new Error().stack)
				}
			break;
			case 'setcheck':
				try {
					var checkName = args.join(' ').toLowerCase()
					setCheck(serverID, channelID, userID, checkName)
				}
				catch(err) {
					handleError(err, {}, new Error().stack)
				}
			break;
			case 'endcheck':
				try {
					endCheck(serverID)
				}
				catch(err) {
					handleError(err, {}, new Error().stack)
				}
			break;
			case 'activecheck':
				try {
					console.log('test')
					activeCheck(serverID, channelID)
				}
				catch(err) {
					handleError(err, {}, new Error().stack)
				}
			break;

			case 'roll':
			case 'check':
			case 'simple':
				try {
					simpleCheck(serverID, channelID, userID)
				}
				catch(err) {
					handleError(err, {}, new Error().stack)
				}
			break;

			case 'addcharacter':
				try {
					var gameID = 0;
					var characterName = args.join(' ').toLowerCase()
					if (characterName.length == 0){
						return;
					}

					addCharacter(serverID, userID, characterName);
				}
				catch(err){
					handleError(err, {}, new Error().stack)
				}
			break;
			case 'mystats':
				try {
					myStats(serverID, channelID, userID)
				}
				catch(err){
					handleError(err, {}, new Error().stack)
				}
			break;
			case 'setstat':
				try {
					var statName = args[0].toLowerCase()
					var statValue = Number.parseInt(args[1])
					if (!Number.isInteger(statValue)) {
						//Value not an integer
						throw("Value not an integer")
						return;
					}
					setStat(serverID, userID, statName, statValue)
				}
				catch(err){
					handleError(err, {}, new Error().stack)
				}
			break;
			case 'addfocus':
				try {
					var focusName = args.join(' ').toLowerCase()
					// addFocus(userID, focusName)
				}
				catch(err){
					handleError(err, {}, new Error().stack)
				}
			break;
			case 'removefocus':
				try {
					var focusName = args.join(' ').toLowerCase()
					// removeFocus(userID, focusName)
				}
				catch(err){
					handleError(err, {}, new Error().stack)
				}
			break;



			case 'help':
				try {
					var outputStr = "";
					outputStr += "ping"          + ":  " + "\n";
					outputStr += "initgame"      + ":  " + "\n";
					outputStr += "loadgamedata"  + ":  " + "\n";
					outputStr += "setgm"         + ":  " + "\n";
					outputStr += "setcheck*"     + ":  " + "\n";
					outputStr += "endcheck*"     + ":  " + "\n";
					outputStr += "activecheck"   + ":  " + "\n";
					outputStr += "roll"          + ":  " + "\n";
					outputStr += "addcharacter"  + ":  " + "\n";
					outputStr += "mystats"       + ":  " + "\n";
					outputStr += "setstat"       + ":  " + "\n";
					outputStr += "addfocus"      + ":  " + "\n";
					outputStr += "removefocus"   + ":  " + "\n";
					outputStr += "help"          + ":  " + "\n";
					outputStr += "*GM command";

					bot.sendMessage({
						to: channelID,
						message: outputStr
					});
				}
				catch(err){
					handleError(err, {}, new Error().stack)
				}
			break;


			default:
				try {
					logger.info("User " + user + " used an unknown command.")
					logger.info("'" + message + "'" )
				}
				catch(err){
					handleError(err, {}, new Error().stack)
				}
				bot.sendMessage({
					to: channelID,
					message: "I don't know that one. try !help"
				});
			break;
		}
	}
});

var handleError = function(err, rsp, callstack) {
	errorLog.error("======================")
	errorLog.error(err, rsp, callstack)
	errorLog.error("======================")
}

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

var getCharacterStats = function(i_serverID, i_userID) {
	var characterCheck = table_character.findOne({ "ServerID" : i_serverID, "UserID" : i_userID})
	if (!characterCheck || !Object.keys(characterCheck).length) {
		//character not found
		throw("character not found")
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

var pinCharacterStats = function(i_serverID, i_userID) {
	var characterCheck = table_character.findOne({ "ServerID" : i_serverID, "UserID" : i_userID})
	if (!characterCheck || !Object.keys(characterCheck).length) {
		//character not found
		throw("character not found")
		return [];
	}
	var stats = getCharacterStats(i_serverID, i_userID)
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
		try {
			if (err) {
				handleError(err, {}, new Error().stack)
			} else {
				characterCheck["pinnedStats"] = rsp.id;
				bot.pinMessage({
					channelID: characterChannel,
					messageID: rsp.id
				})
			}
		} catch(err) {
			handleError(err, {}, new Error().stack)
		}
	});
}

var outputStunts = function(i_channelID, find, sort, incDesc = false) {
	var stunts = getStunts(find, sort)
	var outputStr = "";
	var currentStuntType = "";
	for (var i = 0; i < stunts.length; i++)
	{
		if (stunts[i].type != currentStuntType)
		{
			if (currentStuntType != "")
			{
				bot.sendMessage({
					to: i_channelID,
					message: outputStr
				});
				outputStr = ""
			}
			outputStr += " **" + stunts[i].type + "**\n"
			currentStuntType = stunts[i].type
		}
		var costRange = stunts[i].min
		if (stunts[i].min != stunts[i].max) {
			if (stunts[i].max == 6) {
				costRange += "+"
			} else {
				costRange += " - " + stunts[i].max
			}
		}
		outputStr += "(" + costRange + ") " + stunts[i].name
		if (incDesc)
		{
		   outputStr +=  ": " + "*" + stunts[i].desc + "*"
		}
	   outputStr += "\n"
	}
	bot.sendMessage({
		to: i_channelID,
		message: outputStr
	});
}

var isString = function(str) {
	if (typeof str === 'string' || str instanceof String) {
		return true;
	} else {
		return false;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Expanse RPG functions //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var getGame = function(i_serverID) {
	var gameCheck = table_Games.findOne({"ServerID": i_serverID})
	if (gameCheck && Object.keys(gameCheck).length) {
		return gameCheck;
	} else {
		throw("Game not found")
	}
	return {}
}

var getCharacter = function(i_serverID, i_userID) {
	var characterCheck = table_character.findOne({ "ServerID" : i_serverID, "UserID" : i_userID})
	if (characterCheck && Object.keys(characterCheck).length) {
		return characterCheck;
	} else {
		throw("Character not found")
	}
	return {}
}

var getAbilityByID = function(i_abilityID) {
	var abilityCheck = table_Abilities.findOne({'$loki' : i_abilityID })
	if (abilityCheck && Object.keys(abilityCheck).length) {
		return abilityCheck;
	} else {
		throw("Ability not found")
	}
	return {}
}

var getAbilityByName = function(i_abilityName) {
	var abilityCheck = table_Abilities.findOne({'$or':[{"nameLower":i_abilityName},{"shortName":i_abilityName}]})
	if (abilityCheck && Object.keys(abilityCheck).length) {
		return abilityCheck;
	} else {
		throw("Ability not found")
	}
	return {}
}

var getFocusByID = function(i_focusID) {
	var focusCheck = table_abilityFocus.findOne({'id' : i_focusID })
	if (focusCheck && Object.keys(focusCheck).length) {
		return focusCheck;
	} else {
		throw("focus not found")
	}
	return {}
}

var getStunts = function(find, sort) {
	if (!find || typeof find !== 'object'){find = {}}
	if (!sort || !isString(sort)){sort = ""}

	var stunts = table_stunts.chain().find(find).simplesort(["type", "max"]).data();

	return stunts
}

var getFocusByName = function(i_focusName) {
	var focusCheck = table_abilityFocus.findOne({'$or':[{"nameLower":i_focusName},{"shortName":i_focusName}]})
	if (focusCheck && Object.keys(focusCheck).length) {
		return focusCheck;
	} else {
		throw("focus not found")
	}
	return {}
}

var initGame = function(i_serverID) {
	var initGameObj = {
		"ServerID"     : i_serverID,
		"GameMaster"   : "",
		"AbilityCheck" : 0,
		"FocusCheck"   : 0,
		"CheckActive"  : false,
		"GMChannel"    : 0,
		"SheetChannel" : 0,
		"GMRoleID" 	   : 0,
		"PlayerRoleID" : 0
	}
	var gameObj = table_Games.findOne({"ServerID": i_serverID})

	if (gameObj && Object.keys(gameObj).length) {
		gameObj["GameMaster"]    = ""
		gameObj["AbilityCheck"]  = 0
		gameObj["FocusCheck"]    = 0
		gameObj["CheckActive"]   = false
		gameObj["GMChannel"]     = 0
		gameObj["SheetChannel"]  = 0
		gameObj["GMRoleID"]      = 0
		gameObj["PlayerRoleID"]  = 0
	} else {
		var gameObj = table_Games.insert(initGameObj)
	}

	channels = bot.servers[i_serverID].channels
	channelKeys = Object.keys(channels)
	for (var i = 0; i < channelKeys.length; i++) {
		if (channels[channelKeys[i]].name == "character-sheets") {
			gameObj["SheetChannel"] = channelKeys[i];
		}
		else if ( channels[channelKeys[i]].name == "gm-channel") {
			gameObj["GMChannel"] = channelKeys[i];
		}
	}

	var everyoneRoleID = 0;

	// can change to for (role in roles); //or something...
	roles = bot.servers[i_serverID].roles
	channelKeys = Object.keys(roles)
	for (var i = 0; i < channelKeys.length; i++) {
		if (roles[channelKeys[i]].name.toLowerCase() == "player") {
			gameObj["PlayerRoleID"] = channelKeys[i];
		}
		else if ( roles[channelKeys[i]].name.toLowerCase() == "gamemaster") {
			gameObj["GMRoleID"] = channelKeys[i];
		}
		else if ( roles[channelKeys[i]].name == "@everyone") {
			everyoneRoleID = channelKeys[i];
		}
	}

	// Create GameMaster Role
	if (gameObj["GMRoleID"] == 0) {
		makeGameMasterRole(gameObj, i_serverID, everyoneRoleID);
	} else if (gameObj["GMChannel"] == 0) {
		makeGameMasterChannel(gameObj, i_serverID, gameObj["GMRoleID"], everyoneRoleID);
	} else {
		setGameMasterChannelPermissions(gameObj["GMChannel"], gameObj["GMRoleID"], everyoneRoleID);
	}

	// Create Player Role
	if (gameObj["PlayerRoleID"] == 0) {
		makePlayerRole(gameObj, i_serverID);
	}

	// Create characterSheet channel category
	if (gameObj["SheetChannel"] == 0) {
		makeCharacterSheetChannelCategory(gameObj, i_serverID);
	}

	gameObj = table_Games.update(gameObj)
	db.saveDatabase();
}

var makeCharacterSheetChannelCategory = function(i_gameObj, i_serverID) {
	var SheetChannelID = 0;
	bot.createChannel({
		"serverID": i_serverID,
		"name": 'character-sheets',
		"type": "category"
	}, function(err, rsp){
		try {
			if (err) {
				handleError(err, {}, new Error().stack)
			} else {
				SheetChannelID = rsp.id
				table_Games.update(i_gameObj)
				db.saveDatabase();
			}
		} catch(err) {
			handleError(err, {}, new Error().stack)
		}
	})
}

var makePlayerRole = function(i_gameObj, i_serverID) {
	var PlayerRoleID = 0;
	bot.createRole(i_serverID, function(err, rsp){
		try {
			if (err) {
				handleError(err, {}, new Error().stack)
			} else {
				PlayerRoleID = rsp.id
				bot.editRole({
					"serverID": i_serverID,
					"roleID": PlayerRoleID,
					"name" : "Player",
					"mentionable" : true,
					"hoist" : false,
					"color" : "#6baaec"
				}, function(err, rsp){
					if (err) {
						handleError(err, {}, new Error().stack)
					}
				})
				table_Games.update(i_gameObj)
				db.saveDatabase();
			}
		} catch(err) {
			handleError(err, {}, new Error().stack)
		}
	})
}

var makeGameMasterRole = function(i_gameObj, i_serverID, i_everyoneRoleID) {
	var GMRoleID = 0;
	bot.createRole(i_serverID, function(err, rsp){
		try {
			if (err) {
				handleError(err, {}, new Error().stack)
			} else {
				GMRoleID = rsp.id

				setGameMasterRolePermissions(i_serverID, GMRoleID);

				if (i_gameObj["GMChannel"] == 0) {
					makeGameMasterChannel(i_gameObj, i_serverID, GMRoleID, i_everyoneRoleID)
				} else {
					setGameMasterChannelPermissions(i_gameObj["GMChannel"], GMRoleID, i_everyoneRoleID)
				}
				table_Games.update(i_gameObj)
				db.saveDatabase();
			}
		} catch(err) {
			handleError(err, {}, new Error().stack)
		}
	})
}

var setGameMasterRolePermissions = function(i_serverID, i_GMRoleID) {
	bot.editRole({
		"serverID": i_serverID,
		"roleID": i_GMRoleID,
		"name" : "GameMaster",
		"mentionable" : true,
		"hoist" : true,
		"color" : "#df4a4a"
	}, function(err, rsp){
		if (err) {
			handleError(err, {}, new Error().stack)
		}
	})
}

var makeGameMasterChannel = function(i_gameObj, i_serverID, i_GMRoleID, i_everyoneRoleID) {
	var GMChannel = 0;
	bot.createChannel({
		"serverID": i_serverID,
		"name": 'gm-channel'
	}, function(err, rsp){
		try {
			if (err) {
				handleError(err, {}, new Error().stack)
			} else {
				GMChannel = rsp.id
				setGameMasterChannelPermissions(GMChannel, i_GMRoleID, i_everyoneRoleID)
				table_Games.update(i_gameObj)
				db.saveDatabase();
			}
		} catch(err) {
			handleError(err, {}, new Error().stack)
		}
	})
}

var setGameMasterChannelPermissions = function(i_GMChannel, i_RoleID, i_everyoneRoleID) {
	bot.editChannelPermissions({
		"channelID" : i_GMChannel,
		"roleID" : i_RoleID,
		"deny" : [],
		"allow" : [10]
	}, function(err, rsp){
		try {
			if (err) {
				handleError(err, {}, new Error().stack)
			} else {
				bot.editChannelPermissions({
					"channelID" : i_GMChannel,
					"roleID" : i_everyoneRoleID,
					"deny" : [10],
					"allow" : []
				})
			}
		} catch(err) {
			handleError(err, {}, new Error().stack)
		}
	})
}

var setGameMaster = function(i_serverID, i_userID) {
	var gameObj = getGame(i_serverID)
	gameObj["GameMaster"] = i_userID
	table_Games.update(gameObj)
	db.saveDatabase();
}

var isGameMaster = function(i_serverID, i_userID) {
	var gameObj = getGame(i_serverID)
	return gameObj["GameMaster"] == i_userID;
}

var simpleCheck = function(i_serverID, i_channelID, i_userID) {
	var statBonus  = 0;
	var focusBonus = 0;
	var stunts     = false;
	var focusStr   = ""
	var statStr    = ""

	var dramaDie = Math.floor(Math.random() * (6 - 1) + 1)
	var die1     = Math.floor(Math.random() * (6 - 1) + 1)
	var die2     = Math.floor(Math.random() * (6 - 1) + 1)

	if (dramaDie == die1 || dramaDie == die2 || die1 == die2) {
		stunts = true;
	}

	var gameObj = getGame(i_serverID)
	if (gameObj["CheckActive"]) {
		var characterStats = getCharacterStats(i_serverID, i_userID)
		if (gameObj["FocusCheck"]) {
			var characterFocusObj = table_characterFocus.findOne({"ServerID" : i_serverID, "UserID": i_userID, "FocusID": gameObj["FocusCheck"]})
			if (characterFocusObj["score"] && Object.keys(characterFocusObj["score"]).length)
			{
				var focusObj = getFocusByID(gameObj["FocusCheck"])
				focusBonus = 2;
				focusStr = focusObj["name"] + ": " + focusBonus + "\n"
			}
		}
		if (gameObj["AbilityCheck"]) {
			var characterStatObj = table_characterStats.findOne({"ServerID" : i_serverID, "UserID": i_userID, "AbilityID": gameObj["AbilityCheck"]})
			var abilityObj = getAbilityByID(gameObj["AbilityCheck"])
			statBonus = characterStatObj["score"];
			statStr = abilityObj["name"] + ": " + statBonus + "\n"
		}
	}

	var total = dramaDie + die1 + die2 + statBonus + focusBonus

	var outputStr = ""
	outputStr += statStr
	outputStr += focusStr
	outputStr += "Die 1: " + die1 + "\n"
	outputStr += "Die 2: " + die2 + "\n"
	outputStr += "Drama Die: " + dramaDie + "\n"
	outputStr += "Total: " + total
	if (stunts) {
		outputStr += " (" + dramaDie + " Stunt Points)"
	}

	bot.sendMessage({
		to: i_channelID,
		message: outputStr
	});

	if (stunts){
		setTimeout(function() {
			outputStunts(i_channelID, {"min": { '$lte' : dramaDie }}, "type,min")
		}, 1000);
	}
}

var setCheck = function(i_serverID, i_channelID, i_userID, i_checkName) {
	if (!isGameMaster(i_serverID, i_userID)){
		bot.sendMessage({
			to: i_channelID,
			message: "Command can only be used by the Game Master"
		});
		return
	}

	var focusCheckID   = 0;
	var abilityCheckID = 0;
	var FocusCheck     = table_abilityFocus.findOne({'$or':[{"nameLower":i_checkName},{"shortName":i_checkName}]})
	var abilityCheck   = table_Abilities.findOne(   {'$or':[{"nameLower":i_checkName},{"shortName":i_checkName}]})

	if (FocusCheck && Object.keys(FocusCheck).length) {
		focusCheckID   = FocusCheck['$loki'];
        abilityCheckID = FocusCheck['abilityID'];
	} else if (abilityCheck && Object.keys(abilityCheck).length) {
        abilityCheckID = abilityCheck['$loki'];
	} else {
		// Entered value didn't match ability or focus
		bot.sendMessage({
			to: i_channelID,
			message: "Could not find ability or focus matching '" + i_checkName + "'"
		});
		return
	}

	var gameObj = getGame(i_serverID)
	gameObj["AbilityCheck"] = abilityCheckID
	gameObj["FocusCheck"]   = focusCheckID
	gameObj["CheckActive"]  = true
	table_Games.update(gameObj)
	db.saveDatabase();
}

var endCheck = function(i_serverID, i_channelID, i_userID) {
	if (!isGameMaster(i_serverID, i_userID)){
		bot.sendMessage({
			to: i_channelID,
			message: "Command can only be used by the Game Master"
		});
		return
	}

	var gameObj = getGame(i_serverID)
	gameObj["AbilityCheck"] = 0
	gameObj["FocusCheck"]   = 0
	gameObj["CheckActive"]  = false
	table_Games.update(gameObj)
	db.saveDatabase();
}

var activeCheck = function(i_serverID, i_channelID) {
	var gameObj = getGame(i_serverID);
	bot.sendMessage({
		to: i_channelID,
		message: "Check Active: " + gameObj["CheckActive"]  + "\n" +
				 "FocusID: "      + gameObj["FocusCheck"]   + "\n" +
				 "AbilityID: "    + gameObj["AbilityCheck"] + "\n"
	});
}

var addCharacter = function(i_serverID, i_userID, i_characterName) {
	var gameObj = getGame(i_serverID)
	var gameID = gameObj['$loki']
	var sheetChannel = gameObj['SheetChannel']

	var baseCharacter = {
		"ServerID" : i_serverID,
		"GameID"   : gameID,
		"UserID"   : i_userID,
		"name"     : i_characterName
	}
	var characterCheck = table_character.findOne({"ServerID" : i_serverID, "UserID" : i_userID})
	if (characterCheck && Object.keys(characterCheck).length) {
		var characterAbilityCheck = table_characterStats.find({"ServerID" : i_serverID, "CharacterID" : characterCheck['$loki']})
		table_character.remove(characterCheck['$loki'])
		for (var i = 0; i < characterAbilityCheck.length; i++) {
			table_characterStats.remove(characterAbilityCheck[i]['$loki'])
		}
	}

	var newCharacter = table_character.insert(baseCharacter)
	var abilities = table_Abilities.find({})

	for (var i = 0; i < abilities.length; i++) {
		table_characterStats.insert({
			"ServerID"	  : i_serverID,
			"UserID"      : i_userID,
			"CharacterID" : newCharacter['$loki'],
			"AbilityID"   : abilities[i]['$loki'],
			"score"       : 0
		})
	}

	// bot.editNickname({
	// 	"serverID" : i_serverID,
	// 	"userID"   : i_userID,
	// 	"nick"     : i_characterName
	// }, handleError)

	bot.createChannel({
		"serverID"  : i_serverID,
		"name"      : i_characterName,
		"parentID"  : sheetChannel
	}, function(err, rsp){
		try {
			if (err) {
				handleError(err, {}, new Error().stack)
			} else {
				newCharacter["channelID"] = rsp.id
				table_character.update(newCharacter)
				db.saveDatabase();
				pinCharacterStats(i_serverID, i_userID)
			}
		} catch(err) {
			handleError(err, {}, new Error().stack)
		}
	})

	db.saveDatabase();
}

var myStats = function(i_serverID, i_channelID, i_userID) {
	var characterObj = getCharacter(i_serverID, i_userID)
	var stats = getCharacterStats(i_serverID, i_userID)

	var outputStr = ""
	outputStr += "**" + characterObj['name'] + "**'s stats\n"
	for (var i = 0; i < stats.length; i++) {
		outputStr += stats[i]['name'] + ": " + stats[i]['score'] + "\n"
	}

	bot.sendMessage({
		to: i_channelID,
		message: outputStr
	});
}

var setStat = function(i_serverID, i_userID, i_abilityName, i_abilityValue) {
	var characterObj = getCharacter(i_serverID, i_userID)
	var characterID = characterObj['$loki']

	var abilityObj = getAbilityByName(i_abilityName)
	var abilityID = abilityObj['$loki']

	var statCheck = table_characterStats.findOne({"ServerID" : i_serverID, "CharacterID" : characterID, "AbilityID" : abilityID})
	if (statCheck && Object.keys(statCheck).length) {
		statCheck['score'] = i_abilityValue
		table_characterStats.update(statCheck)
	}

	pinCharacterStats(i_serverID, i_userID)
	db.saveDatabase()
}