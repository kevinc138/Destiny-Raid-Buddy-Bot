const rp = require('request-promise');
//const ReplClient = require("@replit/database");
//const client = new ReplClient();

const url = 'https://whereisxur.com/';
const $ = require('cheerio');
const bungieUrl = 'https://www.bungie.net/platform/Destiny/Manifest/InventoryItem/1274330687/';
require('dotenv').config();
const enums = require('./apiEnums');
const BUNGIE_TOKEN = process.env.BUNGIE_TOKEN;
const DRB_USERNAME = 'Destiny Raid Buddy';
var Datastore = require('nedb')
  , db = new Datastore({ filename: './database/db_file', autoload: true });


/**
 * These commands are the publicly visible ones. 
 * The other case statements are able to be called, but 
 * won't be exposed by the !drb_help command.
 */
const CommandsEnum = {
  HELP: {
    COMMAND: "!drb_help",
    HELP: "This command will display all defined commands." 
  },
  RIVEN_EYES: {
    COMMAND: "!RivenEyes",
    HELP: "This command will paste an image of rivens eyes.",
    ASSET: './assets/RivenEyes.png'
  },
  LW_SYMBOLS: {
    COMMAND: "!LW_Symbols",
    HELP: "This command will paste an image of last wish symbols.",
    ASSET: './assets/LWSymbols.png'
  },
  DSC_SECURITY: {
    COMMAND: "!DSC_Security",
    HELP: "This command will paste an image of DSC Crypt Security encounter arena.",
    ASSET: './assets/DSCSecurity.png'
  },
  DSC_TANIKS: {
    COMMAND: "!DSC_Taniks",
    HELP: "Pastes an image of Taniks, Reborn encounter arena.",
    ASSET: './assets/TaniksReborn.png'
  },
  DSC_TANIKS_ABOM: {
    COMMAND: "!DSC_TaniksAbom",
    HELP: "Pastes an image of Taniks Abomination encounter arena.",
    ASSET: './assets/DSCTaniksAbom.png'
  },
  BEEP_BOOP: {
    COMMAND: "!beep_boop",
    HELP: "Beep boop",
    ASSET: "https://www.youtube.com/watch?v=-pRnQYS0S5c"
  },
  XUR: {
    COMMAND: "!xur",
    HELP: "Retrieves Xur's location from https://whereisxur.com/"
  }
}
Object.freeze(CommandsEnum);

