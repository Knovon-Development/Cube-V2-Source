// Discord
const Discord = require('discord.js')

// Util
const { clientLogger } = require('../../util/logger')
const { db } = require('../../util/database/firebase')
const util = require("../../util")

module.exports.run = async (client, interaction, logError) => {
  

  try {
    await interaction.deferReply();
    const isLinked = await db.has(`users/${interaction.user.id}/robloxId`)

    if (!isLinked) {
      const embed = util.getEmbedTemplate(client, "error", 'There is no ROBLOX Account linked to your Discord account')
      interaction.editReply({ embeds: [embed], ephemeral: true })
    } else {
      // Set the user's robloxId
      await db.delete(`users/${interaction.user.id}/robloxId`)

      const embed = new Discord.MessageEmbed()
        .setTitle('All Done!')
        .setDescription('Your ROBLOX account has been unlinked')
        .setColor(util.getColor("primary"))
      interaction.editReply({ embeds: [embed], ephemeral: true })
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
  "name": "unlink",
  "description": "Unlink your account.",
}