require('dotenv').config();
const Discord = require('discord.js');

const bot = new Discord.Client();
//Create a file named '.env' and add your token.
const TOKEN = process.env.TOKEN;
const commandHandler = require('./commandHandler')

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  //TODO: Tell the command handler here to read the local manifest files, if they exist.
});

bot.on("error", () => { 
  
  console.log("I'm in the error state. Hopefully rebooting.");
  bot.login(TOKEN) });

bot.on('message', commandHandler);