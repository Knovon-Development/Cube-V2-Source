// Discord
const Discord = require("discord.js");

// Util
const { db } = require("../../util/database/firebase");
const { clientLogger } = require("../../util/logger");
const chance = require("chance");
const util = require("../../util");

const { nanoid, customAlphabet } = require("nanoid");
const alphabet = "0123456789";

const fetch = require("node-fetch");

module.exports = async (client, modal) => {
  if (modal.customId === "setupModal") {
    await modal.deferReply();
    const group = modal.getTextInputValue("groupId");
    let hubDescription;
    if (modal.getTextInputValue("description")) {
      hubDescription = modal.getTextInputValue("description");
    } else {
      hubDescription = null;
    }
    if (isNaN(group)) {
      const embed = util.getEmbedTemplate(
        client,
        "error",
        "Group ID must be a number!"
      );
      return modal.followUp({ embeds: [embed] });
    }

    const robloxClient = require("noblox.js");
    robloxClient.getGroup(group).then(async (group) => {
      if (!group) {
        const embed = util.getEmbedTemplate(
          client,
          "error",
          "Group does not exist!"
        );
        return modal.followUp({ embeds: [embed] });
      }

      const row = new Discord.MessageActionRow().addComponents(
        new Discord.MessageButton()
          .setCustomId("confirmGroup")
          .setLabel("It's my group!")
          .setStyle("PRIMARY"),
        new Discord.MessageButton()
          .setCustomId("declineGroup")
          .setLabel("Nevermind")
          .setStyle("DANGER")
      );

      const axios = require("axios");
      await axios
        .get(
          `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${group.id}&size=150x150&format=Png&isCircular=false`
        )
        .then(async (res) => {
          const embed = new Discord.MessageEmbed()
            .setTitle(
              "We found a group with that ID, Please confirm it's your group"
            )
            .addField("Group Name", group.name, true)
            .addField("Group Owner", group.owner.username, true)
            .addField("Group Membercount", group.memberCount.toString())
            .setThumbnail(res?.data?.data[0]?.imageUrl || null)
            .setColor(util.getColor("primary"));
          modal.followUp({ embeds: [embed], components: [row] });

          const groupButtons = (i) => i.user.id === modal.member.id;
          const modalChannel = client.channels.cache.get(modal.channelId);
          const buttonsCollector = modalChannel.createMessageComponentCollector(
            {
              groupButtons,
              max: 1,
            }
          );

          buttonsCollector.on("collect", async (i) => {
            if (i.customId === "confirmGroup") {
              await i.update({
                components: [],
              });

              function makeid(length) {
                var result = "";
                var characters =
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                var charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                  result += characters.charAt(
                    Math.floor(Math.random() * charactersLength)
                  );
                }
                return result;
              }

              const secret = makeid(15);

              await db.set(`hubs/${modal.guildId}`, {
                credentials: {
                  api: secret,
                  experimentsEnabled: chance.Chance().bool({ likelihood: 30 }), // 30% chance of experiments being enabled for this hub. This is used to test new features on random hubs
                },
                group: {
                  id: group.id,
                },
                settings: {
                  description: hubDescription,
                },
              });

              const completedSetup = new Discord.MessageEmbed()
                .setTitle("Setup Completed")
                .setDescription(
                  `Initial configuration has been completed, now please download the following ROBLOX Place, fill the configuration and publish it to your game.\n\nThe API Key is ||${secret}||\n The Hub ID is ${modal.guildId}\n**[Download Hub](https://knovon.org/hub/download)**`
                )
                .setColor(util.getColor("primary"));

              return modal.followUp({
                embeds: [completedSetup],
              });
            } else if (i.customId === "declineGroup") {
              const embed = new Discord.MessageEmbed()
                .setTitle("Setup cancelled")
                .setColor(util.getColor("primary"))
                .setFooter({
                  text: modal.member.username,
                  iconURL: modal.member.avatarURL(),
                });
              return i.update({ embeds: [embed], components: [] });
            }
          });
        })
        .catch((err) => {
          clientLogger.error(err);
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "There was an issue. Maybe check your Group ID?"
          );
          return modal.followUp({ embeds: [embed] });
        });
    }).catch((error) => {
      clientLogger.error(error);
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "There was an issue. Maybe check your Group ID?"
          );
          return modal.followUp({ embeds: [embed] });
    })
    
  };
  

    //ToS Modal
    if (modal.customId === "termsModal") {
    await modal.deferReply();
    let ToS;
    if (modal.getTextInputValue("ToS")) {
      ToS = modal.getTextInputValue("ToS");
    } else {
      ToS = null;
    }
      const row = new Discord.MessageActionRow().addComponents(
        new Discord.MessageButton()
          .setCustomId("confirmToS")
          .setLabel("It's Correct!")
          .setStyle("PRIMARY"),
        new Discord.MessageButton()
          .setCustomId("declineToS")
          .setLabel("Nevermind")
          .setStyle("DANGER")
      );
      
      const Group = await db.get(`hubs/${modal.guild.id}/group`)

      const axios = require("axios");
      await axios
        .get(
          `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${Group.id}&size=150x150&format=Png&isCircular=false`
        )
        .then(async (res) => {
          const embed = new Discord.MessageEmbed()
            .setTitle(
              "Please confirm your new ToS before continuing!"
            )
            .addField("Confirmation", `I confirm that I would like to update my Terms of Service.`, false)
            .setThumbnail(res?.data?.data[0]?.imageUrl || null)
            .setColor(util.getColor("primary"));
          modal.followUp({ embeds: [embed], components: [row] });

          const ToSButtons = (i) => i.user.id === modal.member.id;
          const modalChannel = client.channels.cache.get(modal.channelId);
          const buttonsCollector = modalChannel.createMessageComponentCollector(
            {
              ToSButtons,
              max: 1,
            }
          );

          buttonsCollector.on("collect", async (i) => {
            if (i.customId === "confirmToS") {
              await i.update({
                components: [],
              });

              await db.set(`hubs/${modal.guildId}/Terms`, {
                TermsofService: {
                  TermsofService: ToS,
                }
              });

              const completedSetup = new Discord.MessageEmbed()
                .setTitle("Terms configuration Completed")
                .setDescription(
                  `Terms of Service has been updated!`
                )
                .setColor(util.getColor("primary"));

              return modal.followUp({
                embeds: [completedSetup],
              });
            } else if (i.customId === "declineToS") {
              const embed = new Discord.MessageEmbed()
                .setTitle("Terms configuration cancelled")
                .setColor(util.getColor("primary"))
                .setFooter({
                  text: modal.member.username,
                  iconURL: modal.member.avatarURL(),
                });
              return i.update({ embeds: [embed], components: [] });
            }
          });
        })
  };

      //Logs Modal
      if (modal.customId === "logsModal") {
        await modal.deferReply();
        const IsEnabled = modal.getTextInputValue("Enabled");
        let WURL;
        if (modal.getTextInputValue("WURL")) {
          WURL = modal.getTextInputValue("WURL");
        } else {
          WURL = null;
        }
          const row = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
              .setCustomId("confirmLogs")
              .setLabel("It's Correct!")
              .setStyle("PRIMARY"),
            new Discord.MessageButton()
              .setCustomId("declineLogs")
              .setLabel("Nevermind")
              .setStyle("DANGER")
          );
          
          const Group = await db.get(`hubs/${modal.guild.id}/group`)
    
          const axios = require("axios");
          await axios
            .get(
              `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${Group.id}&size=150x150&format=Png&isCircular=false`
            )
            .then(async (res) => {
              const embed = new Discord.MessageEmbed()
                .setTitle(
                  "Please confirm your new purchase log settings before continuing!"
                )
                .addField("Confirmation", `I confirm that I would like to update my purchase log settings.`, false)
                .setThumbnail(res?.data?.data[0]?.imageUrl || null)
                .setColor(util.getColor("primary"));
              modal.followUp({ embeds: [embed], components: [row] });
    
              const LogButtons = (i) => i.user.id === modal.member.id;
              const modalChannel = client.channels.cache.get(modal.channelId);
              const buttonsCollector = modalChannel.createMessageComponentCollector(
                {
                  LogButtons,
                  max: 1,
                }
              );
    
              buttonsCollector.on("collect", async (i) => {
                if (i.customId === "confirmLogs") {
                  await i.update({
                    components: [],
                  });
    
                  await db.set(`hubs/${modal.guildId}/Logs`, {
                    Purchaselogs: {
                      Purchaselog: WURL,
                      IsEnabled: IsEnabled,
                    }
                  });
    
                  const completedSetup = new Discord.MessageEmbed()
                    .setTitle("Log configuration Completed")
                    .setDescription(
                      `Purchase logs has been updated!`
                    )
                    .setColor(util.getColor("primary"));
    
                  return modal.followUp({
                    embeds: [completedSetup],
                  });
                } else if (i.customId === "declineLogs") {
                  const embed = new Discord.MessageEmbed()
                    .setTitle("Purchase log configuration cancelled")
                    .setColor(util.getColor("primary"))
                    .setFooter({
                      text: modal.member.username,
                      iconURL: modal.member.avatarURL(),
                    });
                  return i.update({ embeds: [embed], components: [] });
                }
              });
            })
      };

      //Token Modal
      if (modal.customId === "BotsModal") {
        await modal.deferReply();
        const Token = modal.getTextInputValue("Token");
          const row = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
              .setCustomId("confirmBot")
              .setLabel("Confirm!")
              .setStyle("PRIMARY"),
            new Discord.MessageButton()
              .setCustomId("declineBot")
              .setLabel("Nevermind")
              .setStyle("DANGER")
          );
          
          const Group = await db.get(`hubs/${modal.guild.id}/group`)
    
          const axios = require("axios");
          await axios
            .get(
              `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${Group.id}&size=150x150&format=Png&isCircular=false`
            )
            .then(async (res) => {
              const embed = new Discord.MessageEmbed()
                .setTitle(
                  "Please confirm your new Bot Token before continuing!"
                )
                .addField("Confirmation", `I confirm that I would like to update my Token settings.`, false)
                .addField("Token", `||${Token}||`, true)
                .setThumbnail(res?.data?.data[0]?.imageUrl || null)
                .setColor(util.getColor("primary"));
              modal.followUp({ embeds: [embed], components: [row] });
    
              const LogButtons = (i) => i.user.id === modal.member.id;
              const modalChannel = client.channels.cache.get(modal.channelId);
              const buttonsCollector = modalChannel.createMessageComponentCollector(
                {
                  LogButtons,
                  max: 1,
                }
              );
    
              buttonsCollector.on("collect", async (i) => {
                if (i.customId === "confirmBot") {
                  await i.update({
                    components: [],
                  });
    
                  await db.set(`hubs/${modal.guildId}/Logs`, {
                    CustomBot: {
                      Token: Token,
                    }
                  });


const fs = require('fs');
const util = require('/Hub/util')
const Discord = require('discord.js');
const dClient = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ],
    allowedMentions: { repliedUser: false }
});

const discordModals = require('discord-modals')
discordModals(dClient);

require('dotenv').config();

// Roblox
require('/Hub/util/roblox')
require('/Hub/http')

//Attach to dClient
dClient.wait = ms => new Promise(resolve => setTimeout(resolve, ms));
dClient.random = arr => arr[Math.floor(Math.random() * arr.length)]
dClient.logError = async function(source, error) {
    try {
        console.log("New Error!")
        console.log("Source:", source)
        console.log("Error:", error)
    } catch (e) {
        console.log(e)
    }
}

//Load modules
if(fs.existsSync('/Hub/modules.js')){
    require('/Hub/modules.js')(dClient)
}

//Load events
fs.readdir('/Hub/src/events(custombot)/', (_err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        
        const event = require(`/Hub/src/events(custombot)/${file}`);
        let eventName = file.split('.')[0];

        dClient.on(eventName, event.bind(null, dClient));
        console.log(`Event loaded: ${eventName}`);
    });
});