module.exports = function(msg) {

  //If the bot said it, let's not have it respond to itself.
  if(msg.author.username === DRB_USERNAME) {
    return;
  }

  var args = msg.content.split(" ");
  var rootArg = args[0];
  console.log(msg);

  switch(rootArg) {

    case CommandsEnum.HELP.COMMAND:
      let reply = "";
      for(let command in CommandsEnum) {
        reply += CommandsEnum[command].COMMAND + " - " + CommandsEnum[command].HELP + "\n";
      }
      msg.channel.send(reply);
      break;
    case CommandsEnum.RIVEN_EYES.COMMAND:
      msg.channel.send({files: [CommandsEnum.RIVEN_EYES.ASSET]});
      break;
    case CommandsEnum.LW_SYMBOLS.COMMAND:
      msg.channel.send({files: [CommandsEnum.LW_SYMBOLS.ASSET]});
      break;
    case CommandsEnum.DSC_SECURITY.COMMAND:
      msg.channel.send({files: [CommandsEnum.DSC_SECURITY.ASSET]});
      break;
    case CommandsEnum.DSC_TANIKS_ABOM.COMMAND:
      msg.channel.send({files: [CommandsEnum.DSC_TANIKS_ABOM.ASSET]});
      break;
    case CommandsEnum.DSC_TANIKS.COMMAND:
      msg.channel.send({files: [CommandsEnum.DSC_TANIKS.ASSET]});
      break;
    case CommandsEnum.BEEP_BOOP.COMMAND:
      msg.channel.send(CommandsEnum.BEEP_BOOP.ASSET);
      break;
    case "!corncob":
    case "!CCR":
      msg.channel.send({files: ['./assets/CCR.png']});
      break;
    case "!hippity_hoppity":
      msg.channel.send("I'm coming for your property.");
      break;
    case "!knuckles":
      msg.channel.send('https://i.redd.it/5eoz415nfpm11.jpg');
      break
    case CommandsEnum.XUR.COMMAND:
      rp(url)
      .then(function(html){
        //success!
        msg.channel.send($('.title', html).text());
      })
      .catch(function(err){
        //handle error
      }); 
      break;
    case "!callApi":
      var options = {
        uri: bungieUrl,
        headers: {
          'X-API-Key': BUNGIE_TOKEN
        },
        json: true
      };

      rp(options)
      .then(function(json) {
        console.log(json);
        msg.channel.send(JSON.stringify(json).substr(0, 500));
      })
      .catch(function(err) {
        console.log(err);
        //msg.channel.send("An error occurred.");
      });
    break;
    case "!testDB":

    
      //This is using nedb here.
      /*db.insert({
        "userId": "AnIdGoesHere"
      });*/
    break;
    case "!setMyDestinyProfileById":
      db.update({'discordUser': msg.author.username}, {$set : {'membershipId': json.Response[0].membershipId}}, {upsert: true}, function(){
              console.log("Updated database.");
            });
      msg.reply("I've linked your account to the membershipId id you gave me.");
    break;
    case "!setMyDestinyProfile":

      if(args.length != 2) {
        msg.channel.send("Please provide only one parameter.");
      }
      var localUri = enums.BASE_URI + '/Destiny2/SearchDestinyPlayer/-1/'
      localUri += args[1];

      var options = {
        uri: localUri,
        headers: {
          'X-API-Key': BUNGIE_TOKEN
        },
        json: true
      };

      rp(options)
      .then(function(json){
        if(json.Response.length > 1) {
          msg.channel.send("UserId was not unique. Please provide a unique name.");
        } else if(json.Response.length == 0) {
          msg.channel.send("Couldn't find any user with that name.");
        } else {
          msg.channel.send("Found your user! Adding to my database.");
          var userEntry = {
              discordUser: msg.author.username,
              membershipId: json.Response[0].membershipId
            };

            db.update({'discordUser': msg.author.username}, {$set : {'membershipId': json.Response[0].membershipId}}, {upsert: true}, function(){
              console.log("Updated database.");
            });         
        }
      }).catch(function(err) {
        console.log(err);
      });

    break;
    case "!setMyCharacter":
      if(args.length != 2) {
        msg.channel.send("Please provide only one parameter.");
      }
      
      var type = args[1].toUpperCase();
      if(!Object.keys(enums.CLASS_TYPE).includes(type)) {
        msg.reply("Please choose between titan, warlock, or hunter.");
        return;
      }
      
      db.find({'discordUser': msg.author.username}, function(err, docs) {
        
        var membershipId = "";
        if(docs.length != 0) {
          membershipId = docs[0].membershipId;
        } else {
          msg.reply("You haven't set your destiny profile, yet.");
        }
        var typeAsInt = enums.CLASS_TYPE[type];
        
        var localUri = enums.BASE_URI + "/Destiny2/3/Profile/" + membershipId + "?components=Characters";
        var options = {
          uri: localUri,
          headers: {
            'X-API-Key': BUNGIE_TOKEN
          },
          json: true
        };

        rp(options)
        .then(function(json) {
          if(json.Response.characters.data.length == 0) {
            msg.reply("Bungie doesn't think you have characters! Or, at least, I don't think that Bungie thinks you have characters.");
          } else {
            var charactersData = json.Response.characters.data;
            var characterKeys = Object.keys(charactersData);
            var charId = -1;
            console.log("Characters length is " + characterKeys.length);
            
            for(var i = 0; i < characterKeys.length; i++) {
              console.log(characterKeys[i]);
              var charData = charactersData[characterKeys[i]];
              console.log("The character classType is: " + charData);
              if(charData.classType == typeAsInt) {
                charId = charData.characterId;
                break;
              }
            }
            if(charId == -1) {
              msg.reply("I didn't find a character of that class on your linked profile.");
              console.log(charactersData);
              return;
            }

            db.update({'discordUser': msg.author.username}, {$set : {'characterId': charId, 'classType': type}}, {upsert: true}, function(){
              console.log("Updated database.");
              msg.reply("Set your current character to " + type.toLowerCase());
            });
          }
        })
        .catch(function(err) {
          console.log(err);
          genericError(msg);
        });
      });
    
    break;
    case "!showCurrentMembershipId":

      db.find({'discordUser': msg.author.username}, function(err, docs){
        console.log(docs);
        msg.channel.send(docs[0].membershipId);
      });

    break;

  }

  function genericError(msg) {
    msg.reply("I'm sorry; I ran into an error! Beep Boop");
  }

  function setMyCharacter(msg, type) {

  }

}