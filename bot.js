var Discord = require("discord.io");
var logger = require("winston");

require("dotenv").config();

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = "debug";

var bot = new Discord.Client({
  token: process.env.BOT_TOKEN
});

bot.on("ready", function() {
  logger.info(`${bot.username} is Connected!`);
});

bot.on("message", function(user, userid, channelID, message, event) {
  if (message.substring(0, 1) != "!") {
    return;
  }

  var args = message.substring(1).split(" ");
  var cmd = args[0];

  switch (cmd) {
    case "ping":
      bot.sendMessage({
        to: channelID,
        message: "Pong!"
      });
      break;
    case "tenets":
      bot.sendMessage({
        to: channelID,
        message: `1. Stay your blade from the flesh of an innocent.\n2. Hide in plain sight.\n3. Never compromise the Brotherhood.`
      });
      break;
    case "ironies":
      bot.sendMessage({
        to: channelID,
        message: `1. The Assassins seek to promote peace, but commit morder.\n2. The Assassins seek to open the minds of men, but require obedience to rules.\n3. The Assassins seek to reveal the danger of blind faith, yet practice it themselves.`
      });
      break;
    case "maxim":
      bot.sendMessage({
        to: channelID,
        message: `Nothing is true. Everything is permitted. :aclogo: :smile: \nTo say that nothing is true, is to realize that the foundations of society are fragile, and that we must be the shepherds of our own civilization.\nTo say that everything is permitted, is to understand that we are the architects of our actions, and that we must live with their consequences, whether glorious or tragic.`
      });
      break;
  }
});

bot.connect();

// fix for zeit now
require("http")
  .createServer()
  .listen(3000);
