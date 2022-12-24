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

    //ToS Modal
    if (modal.customId === "CtermsModal") {
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
      if (modal.customId === "ClogsModal") {
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
};