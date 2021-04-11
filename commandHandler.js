const rp = require('request-promise');
const fs = require('fs');
const url = 'https://whereisxur.com/';
const $ = require('cheerio');
const bungieUrl = 'https://www.bungie.net/platform/Destiny/Manifest/InventoryItem/1274330687/';
require('dotenv').config();
const enums = require('./apiEnums');
const BUNGIE_TOKEN = process.env.BUNGIE_TOKEN;
const DRB_USERNAME = 'Destiny Raid Buddy';
var Datastore = require('nedb')
  , db = new Datastore({ filename: './database/db_file', autoload: true });
const DRB_ADMIN = process.env.DRB_ADMIN;


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
    HELP: "Retrieves Xur's location from whereisxur.com"
  },
  DAMAGE_REPORT: {
    COMMAND: "!damageReport",
    HELP: "Gives a damage report, if I ever had one.",
    ASSET: "https://github.com/Bungie-net/api/issues/354"
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

  try {
    commandSwitch(msg, args);
    }
    catch(err){
      console.log(err);
      msg.reply("Looks like I hit an uncaught exception! This is here so I can keep running, but good job finding this!");
    }

}

  async function commandSwitch(msg, args) {

    var rootArg = args[0];
    switch(rootArg) {

      case CommandsEnum.HELP.COMMAND:
        var reply = "```";
        for(let command in CommandsEnum) {
          reply += CommandsEnum[command].COMMAND + " -> " + CommandsEnum[command].HELP + "\n";
        }
        reply += "```";
        msg.channel.send(reply);
        break;
      case enums.BetaCommands.HELP.COMMAND:
        var reply = "```";
        for(let command in enums.BetaCommands) {
          reply += enums.BetaCommands[command].COMMAND + " -> " + enums.BetaCommands[command].HELP + "\n\n";
        }
        reply += "```";
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
      case CommandsEnum.DAMAGE_REPORT.COMMAND:
        msg.channel.send("While I can't find your damage, I know in my heart you did your best. Next time try just dying if you're so curious. Or bother bungo here: " + CommandsEnum.DAMAGE_REPORT.ASSET);
      break;
      case "!GARDENSUX":
        msg.channel.send("but Divinity, tho...");
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

        });
      break;
      case enums.BetaCommands.SET_PROFILE_ID.COMMAND:
        if(args.length != 3) {
          msg.reply("please provide me with {membershipId} and {membershipType} if you wish to use this command.");
          return;
        }
        db.update({'discordUser': msg.author.username}, {$set : {'membershipId': args[1], 'membershipType': args[2]}}, {upsert: true}, function(){
                console.log("Updated database.");
              });
        msg.reply("I've linked your account to the membershipId id you gave me.");
      break;
      case enums.BetaCommands.SET_PROFILE_BUNGIE_ID.COMMAND:
        if(args.length != 2) {
          msg.reply("please provide me with only {bungieId}");
          return;
        }

        var localUri = enums.BASE_URI + "/User/GetBungieAccount/" + args[1] + "/254";
        var options = {
          uri: localUri,
          headers: {
            "X-API-Key": BUNGIE_TOKEN
          },
          json: true
        };

        rp(options)
        .then(function(json) {
          var memberships = json.Response.destinyMemberships;
          console.log("reached out to bungie for info.");
          console.log(json.Response);
          if(memberships.length > 0) {
            var membershipId = memberships[0].membershipId;
            var membershipType = memberships[0].membershipType;

            db.update({'discordUser': msg.author.username}, {$set : {'membershipId': membershipId, 'membershipType': membershipType}}, {upsert: true}, function(){
                console.log("Updated database.");
                msg.reply("I updated to the first destiny profile I could find linked to your account. If you need to be more specific, override this with " + enums.BetaCommands.SET_PROFILE_ID.COMMAND);
              });   

          } else {
            msg.reply("I couldn't find your destiny memberships from that id.");
          }
        }).catch(function(err) {
          console.log(err);
          genericError(msg);
        })


      break;
      case enums.BetaCommands.SET_PROFILE.COMMAND:
        if(args.length != 2) {
          msg.channel.send("Please provide only one parameter.");
        }

        setMyDestinyProfile(msg, args[1]);
      break;
      case enums.BetaCommands.SET_CHARACTER.COMMAND:
        if(args.length != 2) {
          msg.channel.send("Please provide only one parameter.");
        }
        
        var type = args[1].toUpperCase();
        if(!Object.keys(enums.CLASS_TYPE).includes(type)) {
          msg.reply("Please choose between titan, warlock, or hunter.");
          return;
        }
        
        setMyCharacter(msg, type);
      
      break;
      case enums.DevCommands.REFRESH_ACTIVITY_MANIFEST.COMMAND:
        if(msg.author.username == DRB_ADMIN) {
          refreshActivityManifest(msg);
        } else {
          console.log(msg.author.username + "tried to refresh the manifest.");
          msg.reply("You are not Clovis Bray, do not try his commands.");
        }
        
      break;
      case enums.BetaCommands.LAST_ACTIVITY.COMMAND:
        getLastActivityStats(msg);
      break; 
      case "!fileReadTest":
        fs.readFile('./manifests/DestinyActivityDefinitions.json','utf8', (error, data) => {
              if (error) {
                console.error(error);
                return;
              }
              const jsonData = JSON.parse(data);
              console.log(jsonData[910380154]);
              var activityName = jsonData[910380154].displayProperties.name;
              console.log("The activity name I found was " + activityName);
            })
      break;

      //This case is used for debugging.
      case "!showCurrentMembershipId":

        db.find({'discordUser': msg.author.username}, function(err, docs){
          console.log(docs);
          msg.channel.send(docs[0].membershipId);
        });

      break;

      case "!errorTest":
        console.log("This is an error test.");
        var breakingValue = undefinedVar.undefinedValue;
      break;
    }
  }

  function getLastActivityStats(msg) {
    db.find({'discordUser': msg.author.username}, function(err, docs){
      if(docs.length == 0) {
        msg.reply("you're not registered with me, yet. Please use !drb_betaHelp for information.");
        return;
      }
      var user = docs[0];
        if(user.membershipId == undefined || user.membershipType == undefined || user.characterId == undefined) {
          var reply = "Looks like I'm missing a value of yours that I need to proceed. Here are the values I have for you that I need for this action. These are helpful for Kevin to debug, if needed, or for you to know what other commands to run: \n";
          reply += "membershipId: " + user.membershipId + "\n";
          reply += "membershipType: " + user.membershipType + "\n";
          reply += "characterId: " + user.characterId;
          msg.reply(reply);
          return;
        }
        var localUri = enums.BASE_URI + "/Destiny2/" + user.membershipType + "/Account/" + user.membershipId + "/Character/" + user.characterId + "/Stats/Activities";

        var options = {
          uri: localUri,
          headers: {
            'X-API-Key': BUNGIE_TOKEN
          },
          json: true
        }
        rp(options)
        .then(function(json){
          var lastActivity = json.Response.activities[0];
          if(lastActivity == undefined) {
            console.log("Doesn't appear there was an activity for this character.");
            msg.reply("Sorry, I didn't find anything for you.");
          }
          var activityHash = lastActivity.activityDetails.referenceId;

          fs.readFile('./manifests/DestinyActivityDefinitions.json', "utf8", (error, data) => {
            if (error) {
              console.error(error);
              return;
            }
            try{
              var jsonData = JSON.parse(data);
              var activityName = jsonData[activityHash].displayProperties.name;
              console.log("The activity name I found was " + activityName);
              var reply = "Here are your most recent stats: \n```";
              reply += "Activity Map Name: " + activityName + "\n";
              reply += "Kills: " + lastActivity.values.kills.basic.displayValue + "\n";
              reply += "Assists: " + lastActivity.values.assists.basic.displayValue + "\n";
              reply += "Deaths: " + lastActivity.values.deaths.basic.displayValue + "\n";
              reply += "Efficiency: " + lastActivity.values.efficiency.basic.displayValue + "\n";
              reply += "K/D: " + lastActivity.values.killsDeathsRatio.basic.displayValue + "\n";
              reply += "```";
              msg.reply(reply);
            } catch(error) {
              console.log(error);
              genericError(msg);
            }
            
          });


        }).catch(function(err) {
          console.log(err);
          genericError(msg);
        });

      });
  }

  //Refreshes our local activity manifest.
  function refreshActivityManifest(msg) {
      var localUri = enums.MANIFEST_PATH;
      var options = {
        uri: localUri,
        headers: {
          'X-API-Key': BUNGIE_TOKEN
        },
        json: true
      };

      console.log("Refreshing the manifest");
      rp(options)
      .then(function(json) {
        fs.writeFile('./manifests/manifest.json', JSON.stringify(json), error => {
          if (error) {
            console.error(error);
            genericError(msg);
            return;
          }  
        });
        
        var activityDestinationPath = json.Response.jsonWorldComponentContentPaths.en.DestinyActivityDefinition;
        console.log("Activity Path: " + activityDestinationPath);

        var contentPath = enums.CONTENT_BASE_URI + activityDestinationPath;
        options.uri = contentPath;
        rp(options)
        .then(function(json) {
          fs.writeFile('./manifests/DestinyActivityDefinitions.json', JSON.stringify(json), error => {
            if (error) {
            console.error(error);
            genericError(msg);
            return;
          }  
          });
        })
        .catch(function(err) {
          console.log(err);
          genericError(msg);
        });

        var activityModeDefinitionPath = json.Response.jsonWorldComponentContentPaths.en.DestinyActivityModeDefinition;
        contentPath = enums.CONTENT_BASE_URI + activityModeDefinitionPath;
        options.uri = contentPath;
        rp(options)
        .then(function(json) {
          fs.writeFile('./manifests/DestinyActivityModeDefinitions.json', JSON.stringify(json), error => {
            if(error) {
              console.error(error);
              genericError(msg);
              return;
            }
          });
        })
        .catch(function(err) {
          console.log(err);
          genericError(msg);
        });

        msg.reply("Welcome back Clovis. I've refreshed the manifest for you.");
      }).catch(function(err) {
        console.log(err);
        genericError(msg);
      });
  }

  function setMyDestinyProfile(msg, profile) {
    var localUri = enums.BASE_URI + '/Destiny2/SearchDestinyPlayer/-1/'
      localUri += profile;

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

            db.update({'discordUser': msg.author.username}, {$set : {'membershipId': json.Response[0].membershipId, 'membershipType': json.Response[0].membershipType}}, {upsert: true}, function(){
              console.log("Updated database.");
            });         
        }
      }).catch(function(err) {
        console.log(err);
      });
  }

  function genericError(msg) {
    msg.reply("I'm sorry; I ran into an error! Beep Boop");
  }

  function setMyCharacter(msg, type) {
    db.find({'discordUser': msg.author.username}, function(err, docs) {
        
        var membershipId;
        var membershipType;
        if(docs.length != 0) {
          membershipId = docs[0].membershipId;
          membershipType = docs[0].membershipType;;
        } else {
          msg.reply("You haven't set your destiny profile, yet.");
          return;
        }
        var typeAsInt = enums.CLASS_TYPE[type];
        
        var localUri = enums.BASE_URI + "/Destiny2/" + membershipType + "/Profile/" + membershipId + "?components=Characters";
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
              msg.reply("I have set your current character to your " + type.toLowerCase());
            });
          }
        })
        .catch(function(err) {
          console.log(err);
          genericError(msg);
        });
      });
  }

