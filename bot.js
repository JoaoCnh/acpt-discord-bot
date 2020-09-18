const Discord = require("discord.js");
const logger = require("winston");
const ytdl = require("ytdl-core");
require("dotenv").config();

const getRandomGif = require("./src/giphy").getRandomGif;
const soundtracks = require("./src/soundtracks.json");

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.level = "debug";

let currentVoiceChannel = null;

const handleCommand = async ({ channel, content }) => {
  const args = content.substring(1).split(" ");
  const cmd = args[0];

  switch (cmd) {
    case "tenets":
      channel.send(
        `1. Stay your blade from the flesh of an innocent.\n2. Hide in plain sight.\n3. Never compromise the Brotherhood.`
      );
      break;
    case "ironies":
      channel.send(
        `1. The Assassins seek to promote peace, but commit morder.\n2. The Assassins seek to open the minds of men, but require obedience to rules.\n3. The Assassins seek to reveal the danger of blind faith, yet practice it themselves.`
      );
      break;
    case "maxim":
      channel.send(
        `Nothing is true. Everything is permitted. :aclogo:\nTo say that nothing is true, is to realize that the foundations of society are fragile, and that we must be the shepherds of our own civilization.\nTo say that everything is permitted, is to understand that we are the architects of our actions, and that we must live with their consequences, whether glorious or tragic.`
      );
      break;
    case "gif":
      const gifUrl = await getRandomGif();

      if (!gifUrl) {
        return;
      }

      channel.send(gifUrl);
      break;
    case "help":
      channel.send(
        `:aclogo: **Nikolai is here to help!** :aclogo: \n\n :warn2: __**Available Commands:**__ :warn2: \n\n :aclogo: **!tenets** - I tell you the 3 tenets of the creed.\n\n:aclogo: **!ironies** - I tell you the 3 ironies of the Assassin's Creed.\n\n:aclogo: **!maxim** - I tell you the Assassin's Creed Maxim.\n\n:aclogo: **!gif** - I'll give you an Assassin's Creed GIF.\n\n:aclogo: **!soundtracks** - I'll give you available soundtracks for you to listen to.\n\n------------------------------\n\n:warn2: __**Available executions:**__ :warn2:\n\n:aclogo: **/play [soundtrack] @ [voice channel]** - Starts the chosen soundtrack in the specified voice channel.\n\n:aclogo: **/stfu** - Any music playing in a voice channel is stopped.\n\n:warn1: __**Any problem please contact a mod or staff! Thank you**__`
      );
      break;
    case "soundtracks":
      channel.send(
        `:aclogo: **Choose your soundtrack!** :aclogo:\n\nac - Assassin's Creed Soundtrack\n\nac2 - Assassin's Creed 2 Soundtrack\n\nbrotherhood - Assassin's Creed: Brotherhood Soundtrack\n\nrevelations - Assassin's Creed: Revelations Soundtrack\n\nac3 - Assassin's Creed 3 Soundtrack\n\nblackflag - Assassin's Creed IV: Black Flag Soundtrack\n\nunity - Assassin's Creed: Unity Soundtrack\n\nrogue - Assassin's Creed: Rogue Soundtrack\n\nsyndicate - Assassin's Creed: Syndicate Soundtrack\n\norigins - Assassin's Creed: Origins Soundtrack`
      );
      break;
    default:
      channel.send(
        "Can't recognize that command... Type **!help** to see every command available!"
      );
      break;
  }
};

const handleMusicRequest = async (match, { channel }) => {
  // options para o play
  const streamOptions = { seek: 0, volume: 2 };
  // sacar info da match
  const voiceChannelName = match[2];
  const request = match[1].trim().toLowerCase();

  // vamos tentar encontrar o voice channel
  const voiceChannel = bot.channels.find(
    (ch) => ch.type === "voice" && ch.name === voiceChannelName
  );

  if (!voiceChannel) {
    return channel.send(":warn1: That warning does not exist!");
  }

  try {
    // conectamos ao canal de voz
    const conn = await voiceChannel.join();
    // colocamos a música a tocar
    const ytUrl = soundtracks[request];

    if (!ytUrl) {
      return channel.send(
        ":warn1: Don't know that soundtrack. Type !soundtracks to see which soundtracks are available!"
      );
    }

    const stream = ytdl(ytUrl, { filter: "audioonly" });
    conn.playStream(stream, streamOptions);
    // guardamos em memória lo bastardo! e notificamos.
    currentVoiceChannel = voiceChannel;
    channel.send("Nice choice!");
  } catch (error) {
    console.log(error);
    channel.send(":warn1: Had an issue loading the music!");
  }
};

const handleStfu = () => {
  if (!currentVoiceChannel) {
    return;
  }

  currentVoiceChannel.leave();

  currentVoiceChannel = null;
};

const handleTeamSet = (match, { author, member, channel }) => {
  // sacar info da match
  const team = match[1];

  const role = channel.guild.roles.find(
    (role) => role.name.toLowerCase() === team.toLowerCase()
  );

  if (!role) {
    return channel.send(":warn1: Essa não existe!");
  }

  member.addRole(role.id);

  channel.send(`:warn2: ${author.username} - ${role.name}!`);
};

const bot = new Discord.Client();

bot.on("ready", () => {
  logger.info(`BOT is Connected!`);
  bot.user.setActivity("Try !help", { type: "PLAYING" });
});

bot.on("message", (message) => {
  const { content } = message;

  const isCommand = content.substring(0, 1) === "!";
  const isPlayMusic = content.match(/\/play (.+) @ (.+)$/);
  const isStfu = content.match(/\/stfu$/);
  const isTeamSet = content.match(/\/iam (.+)/);

  if (isCommand) {
    return handleCommand(message);
  }

  if (isPlayMusic) {
    return handleMusicRequest(isPlayMusic, message);
  }

  if (isStfu) {
    return handleStfu();
  }

  if (isTeamSet) {
    return handleTeamSet(isTeamSet, message);
  }
});

bot.login(process.env.BOT_TOKEN);

// fix for zeit now
require("http").createServer().listen(3000);
