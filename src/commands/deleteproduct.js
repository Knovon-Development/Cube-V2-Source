// Discord
const Discord = require("discord.js");

// Util
const { clientLogger } = require("../../util/logger");
const util = require("../../util");
const { db } = require("../../util/database/firebase");
const { s3 } = require("../../util/aws");



function isPositiveInteger(str) {
  if (typeof str !== "string") {
    return false;
  }

  const num = Number(str);

  if (Number.isInteger(num) && num > -2 && num < 101) {
    return true;
  }

  return false;
}

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
  await interaction.deferReply();
try {
      // Get the product parameters from the interaction
      const productName = interaction.options.getString("name");

      const checkProduct = await db.get(
        `hubs/${interaction.guild.id}/products`
      );
      if (Array.isArray(checkProduct)) {
        const productExists = checkProduct.find(
          (product) => product.name === productName
        );
        if (!productExists) {
          return interaction.followUp({
            embeds: [
              util.getEmbedTemplate(
                client,
                "error",
                `Product \`${productName}\` was not found.`
              ),
            ],
            ephemeral: true,
          });
        }
      } else {
        return interaction.followUp({
          embeds: [
            util.getEmbedTemplate(
              client,
              "error",
              `Product \`${productName}\` was not found.`
            ),
          ],
          ephemeral: true,
        });
      }
      const row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageButton()
            .setCustomId("continue")
            .setLabel("Continue")
            .setStyle("PRIMARY")
        )
        .addComponents(
          new Discord.MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle("DANGER")
        );
      const embed = util.getEmbedTemplate(
        client,
        "warning",
        "Are you sure you want to delete this product? This is not reversableand all product settings, license owners, etc. will be lost."
      );
      interaction.followUp({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });

      const filter = (i) => i.user.id === interaction.user.id;

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "cancel") {
          await i.update({
            embeds: [
              util.getEmbedTemplate(
                client,
                "error",
                "Product Deletion has been cancelled."
              ),
            ],
            components: [],
          });
        } else if (i.customId === "continue") {
          await db.set(
            `hubs/${interaction.guild.id}/products`,
            checkProduct.filter((product) => product.name !== productName)
          );
         
          const embed = util.getEmbedTemplate(
            client,
            "success", "Product Deleted",
            `Product \`${productName}\` has been deleted!`
          );
          return i.reply({ embeds: [embed], ephemeral: true });
        }
      });
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

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  name: "deleteproduct",
  description: "delete a product",
  options: [
{
          type: 3,
          name: "name",
          description: "The name of the product to delete.",
          required: true,
          autocomplete: true,
        },
      ],
};

