const rp = require('request-promise');
const fs = require('fs');
const url = 'https://whereisxur.com/';
const $ = require('cheerio');
const bungieUrl = 'https://www.bungie.net/platform/Destiny/Manifest/InventoryItem/1274330687/';
require('dotenv').config();
const enums = require('./apiEnums');
const RPSUser = require('./models/RPSUser');
const RPSRecord = require('./models/RPSRecord');
const RPSGame = require('./models/RPSGame');
const subscriptions = require('./handlers/subscriptionHandler')
const BUNGIE_TOKEN = process.env.BUNGIE_TOKEN;
const DRB_USERNAME = 'Destiny Raid Buddy';
var Datastore = require('nedb');
var db = new Datastore({ filename: './database/db_file', autoload: true });
var rpsDB = new Datastore({ filename: './database/rps_user', autoload: true });
var gameStateMap = new Map();
const DRB_ADMIN = process.env.DRB_ADMIN;
var activeGame = false;
var activeOpponent = null;
var activeRpsRoll = null;
const activeGames = new Map(); //Key: Channel, Value: RPSGame {Player : Roll}

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


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
  LW_SYMBOLS_CCR: {
    COMMAND: "!LW_Symbols_CCR",
    HELP: "This command will paste an image of the true last wish symbols.",
    ASSET: './assets/LWSymbols_CCR.png'
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
  },
  ROCK_PAPER_SCISSORS: {
    COMMAND: "!rps",
    HELP: "Rock Paper Scissors"
  },
  RPS_LOOKUP: {
    COMMAND: "!RPS_Stats",
    HELP: "RPS W/L/T stats"
  },
  RAID: {
    COMMAND: "!Raid?",
    HELP: "Raid?",
    ASSET: './assets/raid-destiny.gif'
  },
  BETA_HELP: {
    COMMAND: "!drb_betaHelp",
    HELP: "This command will display all defined in-development beta commands. There is no guarantee of intended behavior."
  }
}
Object.freeze(CommandsEnum);

module.exports = function(msg) {

  //If the bot said it, let's not have it respond to itself.
  if (msg.author.username === DRB_USERNAME) {
    return;
  }

  var args = msg.content.split(" ");
  var rootArg = args[0];

  try {
    commandSwitch(msg, args);
  }
  catch (err) {
    console.log(err);
    msg.reply("Looks like I hit an uncaught exception! This is here so I can keep running, but good job finding this!");
  }

}

