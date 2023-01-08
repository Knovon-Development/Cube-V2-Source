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
                "The server owner doesn't own the hub!"
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
                    "The server owner doesn't own the hub!"
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
                "The server owner doesn't own the hub!"
            ),
        ],
        ephemeral: true,
    })
}
  try {

    const modal = new Modal() // We create a Modal
      .setCustomId("termsModal")
      .setTitle("Terms of Service Setup")
      .addComponents([
          new TextInputComponent() // We create a Text Input Component
          .setCustomId("ToS")
          .setLabel("Terms of Service")
          .setStyle("LONG") //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
          .setMinLength(20)
          .setMaxLength(4000)
          .setPlaceholder("Enter Terms of Service Here...")
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
  name: "set-terms",
  description: "Configure your hub's Legal policies.",
};