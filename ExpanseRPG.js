
const loki          = require('lokijs');
const StuntList     = require('./StuntList.js');
const AbilityList   = require('./AbilityList.js');

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
	if (!table_Abilities)       { table_Abilities       = db.addCollection('gameAbilities') }
	if (!table_character)       { table_character       = db.addCollection('characters') }
	if (!table_characterStats)  { table_characterStats  = db.addCollection('characterStats') }
	if (!table_characterFocus)  { table_characterFocus  = db.addCollection('characterFocus') }
	if (!table_stunts)          { table_stunts          = db.addCollection('stunts') }
});


module.exports = class ExpanseRPG {

	constructor(i_id) {
	    this.id = i_id;
		var gameCheck = table_Games.findOne({"ServerID": i_id})
		console.log(gameCheck)
		if (gameCheck && Object.keys(gameCheck).length) {
			gameCheck["GameMaster"]   = ""
			gameCheck["AbilityCheck"] = 0
			gameCheck["FocusCheck"]   = 0
			gameCheck["CheckActive"]  = false
			// table_Games.update(gameCheck)
			console.log('game found')
		} else {
			// table_Games.insert(gameInit)
			console.log('game not found')
		}
	}


}