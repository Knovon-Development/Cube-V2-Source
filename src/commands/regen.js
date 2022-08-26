// Discord
const Discord = require("discord.js");

// Util
const { db } = require("../../util/database/firebase");
const { clientLogger } = require("../../util/logger");
const chance = require("chance");
const util = require("../../util")


module.exports.run = async (client, interaction, logError) => {

  const checkUser = await db.has(
            `users/${interaction.guild.ownerId}/robloxId`
        )
        if (!checkUser) {
            return interaction.reply({
                embeds: [
                    getEmbedTemplate(
                        client,
                        "error",
                        "Server owner does not own a Hub whitelist"
                    ),
                ],
                ephemeral: true,
            })
        }
    
        const userProducts = await db.get(
            `users/${interaction.guild.ownerId}/ownedProducts`
        )
    
        if (Array.isArray(userProducts)) {
            const productOwns = userProducts.find(
                (product) => product === "K66nqwUz5QCOGFixQHY_y0up0wYxi-Uz3pw1"
            )
    
            if (!productOwns) {
                return interaction.reply({
                    embeds: [
                        getEmbedTemplate(
                            client,
                            "error",
                            "Server owner does not own a Hub Whitelist"
                        ),
                    ],
                    ephemeral: true,
                })
            }
        } else {
            return interaction.reply({
                embeds: [
                    getEmbedTemplate(
                        client,
                        "error",
                        "Server owner does not own a Hub Whitelist"
                    ),
                ],
                ephemeral: true,
            })
        }

  try {
    await interaction.deferReply();
    const secret = util.randomString(15);

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setCustomId("confirmRegen")
        .setLabel("Confirm")
        .setStyle("PRIMARY"),
      new Discord.MessageButton()
        .setCustomId("declineRegen")
        .setLabel("Nevermind")
        .setStyle("DANGER")
    );

    const embed = util.getEmbedTemplate(client, "warning", "Are you sure you want to regenerate your API Key? This is not reversable and the old API Key will stop working immediately!");
    interaction.followUp({ embeds: [embed], components: [row] });

    const regenButtons = (i) => i.user.id === interaction.user.id;
    const buttonsCollector =
      interaction.channel.createMessageComponentCollector({
        regenButtons,
        max: 1,
      });

    buttonsCollector.on("collect", async (i) => {
      if (i.customId === "confirmRegen") {
        await i.update({
          components: [],
        });

        await db.set(`hubs/${interaction.guild.id}/credentials`, {
          api: secret
        });
       
        const completedSetup = util.getEmbedTemplate(client, "success", "Configuration Updated!", `Configuration has been changed. The new API key is: ||${secret}||\n**Do not share it, even with your dog!**`)

        return interaction.followUp({
          embeds: [completedSetup],
        });
      } else if (i.customId === "declineRegen") {
        const embed = new Discord.MessageEmbed()
          .setTitle("Regeneration cancelled.")
          .setColor(util.getColor("primary"))
          .setFooter({
            text: interaction.user.username,
            iconURL: interaction.user.avatarURL(),
          });
        return i.update({ embeds: [embed], components: [] });
      }
    });
  } catch (err) {
    clientLogger.error(err);
    const embed = util.getEmbedTemplate(client, "error", 
      "Something went wrong! Try again soon or contact support."
    );
    return interaction.followUp({ embeds: [embed] });
  }
};

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  name: "regen",
  description: "Regenerate the API Key.",
};
