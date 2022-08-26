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
  }
};