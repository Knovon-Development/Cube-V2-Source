// Discord
const Discord = require("discord.js");

// Util
const { clientLogger } = require("../../util/logger");
const util = require("../../util");
const { db } = require("../../util/database/firebase");
const { sendProduct } = require("../../util/products");


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
      const userToRevoke = interaction.options.getMember("user");
      const productToRevoke = interaction.options.getString("product");

      const checkProduct = await db.get(
        `hubs/${interaction.guild.id}/products`
      );
      if (Array.isArray(checkProduct)) {
        const productExists = checkProduct.find(
          (product) => product.name === productToRevoke
        );

        if (!productExists) {
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "The product you have enetered does not exist."
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        // Check if the target has a ROBLOX Account linked
        const checkUser = await db.has(
          `users/${userToRevoke.user.id}/robloxId`
        );
        if (!checkUser) {
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "The user you are trying to give the license to is not verified."
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        const userProducts = await db.get(
          `users/${userToRevoke.user.id}/ownedProducts`
        );

        if (Array.isArray(userProducts)) {
          const productOwns = userProducts.find(
            (product) => product === productExists.id
          );

          if (!productOwns) {
            const embed = util.getEmbedTemplate(
              client,
              "error",
              "The user you are trying to revoke a license form doesn't have a license for this product."
            );
            return interaction.followUp({ embeds: [embed], ephemeral: true });
          }

          const newUserProducts = userProducts.filter(
            (product) => product !== productExists.id
          );

          await db.set(
            `users/${userToRevoke.user.id}/ownedProducts`,
            newUserProducts
          );
       
          const embed = util.getEmbedTemplate(
            client,
            "success",
            "License Revoked",
            `${productToRevoke} has been revoked from ${userToRevoke.user.username}.`
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "The user you are trying to revoke a license form doesn't have a license for this product."
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
      } else {
        const embed = util.getEmbedTemplate(
          client,
          "error",
          "This hub doesn't have any products! Create one through `/product create`."
        );
        return interaction.followUp({ embeds: [embed], ephemeral: true });
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

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  name: "revokeproduct",
  description: "Revoke a users product.",
  options: [
{
          type: 6,
          name: "user",
          description: "User to give the product to.",
          required: true,
        },
        {
          type: 3,
          name: "product",
          description: "Product Name",
          required: true,
          autocomplete: true,
        },
  ],
};