dClient.commands = new Discord.Collection();
dClient.ownerCommands = new Discord.Collection();

//Load commands
fs.readdir('/Hub/src/commands(custombot)/', async (_err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;

        let props = require(`/Hub/src/commands(custombot)/${file}`);
        let commandName = file.split('.')[0];

        dClient.commands.set(props.info.name, props);
        console.log(`Command loaded: ${props.info.name}`);
    });
});

//dClient Login
try{
    dClient.login(Token)
}


catch(error){
    console.log('[Error] Could not login. Please make sure the token is valid.')
    process.exit(1)
}

module.exports = { dClient }
    
                  const completedSetup = new Discord.MessageEmbed()
                    .setTitle("Bot configuration Completed")
                    .setDescription(
                      `Your bot token has been updated!`
                    )
                    .setColor(util.getColor("primary"));
    
                  return modal.followUp({
                    embeds: [completedSetup],
                  });
                } else if (i.customId === "declineBot") {
                  const embed = new Discord.MessageEmbed()
                    .setTitle("Bot token configuration cancelled")
                    .setColor(util.getColor("primary"))
                    .setFooter({
                      text: modal.member.username,
                      iconURL: modal.member.avatarURL(),
                    });
                  return i.update({ embeds: [embed], components: [] });
                }
              });
            })
      };

};