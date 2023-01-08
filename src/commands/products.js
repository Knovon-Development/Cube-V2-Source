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

      function productID(product) {
        console.log(product.id)
              return " (${product.id})"
            }
    }

    const productidtrue = interaction.options.getString("name");
    const Group = await db.get(`hubs/${interaction.guild.id}/group`)
    const checkProduct = await db.get(`hubs/${interaction.guild.id}/products`)
    console.log(checkProduct)
    if (Array.isArray(checkProduct)) {
      const axios = require("axios");
      await axios
        .get(
          `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${Group.id}&size=150x150&format=Png&isCircular=false`
        )
        .then(async (res) => {
      const productListEmbed = new Discord.MessageEmbed()
        .setTitle('Available Products')
        .setThumbnail(res?.data?.data[0]?.imageUrl || null)
        .setDescription(`**Hub-ID**
        \`${interaction.guild.id}\`
        
        **Products**
        ${checkProduct.map(product => `- **${product.name}** ${productStock(product)}`).join('\n')}`)
        .addField('Total Products', checkProduct.length.toString(), true)
        .setColor(util.getColor("primary"))
      return interaction.editReply({
        embeds: [productListEmbed]
      })
    })
    } else {
      
      return interaction.editReply({ embeds: [util.getEmbedTemplate(client, "error", "No products found. Smells dusty in here!")], ephemeral: true })
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

