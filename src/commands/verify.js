// Discord
const Discord = require("discord.js");

// Util
const { clientLogger } = require("../../util/logger");
const { db } = require("../../util/database/firebase");
const axios = require("axios");
const util = require("../../util");

module.exports.run = async (client, interaction, logError) => {
  try {
    await interaction.deferReply();
    const isLinked = await db.has(`users/${interaction.user.id}/robloxId`);

    if (!isLinked) {
      // Fetch the Bloxlink API With Axios
      const { data } = await axios.get(
        `https://v3.blox.link/developer/discord/${interaction.user.id}`,
        {
          headers: {
            "api-key":
              "b5b22987-254a-4400-9e9b-73130c90d292",
          },
        }
      );

      if (data.success === true && data.user == {}) {
        const embed = new Discord.MessageEmbed()
          .setTitle("Not Linked")
          .setDescription(
            "Please link your account with [Bloxlink](https://blox.link) and run this command again"
          )
          .setColor(util.getColor("primary"));
        return interaction.followUp({ embeds: [embed], ephemeral: true });
      } else if (data.success === false) {
        const embed = new Discord.MessageEmbed()
          .setTitle("Error")
          .setDescription(`An error has occured.`)
          .setColor(util.getColor("error"));
        return interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        const robloxClient = require("noblox.js");

        const users = (await db.get("users")) || {};

        const userRecord = Object.values(users).find(
          (user) => user.robloxId === data.user.primaryAccount
        );

        if (userRecord) {
          const embed = new Discord.MessageEmbed()
            .setTitle("Error!")
            .setDescription(
              "we can't link a single ROBLOX Accounts to multiple Discord accounts for security reasons."
            )
            .setThumbnail(
              "https://cdn.discordapp.com/emojis/842172192401915971.png"
            )
            .setColor(util.getColor("primary"));
          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // Set the user's robloxId
        await db.set(
          `users/${interaction.user.id}/robloxId`,
          data.user.primaryAccount
        );

        await db.set(
          `users/${interaction.user.id}/discordId`,
          interaction.user.id
        );

        let userThumbnail = await robloxClient.getPlayerThumbnail(
          data.user.primaryAccount
        );
        userThumbnail = userThumbnail[0].imageUrl;

        const successEmbed = new Discord.MessageEmbed()
          .setTitle("Verified")
          .setDescription(
            `You have been verified as **${await robloxClient.getUsernameFromId(
              data.user.primaryAccount
            )}** (${data.user.primaryAccount})!`
          )
          .setColor(util.getColor("primary"))
          .setThumbnail(userThumbnail);
        interaction.editReply({
          embeds: [successEmbed],
          ephemeral: true,
        });
        return;
      }
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle("Already Verified")
        .setDescription("You're already verified")
        .setColor(util.getColor("primary"));
      interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  } catch (e) {
    clientLogger.error(e);
    interaction.followUp({
      embeds: [
        util.getEmbedTemplate(
          client,
          "error",
          "Oh no! There has been an error! Please contact support if this issue still persists.",
          interaction
        ),
      ],
    });
  }
};

module.exports.requiredPermission = "NONE";

module.exports.info = {
  name: "verify",
  description: "Verify your account",
};