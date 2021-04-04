
const CommandsEnum = {
  HELP: {
    COMMAND: "!help",
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
    COMMAND: "!DSCTaniks",
    HELP: "Pastes an image of Taniks, Reborn encounter arena.",
    ASSET: './assets/TaniksReborn.png'
  },
  DSC_TANIKS_ABOM: {
    COMMAND: "!DSCTaniksAbom",
    HELP: "Pastes an image of Taniks Abomination encounter arena.",
    ASSET: './assets/DSCTaniksAbom.png'
  }
}

module.exports = function(msg) {

switch(msg.content) {

  case CommandsEnum.HELP.COMMAND:
    let reply = "";
    for(let command in CommandsEnum) {
      reply += CommandsEnum[command].COMMAND + " - " + CommandsEnum[command].HELP + "\n";
      //msg.channel.send(CommandsEnum[command].COMMAND + " - " + CommandsEnum[command].HELP);
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

}


}