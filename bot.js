const Discord = require("discord.js");
const logger = require("winston");
const ytdl = require("ytdl-core");
require("dotenv").config();

const getRandomGif = require("./src/giphy").getRandomGif;
const soundtracks = require("./src/soundtracks.json");

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
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
        `:aclogo: **O Nikolai está aqui para ajudar!** :aclogo: \n\n :warn2: __**Comandos disponíveis:**__ :warn2: \n\n :aclogo: **!tenets** - Relembro-te dos 3 princípios dos Assassinos.\n\n:aclogo: **!ironies** - Relembro-te das 3 ironias dos princípios dos Assassinos.\n\n:aclogo: **!maxim** - Relembro-te da máxima dos Assassinos.\n\n:aclogo: **!gif** - Dou-te um GIF relacionado com Assassin's Creed.\n\n:aclogo: **!soundtracks** - Apresento-te as soundtracks disponíveis para ouvires num canal de voz.\n\n------------------------------\n\n:warn2: __**Execuções disponíveis:**__ :warn2:\n\n:aclogo: **/play [soundtrack] @ [voice channel]** - Começa a tocar a soundtrack escolhida no canal de voz escolhido.\n\n:aclogo: **/stfu** - Para qualquer música que esteja a ser tocada.\n\n:warn1: __**Qualquer problema deve ser comunicado ao Mentor ou a Master Assassins! Obrigado**__`
      );
      break;
    case "soundtracks":
      channel.send(
        `:aclogo: **Escolhe a tua soundtrack!** :aclogo:\n\nac - Soundtrack de Assassin's Creed\n\nac2 - Soundtrack de Assassin's Creed 2\n\nbrotherhood - Soundtrack de Assassin's Creed: Brotherhood\n\nrevelations - Soundtrack de Assassin's Creed: Revelations\n\nac3 - Soundtrack de Assassin's Creed 3\n\nblackflag - Soundtrack de Assassin's Creed IV: Black Flag\n\nunity - Soundtrack de Assasin's Creed: Unity\n\nrogue - Soundtrack de Assassin's Creed: Rogue\n\nsyndicate - Soundtrack de Assassin's Creed: Syndicate\n\norigins - Soundtrack de Assassin's Creed: Origins`
      );
      break;
    default:
      channel.send(
        "Não conheço esse comando... Tenta ver com o comando **!help** os disponíveis!"
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
    ch => ch.type === "voice" && ch.name === voiceChannelName
  );

  if (!voiceChannel) {
    return channel.send(":warn1: Esse canal não existe!");
  }

  try {
    // conectamos ao canal de voz
    const conn = await voiceChannel.join();
    // colocamos a música a tocar
    const ytUrl = soundtracks[request];

    if (!ytUrl) {
      return channel.send(
        ":warn1: Não conheço essa soundtrack. Utiliza o comando !soundtracks para ver as disponíveis!"
      );
    }

    const stream = ytdl(ytUrl, { filter: "audioonly" });
    conn.playStream(stream, streamOptions);
    // guardamos em memória lo bastardo! e notificamos.
    currentVoiceChannel = voiceChannel;
    channel.send("Boa escolha!");
  } catch (error) {
    console.log(error);
    channel.send(":warn1: Tive um problema ao carregar a música!");
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
    role => role.name.toLowerCase() === team.toLowerCase()
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

bot.on("message", message => {
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
require("http")
  .createServer()
  .listen(3000);
