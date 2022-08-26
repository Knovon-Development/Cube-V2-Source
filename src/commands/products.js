// Discord
const Discord = require('discord.js')

// Util
const { clientLogger } = require('../../util/logger')
const util = require("../../util")
const { db } = require('../../util/database/firebase')

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
    function productStock(product) {
      console.log(product.stock)
      if (product.stock) {
        if (product.stock > -1) {
          if (product.stock == 0) {
            return " (Out of Stock)"
          } else {
            return ` (${product.stock})`
          }
        } else return ""
      } else return ""
    }

    const checkProduct = await db.get(`hubs/${interaction.guild.id}/products`)
    console.log(checkProduct)
    if (Array.isArray(checkProduct)) {
      const productListEmbed = new Discord.MessageEmbed()
        .setTitle('Products')
        .setDescription(
          checkProduct.map(product => `- ${product.name}${productStock(product)}`).join('\n')
        )
        .addField('Total Products', checkProduct.length.toString(), true)
        .setColor(util.getColor("primary"))
      return interaction.editReply({
        embeds: [productListEmbed]
      })
    } else {
      
      return interaction.editReply({ embeds: [util.getEmbedTemplate(client, "error", "No products found.")], ephemeral: true })
    }
  } catch (e) {
    clientLogger.error(e)
    interaction.followUp({
      embeds: [
        util.getEmbedTemplate(client, "error", 'Oh no! There has been an error! Please contact support if this issue still persists.', interaction)
      ], ephemeral: true
    })
  }
}

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  "name": "products",
  "description": "View the group's products.",
}

