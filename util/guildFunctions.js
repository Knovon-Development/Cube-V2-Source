const { db } = require('./database/firebase')
const { MessageEmbed } = require('discord.js');
const util = require('./')


const role = async (client, guildId, userId) => {
    let settings = await db.get(`hubs/${guildId}/settings`)
    if (settings && settings.purchasedRole) {
        if (client.guilds.cache.get(guildId).roles.cache.get(settings.purchasedRole)) {
            let purchasedRole = client.guilds.cache.get(guildId).roles.cache.get(settings.purchasedRole)
            if (client.guilds.cache.get(guildId).members.cache.get(userId)) {
            try {
                client.guilds.cache.get(guildId).members.cache.get(userId).roles.add(purchasedRole)
            
            } catch (e) {
                console.log(e)
                logChannel.send({
                    embeds: [new MessageEmbed()
                        .setTitle("Error!")
                        .setDescription("There has been an error!")
                    ]
                })
            }
        }
        }
    } else {
        return;
    }
}

module.exports = { log, role }