async function commandSwitch(msg, args) {

  var rootArg = args[0];
  rootArg = rootArg.toLowerCase();

  switch (rootArg) {

    case CommandsEnum.HELP.COMMAND.toLowerCase():
      var reply = "```";
      for (let command in CommandsEnum) {
        reply += CommandsEnum[command].COMMAND + " -> " + CommandsEnum[command].HELP + "\n";
      }
      reply += "```";
      msg.channel.send(reply);
      break;
    case "!ktest":
      msg.channel.send("@Coffee");
      var user = msg.author.id;
      msg.channel.send("<@" + user + ">");
      console.log(msg.author);
      console.log(msg);
      break;
    case CommandsEnum.BETA_HELP.COMMAND.toLowerCase():
      var reply = "```";
      for (let command in enums.BetaCommands) {
        reply += enums.BetaCommands[command].COMMAND + " -> " + enums.BetaCommands[command].HELP + "\n\n";
      }
      reply += "```";
      msg.channel.send(reply);
      break;
    case enums.BetaCommands.ADD_GAME_DISTRO.COMMAND.toLowerCase():
      subscriptions.addGameDistro(msg, args[1]);
      break;
    case enums.BetaCommands.ADD_GAME_SUBSCRIPTION.COMMAND.toLowerCase():
      subscriptions.addUserSubscription(msg, args[1]);
      break;
    case enums.BetaCommands.REMOVE_GAME_SUBSCRIPTION.COMMAND.toLowerCase():
      subscriptions.removeUserSubscription(msg, args[1]);
      break;
    case enums.BetaCommands.PING_GAME_DISTRO.COMMAND.toLowerCase():
      subscriptions.pingGameDistro(msg, args[1]);
      break;
    case CommandsEnum.RAID.COMMAND.toLowerCase():
      msg.channel.send({ files: [CommandsEnum.RAID.ASSET] });
      break;
    case "!riveneyeballsyafuck":
    case CommandsEnum.RIVEN_EYES.COMMAND.toLowerCase():
      msg.channel.send({ files: [CommandsEnum.RIVEN_EYES.ASSET] });
      break;
    case CommandsEnum.LW_SYMBOLS.COMMAND.toLowerCase():
      msg.channel.send({ files: [CommandsEnum.LW_SYMBOLS.ASSET] });
      break;
    case CommandsEnum.LW_SYMBOLS_CCR.COMMAND.toLowerCase():
      msg.channel.send({ files: [CommandsEnum.LW_SYMBOLS_CCR.ASSET] });
      break;
    case CommandsEnum.DSC_SECURITY.COMMAND.toLowerCase():
      msg.channel.send({ files: [CommandsEnum.DSC_SECURITY.ASSET] });
      break;
    case CommandsEnum.DSC_TANIKS_ABOM.COMMAND.toLowerCase():
      msg.channel.send({ files: [CommandsEnum.DSC_TANIKS_ABOM.ASSET] });
      break;
    case CommandsEnum.DSC_TANIKS.COMMAND.toLowerCase():
      msg.channel.send({ files: [CommandsEnum.DSC_TANIKS.ASSET] });
      break;
    case CommandsEnum.BEEP_BOOP.COMMAND.toLowerCase():
      msg.channel.send(CommandsEnum.BEEP_BOOP.ASSET);
      break;
    case CommandsEnum.DAMAGE_REPORT.COMMAND.toLowerCase():
      msg.channel.send("While I can't find your damage, I know in my heart you did your best. Next time try just dying if you're so curious. Or bother bungo here: " + CommandsEnum.DAMAGE_REPORT.ASSET);
      break;
    case CommandsEnum.ROCK_PAPER_SCISSORS.COMMAND.toLowerCase():
      doRps(msg);
      break;
    case "!GARDENSUX":
      msg.channel.send("but Divinity, tho...");
      break;
    case "!corncob":
    case "!ccr":
      msg.channel.send({ files: ['./assets/CCR.png'] });
      break;
    case "!hippity_hoppity":
      msg.channel.send("I'm coming for your property.");
      break;
    case "!knuckles":
      var rand = Math.floor(Math.random() * 20);
      if (rand == 19) {
        msg.channel.send("Show me da wae", { files: ["./assets/dawae.png"] });
      } else {
        msg.channel.send('https://i.redd.it/5eoz415nfpm11.jpg');
      }

      break;
    case "!kevintest":
      msg.channel.send("just testing");
      console.log(msg);
      break;
    case "!testmongo":
      msg.channel.send("mongoTest");
      //msg.reply("testingMongo");
      mongoTest().catch(console.dir);
      msg.reply("testedMongo");
      break;
    case CommandsEnum.RPS_LOOKUP.COMMAND.toLowerCase():
      rpsDataLookup(msg);
      break;
    case CommandsEnum.XUR.COMMAND.toLowerCase():
      rp(url)
        .then(function(html) {
          //success!
          msg.channel.send($('.title', html).text());
        })
        .catch(function(err) {
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
      if (args.length != 3) {
        msg.reply("please provide me with {membershipId} and {membershipType} if you wish to use this command.");
        return;
      }
      db.update({ 'discordUser': msg.author.username }, { $set: { 'membershipId': args[1], 'membershipType': args[2] } }, { upsert: true }, function() {
        console.log("Updated database.");
      });
      msg.reply("I've linked your account to the membershipId id you gave me.");
      break;
    case enums.BetaCommands.SET_PROFILE_BUNGIE_ID.COMMAND:
      if (args.length != 2) {
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
          if (memberships.length > 0) {
            var membershipId = memberships[0].membershipId;
            var membershipType = memberships[0].membershipType;

            db.update({ 'discordUser': msg.author.username }, { $set: { 'membershipId': membershipId, 'membershipType': membershipType } }, { upsert: true }, function() {
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
      if (args.length != 2) {
        msg.channel.send("Please provide only one parameter.");
      }

      setMyDestinyProfile(msg, args[1]);
      break;
    case enums.BetaCommands.SET_CHARACTER.COMMAND:
      if (args.length != 2) {
        msg.channel.send("Please provide only one parameter.");
      }

      var type = args[1].toUpperCase();
      if (!Object.keys(enums.CLASS_TYPE).includes(type)) {
        msg.reply("Please choose between titan, warlock, or hunter.");
        return;
      }

      setMyCharacter(msg, type);

      break;
    case enums.DevCommands.REFRESH_ACTIVITY_MANIFEST.COMMAND:
      if (msg.author.username == DRB_ADMIN) {
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
      fs.readFile('./manifests/DestinyActivityDefinitions.json', 'utf8', (error, data) => {
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

      db.find({ 'discordUser': msg.author.username }, function(err, docs) {
        console.log(docs);
        msg.channel.send(docs[0].membershipId);
      });

      break;

    case "!errorTest":
      console.log("This is an error test.");
      var breakingValue = undefinedVar.undefinedValue;
      break;
    case "!testable":
      return "yes";
      break;

  }
}

async function mongoTest() {
  /*client.connect(err => {
    const collection = client.db("test").collection("devices");
    // perform actions on the collection object

    let tempDocument = {
      "name": "SomeGameName",
      "subscribers": ["Kevin"]
    }

    const p = await collection.insertOne(tempDocument);

    const a = await collection.findOne();

    console.log("We found a document " + a);
    client.close();
  });*/
  try {

    await client.connect();

    console.log("Connected to the database.")
    const collection = client.db("drb").collection("subscriptions");

    let tempDocument = {
      "name": "SomeGameName",
      "subscribers": ["Kevin"]
    }

    const p = await collection.insertOne(tempDocument);

    const a = await collection.findOne();

    console.log("We found a document " + a);


  } catch (err) {
    console.log(err);
  }


  return true;
}

function getLastActivityStats(msg) {
  db.find({ 'discordUser': msg.author.username }, function(err, docs) {
    if (docs.length == 0) {
      msg.reply("you're not registered with me, yet. Please use !drb_betaHelp for information.");
      return;
    }
    var user = docs[0];
    if (user.membershipId == undefined || user.membershipType == undefined || user.characterId == undefined) {
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
      .then(function(json) {
        var lastActivity = json.Response.activities[0];
        if (lastActivity == undefined) {
          console.log("Doesn't appear there was an activity for this character.");
          msg.reply("Sorry, I didn't find anything for you.");
        }
        var activityHash = lastActivity.activityDetails.referenceId;

        fs.readFile('./manifests/DestinyActivityDefinitions.json', "utf8", (error, data) => {
          if (error) {
            console.error(error);
            return;
          }
          try {
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
          } catch (error) {
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
    .then(function(json) {
      if (json.Response.length > 1) {
        msg.channel.send("UserId was not unique. Please provide a unique name.");
      } else if (json.Response.length == 0) {
        msg.channel.send("Couldn't find any user with that name.");
      } else {
        msg.channel.send("Found your user! Adding to my database.");

        db.update({ 'discordUser': msg.author.username }, { $set: { 'membershipId': json.Response[0].membershipId, 'membershipType': json.Response[0].membershipType } }, { upsert: true }, function() {
          console.log("Updated database.");
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
}

function rpsRoll(msg) {
  var rand = Math.floor(Math.random() * 3);
  if (rand == enums.RPS.ROCK) {
    msg.reply("Rock", { files: ["./assets/TheRock.jpeg"] });
  } else if (rand == enums.RPS.PAPER) {
    msg.reply("Paper", { files: ["./assets/DunderMifflin.jpg"] });
  } else if (rand == enums.RPS.SCISSORS) {
    msg.reply("Scissors", { files: ["./assets/EdwardScissorHands.jpg"] });
  }
  return rand;
}


//Entry point for RPS matches
function doRps(msg) {
  if (activeGames.has(msg.channel.id)) {
    determineRpsWinner(msg, rpsRoll(msg));
  } else {
    activeGames.set(msg.channel.id, new RPSGame(msg.author.username, rpsRoll(msg)));
  }
}

/**
 * PlayerOne - the player that initiated the game.
 * PlayerTwo - the challenger that plays second.
 * 
 * Looks up the active game in the activeGames map.
 * Deletes the game (channelId) from the activeGames map.
 * 
 */
function determineRpsWinner(msg, secondRoll) {

  let activeRpsGame = activeGames.get(msg.channel.id);
  let activeRpsRoll = activeRpsGame.roll;
  let playerOne = activeRpsGame.username;

  let playerTwo = msg.author.username;

  //Tie
  if (activeRpsRoll == secondRoll) {
    msg.reply("It's a tie!");
    rpsIncrementTies(msg, playerOne, playerTwo);
  }

  //Rock vs Scissors
  else if (activeRpsRoll == enums.RPS.ROCK && secondRoll == enums.RPS.SCISSORS) {
    msg.channel.send(playerOne + " wins! Rock vs Scissors!");
    rpsIncrementRecords(msg, playerOne, playerTwo, true);
  }
  else if (activeRpsRoll == enums.RPS.SCISSORS && secondRoll == enums.RPS.ROCK) {
    msg.channel.send(playerTwo + " wins! Scissors vs Rock!");
    rpsIncrementRecords(msg, playerTwo, playerOne, false);
  }

  //Scissors vs Paper
  else if (activeRpsRoll == enums.RPS.SCISSORS && secondRoll == enums.RPS.PAPER) {
    msg.channel.send(playerOne + " wins! Scissors vs Paper!");
    rpsIncrementRecords(msg, playerOne, playerTwo, true);
  }
  else if (activeRpsRoll == enums.RPS.PAPER && secondRoll == enums.RPS.SCISSORS) {
    msg.channel.send(playerTwo + " wins! Paper vs Scissors!");
    rpsIncrementRecords(msg, playerTwo, playerOne, false);
  }

  //Paper vs Rock
  else if (activeRpsRoll == enums.RPS.PAPER && secondRoll == enums.RPS.ROCK) {
    msg.channel.send(playerOne + " wins! Paper vs Rock!");
    rpsIncrementRecords(msg, playerOne, playerTwo, true);
  }
  else if (activeRpsRoll == enums.RPS.ROCK && secondRoll == enums.RPS.PAPER) {
    msg.channel.send(playerTwo + " wins! Rock vs Paper!");
    rpsIncrementRecords(msg, playerTwo, playerOne, false);
  }

  activeGames.delete(msg.channel.id);
}


/**
 * Increments the records of the winner and loser of an rps match.
 * 
 * WinnerIsPlayerOne - This _only_ comes into play when someone is playing against themself. To make the data context meaningful, we'll always want to store from the perspective of winning or losing from the initiating side; ergo, PlayerOne. This is a retrofitted fix, so it's a little clunky.
 */
function rpsIncrementRecords(msg, winner, loser, winnerIsPlayerOne) {

  //TODO: A lot of the logic in incrementWin/Loss could probably be abstracted to another function if I learn a bit more about how objects work in Javascript; specifically with storing and retrieving from nedb. (Or perhaps just switch to mongo or another simple document store)

  //Special logic for playing yourself.
  //Note: We don't need this for ties, just writing once works.
  if (winner == loser) {

    //Did your initiating self win or lose?
    if (winnerIsPlayerOne) {
      rpsIncrementWin(msg, winner, loser);
    } else {
      rpsIncrementLoss(msg, winner, loser);
    }
    return;
  }

  //update the winner
  rpsIncrementWin(msg, winner, loser);

  //update the loser
  rpsIncrementLoss(msg, winner, loser);

}


/**
 * Increment loss for the loser.
 * 
 */
function rpsIncrementLoss(msg, winner, loser) {
  rpsDB.find({ 'user': loser }, function(err, docs) {
    if (docs.length > 0) {
      var newTotalLosses = docs[0].totalLosses + 1;
      let newUserRecords = docs[0].userRecords;

      var foundOpponent = false;
      for (i = 0; i < newUserRecords.length; i++) {
        if (newUserRecords[i].opponent == winner) {
          newUserRecords[i].losses = newUserRecords[i].losses + 1;
          foundOpponent = true;
          break;
        }
      }

      if (!foundOpponent) {
        console.log("didn't find the opponent: " + winner + " under user: " + loser);
        console.log(newUserRecords);
        newUserRecords.push(new RPSRecord(winner, 0, 1, 0));
      }

      rpsDB.update({ 'user': loser }, { $set: { totalLosses: newTotalLosses, userRecords: newUserRecords } }, { upsert: true }, function(err, docs) { });
    }

    //Gotta create the record if it doesn't exist.
    else {
      let newUserRecords = [];
      newUserRecords.push(new RPSRecord(winner, 0, 1, 0));
      rpsDB.update({ 'user': loser }, { $set: { totalWins: 0, totalLosses: 1, totalTies: 0, userRecords: newUserRecords } }, { upsert: true }, function(err, docs) { });
    }
  })
}

/**
 * Increment win for the winner.
 * 
 */
function rpsIncrementWin(msg, winner, loser) {
  rpsDB.find({ 'user': winner }, function(err, docs) {
    if (docs.length == 1) {
      let newTotalWins = docs[0].totalWins + 1;
      let newUserRecords = docs[0].userRecords;

      var foundOpponent = false;

      //Change vs record.
      for (let i = 0; i < newUserRecords.length; i++) {
        if (newUserRecords[i].opponent == loser) {
          newUserRecords[i].wins = newUserRecords[i].wins + 1;
          foundOpponent = true;
          break;
        }
      }

      if (!foundOpponent) {
        console.log("didn't find the opponent: " + loser + " under user: " + winner);
        console.log(newUserRecords);
        newUserRecords.push(new RPSRecord(loser, 1, 0, 0));
      }

      rpsDB.update({ 'user': winner }, { $set: { totalWins: newTotalWins, userRecords: newUserRecords } }, { upsert: true }, function(err, docs) { });

    }
    //Have to create the user if they don't exist.
    else if (docs.length == 0) {
      let newUserRecords = [];
      newUserRecords.push(new RPSRecord(loser, 1, 0, 0));
      rpsDB.update({ 'user': winner }, { $set: { totalWins: 1, totalLosses: 0, totalTies: 0, userRecords: newUserRecords } }, { upsert: true }, function(err, docs) { });
    }

    //Error state otherwise
    else {
      msg.reply("Tell the bot owner that something broke while updating records.");
    }
  });
}

/**
 * Increment ties
 */
function rpsIncrementTies(msg, playerOne, playerTwo) {

  //Update playerOne
  rpsIncrementTie(msg, playerOne, playerTwo);

  //If you want to play yourself, fine, but I'm not updating twice.
  if (playerOne == playerTwo) {
    return;
  }

  //Update playerTwo
  rpsIncrementTie(msg, playerTwo, playerOne);
}

function rpsIncrementTie(msg, player, opponent) {
  rpsDB.find({ 'user': player }, function(err, docs) {
    if (docs.length > 0) {

      var newTotalTies = docs[0].totalTies + 1;
      let newUserRecords = docs[0].userRecords;

      var foundOpponent = false;
      for (i = 0; i < newUserRecords.length; i++) {
        if (newUserRecords[i].opponent == opponent) {
          newUserRecords[i].ties = newUserRecords[i].ties + 1;
          foundOpponent = true;
          break;
        }
      }

      if (!foundOpponent) {
        newUserRecords.push(new RPSRecord(opponent, 0, 0, 1))
      }

      rpsDB.update({ 'user': player }, { $set: { totalTies: newTotalTies, userRecords: newUserRecords } }, { upsert: true }, function(err, docs) { });
    }
    //Gotta create the record if it doesn't exist.
    else {
      let newUserRecords = [];
      newUserRecords.push(new RPSRecord(opponent, 0, 0, 1))
      rpsDB.update({ 'user': player }, { $set: { totalWins: 0, totalLosses: 0, totalTies: 1, userRecords: newUserRecords } }, { upsert: true }, function(err, docs) {

      });

    }

  });
}

function rpsDataLookup(msg) {
  rpsDB.find({ 'user': msg.author.username }, function(err, docs) {
    if (docs.length == 0) {
      msg.reply("Sorry, I have no records for you. If you believe this is an error, you can only blame yourself.");
      return;
    }

    console.log(docs[0]);

    var reply = "Here are your stats: \n```";
    reply += "Total Wins: " + docs[0].totalWins + "\n";
    reply += "Total Losses: " + docs[0].totalLosses + "\n";
    reply += "Total Ties: " + docs[0].totalTies + "\n";
    reply += "Total Games: " + (docs[0].totalWins + docs[0].totalLosses + docs[0].totalTies) + "\n";
    reply += "\nvs. Opponent\tWins\tLosses\tTies\n";

    var sb = "";
    for (let i = 0; i < docs[0].userRecords.length; i++) {
      let ur = docs[0].userRecords[i];
      sb += ur.opponent + "\t" + ur.wins + "\t" + ur.losses + "\t" + ur.ties + "\n";
    }

    sb += "```";
    reply += sb;


    msg.reply(reply);
    //msg.reply(JSON.stringify(docs[0]));

  })

}


function genericError(msg) {
  msg.reply("I'm sorry; I ran into an error! Beep Boop");
}

function setMyCharacter(msg, type) {
  db.find({ 'discordUser': msg.author.username }, function(err, docs) {

    var membershipId;
    var membershipType;
    if (docs.length != 0) {
      membershipId = docs[0].membershipId;
      membershipType = docs[0].membershipType;
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
        if (json.Response.characters.data.length == 0) {
          msg.reply("Bungie doesn't think you have characters! Or, at least, I don't think that Bungie thinks you have characters.");
        } else {
          var charactersData = json.Response.characters.data;
          var characterKeys = Object.keys(charactersData);
          var charId = -1;
          console.log("Characters length is " + characterKeys.length);

          for (var i = 0; i < characterKeys.length; i++) {
            console.log(characterKeys[i]);
            var charData = charactersData[characterKeys[i]];
            console.log("The character classType is: " + charData);
            if (charData.classType == typeAsInt) {
              charId = charData.characterId;
              break;
            }
          }
          if (charId == -1) {
            msg.reply("I didn't find a character of that class on your linked profile.");
            console.log(charactersData);
            return;
          }

          db.update({ 'discordUser': msg.author.username }, { $set: { 'characterId': charId, 'classType': type } }, { upsert: true }, function() {
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

