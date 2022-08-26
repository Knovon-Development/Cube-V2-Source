// Discord
const Discord = require('discord.js')
const util = require('../../util')
module.exports.run = async (client, interaction, logError) => {

  const embed = new Discord.MessageEmbed()
    .setTitle('Help Menu')
    .setDescription(`__**Commands**__

    View the commands below on Cube Hub. Please note that all commands are slash commands.

    /createproduct <name> <description> <developer-product>  [image] [stock]
    [test-place-id]

    /editproduct <product> [description] [stock] [developer-product] [image] [file]
    [test-place-id]

    /deleteproduct <product>
    /announce <product> <message>
    /confighub [group id] [description] [purchased-role]
    /giveproduct <user> <product>
    /revokeproduct <user> <product>
    /transferproduct <from> <to> <product>
    /help
    /products
    /profile [user]
    /regen
    /retrieve <product>
    /verify
    /unlink
    
    < > - Required | [ ] - Optional`)
    .setColor(util.getColor("primary"))
  interaction.reply({ embeds: [embed], ephemeral: true })

}

module.exports.requiredPermission = "NONE"

module.exports.info = {
  "name": "help",
  "description": "Access the help menu.",
}