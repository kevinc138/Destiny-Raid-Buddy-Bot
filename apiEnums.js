const BASE_URI = "https://www.bungie.net/Platform";
const CONTENT_BASE_URI = "https://www.bungie.net";
const MANIFEST_PATH = BASE_URI + "/Destiny2/Manifest";

exports.BASE_URI = BASE_URI;
exports.CONTENT_BASE_URI = CONTENT_BASE_URI;
exports.MANIFEST_PATH = MANIFEST_PATH;

exports.CLASS_TYPE = {
  TITAN: 0,
  HUNTER: 1,
  WARLOCK: 2
}

exports.RPS = {
  ROCK: 0,
  PAPER: 1,
  SCISSORS: 2
}

exports.BetaCommands = {
  SET_PROFILE_ID: {
    COMMAND: "!setMyDestinyProfileById",
    HELP: "Set your destiny profile manually by known Id and membershipType. => '!setMyDestinyProfileById {membershipId} {membershipType}'"
  },
  SET_PROFILE: {
    COMMAND: "!setMyDestinyProfile",
    HELP: "Set your destiny profile with DRB by Bungie profile name. Does a search with Bungie for matching names and fails if it is not unique. => '!setMyDestinyProfile {profileName}''"
  },
  SET_PROFILE_BUNGIE_ID: {
    COMMAND: "!setMyDestinyProfileByBungieId",
    HELP: "Set your destiny profile by looking up your destiny memberships from your bungie account. This may be the easiest option if you don't have a unique name. You can find your unique bungie id by logging into your bungie account. => '!setMyDestinyProfileByBungieId {bungieId}'"
  },
  SET_CHARACTER: {
    COMMAND: "!setMyCharacter",
    HELP: "Tell DRB which of your characters to issue requests for. => '!setMyCharacter Warlock'"
  },
  LAST_ACTIVITY: {
    COMMAND: "!lastActStats",
    HELP: "Gives basic information on your last activity."
  },
  RPS_BETA: {
    COMMAND: "!RPS2",
    HELP: "RPS Beta"
  },
  ADD_GAME_DISTRO: {
    COMMAND: "!addGameDistro",
    HELP: "Adds a game distro if it does not exist. Add by '!addGameDistro {gameName}'"
  },
  PING_GAME_DISTRO: {
    COMMAND: "!p",
    HELP: "Pings all subscribers to a game's distro."
  },
  ADD_GAME_SUBSCRIPTION: {
    COMMAND: "!subscribe",
    HELP: "Adds yourself to a game's distro list. Add by '!subscribe {gameName}'"
  },
  REMOVE_GAME_SUBSCRIPTION: {
    COMMAND: "!unsubscribe",
    HELP: "Removes yourself from a game's distro list. Remove by '!unsubscribe {gameName}'"
  },
  LIST_GAME_DISTROS: {
    COMMAND: "!listGameDistros",
    HELP: "Lists all game distros for your server. Not yet implemented"
  }
}

exports.DevCommands = {
  REFRESH_ACTIVITY_MANIFEST: {
    COMMAND: "!refreshActivityManifest",
    HELP: "Refreshes the local copy of the activity manifest json from Bungie.net"
  },
  REMOVE_GAME_DISTRO: {
    COMMAND: "!removeGameDistro",
    HELP: "Removes a game's distro list. Remove by '!removeGameDistro {gameName}'"
  }
}