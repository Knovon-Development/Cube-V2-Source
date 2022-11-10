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
    .setTitle('Hub Information')
    .setThumbnail(res?.data?.data[0]?.imageUrl || null)
    .addFields(
        { name: 'Hub-ID', value: `\`\`\`LUA
${interaction.guild.id}\`\`\``, inline: true },
        { name: 'Group-ID', value: `\`\`\`LUA
${Group.id}\`\`\``, inline: true },
        { name: 'Version', value: `\`\`\`V1.4.0\`\`\``, inline: true },
        { name: 'Developers', value: `\`Tanner#5818\` & \`z_t0ht#5254\``, inline: false },
    )
    .setColor(util.getColor("primary"))
  interaction.reply({ embeds: [embed], ephemeral: false })
        })
}

module.exports.requiredPermission = "NONE"

module.exports.info = {
  "name": "hubinfo",
  "description": "Access the Public Hub information.",
}