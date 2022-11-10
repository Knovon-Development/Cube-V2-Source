// Discord
const Discord = require("discord.js");

// Util
const { clientLogger } = require("../../util/logger");
const util = require("../../util")
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

  try {
    await interaction.deferReply();
    const productToRetrieve = interaction.options.getString("product");

    const checkProduct = await db.get(`hubs/${interaction.guild.id}/products`);
    if (Array.isArray(checkProduct)) {
      const productExists = checkProduct.find(
        (product) => product.name === productToRetrieve
      );

      if (!productExists) {
        return interaction.followUp({
          embeds: [
            util.getEmbedTemplate(client, "error", 
              "The product you're looking for doesn't exist. Please check your spelling it's K-Sensitive."
            ),
          ],
          ephemeral: true,
        });
      }

      // Check if the target has a ROBLOX Account linked
      const checkUser = await db.has(`users/${interaction.user.id}/robloxId`);
      if (!checkUser) {
        const embed = util.getEmbedTemplate(client, "error", "You need to link your BOBLOX account in order to use this command")
        return interaction.followUp({ embeds: [embed], ephemeral: true });
      }

      const userProducts = await db.get(
        `users/${interaction.user.id}/ownedProducts`
      );

      if (Array.isArray(userProducts)) {
        const productOwns = userProducts.find(
          (product) => product === productExists.id
        );

        if (!productOwns) {
          const embed = new Discord.MessageEmbed()
            .setTitle("Good Try!")
            .setDescription("Are you really that broke that you have to try to steal the products?!")
            .setColor(util.getColor("error"));
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        await sendProduct(productExists.id, interaction.user.id, 3);

        const embed = new Discord.MessageEmbed()
          .setTitle("Product retrieved")
          .setDescription(
            `You've retrieved ${productExists.name}, please check your Direct Messages`
          )
          .setColor(util.getColor("primary"));
        return interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        const embed = new Discord.MessageEmbed()
          .setTitle("Good Try!")
          .setDescription("Are you really that broke that you have to try to steal the products?!")
          .setColor(util.getColor("error"));
        return interaction.followUp({ embeds: [embed], ephemeral: true });
      }
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle("Good Try!")
        .setDescription("Are you really that broke that you have to try to steal the products?!")
        .setColor(util.getColor("error"));
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  } catch (e) {
    clientLogger.error(e);
    interaction.followUp({
      embeds: [
        util.getEmbedTemplate(client, "error", 
          "Oh no! There has been an error! Please contact support if this issue still persists. I'm such a failure.",
          interaction
        ),
      ],
    });
  }
};

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  name: "retrieve",
  description: "Retrieve a product you own's file.",
  options: [
    {
      type: 3,
      name: "product",
      description: "Product Name",
      required: true,
    },
  ],
};