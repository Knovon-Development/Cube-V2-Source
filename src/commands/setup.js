// Discord
const Discord = require("discord.js");
const { Modal, TextInputComponent, showModal } = require('discord-modals') 

// Util
const { db } = require("../../util/database/firebase");
const { clientLogger } = require("../../util/logger");
const util = require("../../util");

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
    if (await db.get(`hubs/${interaction.guild.id}`)) {
      // If the hub already exists in the database send an ephemeral warning
      const embed = util.getEmbedTemplate(
        client,
        "warning",
        "Hub already exists"
      );
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const modal = new Modal() // We create a Modal
      .setCustomId("setupModal")
      .setTitle("Hub Setup")
      .addComponents([
        new TextInputComponent() // We create a Text Input Component
          .setCustomId("groupId")
          .setLabel("Group ID")
          .setStyle("SHORT") //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
          .setMinLength(4)
          .setMaxLength(10)
          .setPlaceholder("Enter Group ID Here...")
          .setRequired(true), // If it's required or not
          new TextInputComponent() // We create a Text Input Component
          .setCustomId("description")
          .setLabel("Hub Description")
          .setStyle("LONG") //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
          .setMinLength(100)
          .setMaxLength(400)
          .setPlaceholder("Enter Description Here...")
          .setRequired(false), // If it's required or not
      ]);

      showModal(modal, {
        client: client, // Client to show the Modal through the Discord API.
        interaction: interaction // Show the modal with interaction data.
      })
  
    
  } catch (e) {
    clientLogger.error(e);
    interaction.reply({
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

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  name: "setup",
  description: "Configure your hub in the database.",
};
