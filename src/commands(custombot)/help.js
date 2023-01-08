// Discord
const Discord = require('discord.js')
const util = require('../../util')
const { db } = require('../../util/database/firebase')
module.exports.run = async (client, interaction, logError) => {

  const Group = await db.get(`hubs/${interaction.guild.id}/group`)
  const axios = require("axios");
      await axios
        .get(
          `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${Group.id}&size=150x150&format=Png&isCircular=false`
        )
        .then(async (res) => {

  const embed = new Discord.MessageEmbed()
    .setTitle('Help Menu')
    .setDescription(`__**Commands**__

    View the commands below on Cube Hub. Please note that all commands are slash commands.`)
    .addFields(
      { name: 'User', value: `/help
      /products
      /profile
      /retrieve
      /verify
      /unlink`, inline: true },
      { name: 'Admin', value: `/announce
      /licensegive
      /licenserevoke
      /licensetransfer
      /hubinfo`, inline: true },
      { name: 'Product Creation/Config', value: `/createproduct
      /editproduct
      /deleteproduct
      /whitelist`, inline: true },
      { name: 'HUB Config', value: `/confighub
      /regen-apikey`, inline: true },
    )
    .setThumbnail(res?.data?.data[0]?.imageUrl || null)
    .setColor(util.getColor("primary"))
  interaction.reply({ embeds: [embed], ephemeral: false })
    })
}

module.exports.requiredPermission = "NONE"

module.exports.info = {
  "name": "help",
  "description": "Access the all the commands.",
}