// Discord
const Discord = require('discord.js')

// Util
const { clientLogger } = require('../../util/logger')
const util = require("../../util")
const { db } = require('../../util/database/firebase')
const robloxClient = require('noblox.js')

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
    const user = interaction.options.getMember('user')

    if (!user) {
      if (!(await db.has(`users/${interaction.user.id}/robloxId`))) {
        const embed = util.getEmbedTemplate(client, "error", 'You need to link your ROBLOX account in order to use this command!')
        return interaction.followUp({ embeds: [embed], ephemeral: true })
      }

      const ownedProductIds = await db.get(
        `users/${interaction.user.id}/ownedProducts`
      )

      const robloxId = await db.get(`users/${interaction.user.id}/robloxId`)

      let userThumbnail = await robloxClient.getPlayerThumbnail(
        robloxId,
        420,
        'png',
        true,
        'headshot'
      )
      userThumbnail = userThumbnail[0].imageUrl

      if (!Array.isArray(ownedProductIds)) {
        const embed = new Discord.MessageEmbed()
          .setTitle(`${interaction.user.username}'s Profile`)
          .addField(
            'Roblox Username',
            await robloxClient.getUsernameFromId(robloxId),
            true
          )
          .addField('ROBLOX Id', robloxId, true)
          .addField('Owned Products', 'None', true)
          .setColor(util.getColor("primary"))
          .setThumbnail(userThumbnail)
        return interaction.followUp({ embeds: [embed], ephemeral: true })
      }

      const hubProducts = await db.get(
        `hubs/${interaction.guild.id}/products`
      )
      if (!Array.isArray(hubProducts)) {
        const embed = new Discord.MessageEmbed()
          .setTitle(`${interaction.user.username}'s Profile`)
          .addField(
            'Roblox Username',
            await robloxClient.getUsernameFromId(robloxId),
            true
          )
          .addField('ROBLOX Id', robloxId, true)
          .addField('Owned Products', 'None', true)
          .setColor(util.getColor("primary"))
          .setThumbnail(userThumbnail)
        return interaction.followUp({ embeds: [embed], ephemeral: true })
      }

      const ownedArray = []
      await ownedProductIds.forEach(async productId => {
        // Check if the product exists in the hub products
        const productExists = hubProducts.find(
          product => product.id === productId
        )
        if (productExists) {
          ownedArray.push(productExists.name)
        }
      })
      let ownedText = "None"
      console.log(ownedArray)
      if (!ownedArray == []) {
        ownedText = ownedArray.join('\n')
      }
      if (typeof ownedText !== 'string') {
        ownedText ="None"
      }
      console.log(ownedText)
      try {
      const profileEmbed = new Discord.MessageEmbed()
        .setTitle(`${interaction.user.username}'s Profile`)
        .addField(
          'Roblox Username',
          await robloxClient.getUsernameFromId(robloxId),
          true
        )
        .addField('ROBLOX Id', robloxId, true)
        .addField('Owned Products', ownedText, true)

        .setColor(util.getColor("primary"))
        .setThumbnail(userThumbnail)
      return interaction.followUp({ embeds: [profileEmbed], ephemeral: true })
        } catch (error) {
          const profileEmbed = new Discord.MessageEmbed()
        .setTitle(`${interaction.user.username}'s Profile`)
        .addField(
          'Roblox Username',
          await robloxClient.getUsernameFromId(robloxId),
          true
        )
        .addField('ROBLOX Id', robloxId, true)
        .addField('Owned Products', "None", true)

        .setColor(util.getColor("primary"))
        .setThumbnail(userThumbnail)
      return interaction.followUp({ embeds: [profileEmbed], ephemeral: true })
        }
    } else {
      const userId = user.id
      if (!(await db.has(`users/${userId}/robloxId`))) {
        const embed = util.getEmbedTemplate(client, "error", 'You need to link your ROBLOX account in order to use this command!')
        return interaction.followUp({ embeds: [embed], ephemeral: true })
      }

      const ownedProductIds = await db.get(`users/${userId}/ownedProducts`)

      const robloxId = await db.get(`users/${userId}/robloxId`)

      let userThumbnail = await robloxClient.getPlayerThumbnail(
        robloxId,
        420,
        'png',
        true,
        'headshot'
      )
      userThumbnail = userThumbnail[0].imageUrl

      if (!Array.isArray(ownedProductIds)) {
        const embed = new Discord.MessageEmbed()
          .setTitle(`${user.user.username}'s Profile`)
          .addField(
            'Roblox Username',
            await robloxClient.getUsernameFromId(robloxId),
            true
          )
          .addField('ROBLOX Id', robloxId, true)
          .addField('Owned Products', 'None', true)
          .setColor(util.getColor("primary"))
          .setThumbnail(userThumbnail)
        return interaction.followUp({ embeds: [embed], ephemeral: true })
      }

      const hubProducts = await db.get(
        `hubs/${interaction.guild.id}/products`
      )
      if (!Array.isArray(hubProducts)) {
        const embed = new Discord.MessageEmbed()
          .setTitle(`${user.user.username}'s Profile`)
          .addField(
            'Roblox Username',
            await robloxClient.getUsernameFromId(robloxId),
            true
          )
          .addField('ROBLOX Id', robloxId, true)
          .addField('Owned Products', 'None', true)
          .setColor(util.getColor("primary"))
          .setThumbnail(userThumbnail)
        return interaction.followUp({ embeds: [embed], ephemeral: true })
      }

      const ownedArray = []
      await ownedProductIds.forEach(async productId => {
        // Check if the product exists in the hub products
        const productExists = hubProducts.find(
          product => product.id === productId
        )
        if (productExists) {
          ownedArray.push(productExists.name)
        }
      })

      const profileEmbed = new Discord.MessageEmbed()
        .setTitle(`${user.user.username}'s Profile`)
        .addField(
          'Roblox Username',
          await robloxClient.getUsernameFromId(robloxId),
          true
        )
        .addField('ROBLOX Id', robloxId, true)
        .addField('Owned Products', ownedArray.join('\n') || 'None', true)
        .setColor(util.getColor("primary"))
        .setThumbnail(userThumbnail)
      return interaction.followUp({ embeds: [profileEmbed], ephemeral: true })
    }
  } catch (e) {
    clientLogger.error(e)
    interaction.followUp({
      embeds: [
        util.getEmbedTemplate(client, "error", 'Oh no! There has been an error! Please contact support if this issue still persists.', interaction)
      ]
    })
  }
}


module.exports.requiredPermission = "NONE"

module.exports.info = {
  "name": "profile",
  "description": "View your or someone else's profile such as linked account and owned products.",
  "options": [

    {
      "type": 6,
      "name": "user",
      "description": "User you want to check.",
      "required": false
    }
  ]
}


