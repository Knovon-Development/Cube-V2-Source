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
  await interaction.deferReply();
    try {
      const userFrom = interaction.options.getMember("from");
      const userTo = interaction.options.getMember("to");

      const productToGive = interaction.options.getString("product");

      const checkProduct = await db.get(
        `hubs/${interaction.guild.id}/products`
      );
      if (Array.isArray(checkProduct)) {
        const productExists = checkProduct.find(
          (product) => product.name === productToGive
        );

        if (!productExists) {
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "The product you have enetered does not exist."
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        // Check if the receiver has a ROBLOX Account linked
        const checkFrom = await db.has(`users/${userFrom.user.id}/robloxId`);
        if (!checkFrom) {
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "The user you are trying to give the license to is not verified."
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        const checkTo = await db.has(`users/${userTo.user.id}/robloxId`);
        if (!checkTo) {
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "The user you are trying to give the license to is not verified."
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        const userFromProducts = await db.get(
          `users/${userFrom.user.id}/ownedProducts`
        );
        if (Array.isArray(userFromProducts)) {
          const productCheckAlready = userFromProducts.find(
            (product) => product === productExists.id
          );

          if (!productCheckAlready) {
            const embed = util.getEmbedTemplate(
              client,
              "error",
              "The user you are trying to take the license from, doesn't have a license for this product! Maybe they just want to give their friend a free product."
            );
            return interaction.followUp({ embeds: [embed], ephemeral: true });
          } else {
            const userToProducts = await db.get(
              `users/${userTo.user.id}/ownedProducts`
            );

            if (Array.isArray(userToProducts)) {
              const productCheckAlready = userToProducts.find(
                (product) => product === productExists.id
              );
              if (productCheckAlready) {
                const embed = util.getEmbedTemplate(
                  client,
                  "error",
                  "The user you are trying to transfer the license to, already has a license for this product!"
                );
                return interaction.followUp({
                  embeds: [embed],
                  ephemeral: true,
                });
              }
            }

            const userFromProductsNew = userFromProducts.filter(
              (product) => product !== productExists.id
            );

            await db.set(
              `users/${userFrom.user.id}/ownedProducts`,
              userFromProductsNew
            );
            await db.push(
              `users/${userTo.user.id}/ownedProducts`,
              productExists.id
            );
         
  
            const embed = util.getEmbedTemplate(
              client,
              "success",
              "Product Transferred",
              `**${userFrom.user.tag}** has successfully transferred the product **${productExists.name}** to **${userTo.user.tag}**.`
            );
            interaction.followUp({ embeds: [embed], ephemeral: true });

            try {
              sendProduct(productExists.id, userTo.user.id, 2);
            } catch (e) {
              clientLogger.error(e);
              interaction.followUp({
                embeds: [
                  util.getEmbedTemplate(
                    client,
                    "error",
                    `Something went wrong while trying to deliver the product: \n \`\`\`${e}\`\`\` \n\n***Don't worry! They can still retrieve it using the \`fetch\` command***`
                  ),
                ],
                ephemeral: true,
              });
            }
          }
        } else {
          const embed = util.getEmbedTemplate(
            client,
            "error",
            `**${userFrom.user.tag}** doesn't have any products.`
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
      } else {
        const embed = util.getEmbedTemplate(
          client,
          "error",
          "This hub doesn't have any products! Create one through `/createproduct`."
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
  name: "licensetransfer",
  description: "Transfer a user's license.",
  options: [
        {
          type: 6,
          name: "from",
          description: "User to take the product from.",
          required: true,
        },
        {
          type: 6,
          name: "to",
          description: "User to give the product to.",
          required: true,
        },
        {
          type: 3,
          name: "product",
          description: "Product Name",
          required: true,
        },
  ],
};

