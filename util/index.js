const { nanoid } = require('nanoid')
const Filter = require('bad-words')
const Discord = require("discord.js")
randomString = function(count) {
    return nanoid(count)
}

getIcon = function(type) {
    if (type.toLowerCase() === "error") return "https://i.imgur.com/sNJadfA.png"
    if (type.toLowerCase() === "success") return "https://i.imgur.com/8KIyqYO.png"
    if (type.toLowerCase() === "warning") return "https://i.imgur.com/Hpr2MQi.png"
}

getColor = function(type) {
    if (type.toLowerCase() === "error") return "#D55745"
    if (type.toLowerCase() === "primary") return "#FFFFFF"
    if (type.toLowerCase() === "success") return "#6CA88B"
    if (type.toLowerCase() === "warning") return "#F2A93B"
    else return ""
}

filterString = function(string) {
    var filter = new Filter()
    return filter.clean(string)
}

getEmbedTemplate = function(dClient, template, input, inputTwo) {
    if (template.toLowerCase() == "error") {
        if(!input) return
        console.log(getColor("error"))
        let embed = new Discord.MessageEmbed()
        .setColor(getColor("error"))
        .setAuthor({name:  "Error!", iconURL: getIcon("error")})
        .setDescription(input)
        .setFooter({ text: dClient.user.username, iconURL: dClient.user.displayAvatarURL({ dynamic: true }) })
    
        return embed
    } else if (template.toLowerCase() == "success") {
        if(!input) return
    
        let embed = new Discord.MessageEmbed()
        .setColor(getColor("success"))
        .setAuthor({name:  input, iconURL: getIcon("success")})
        .setDescription(inputTwo)
        .setFooter({ text: dClient.user.username, iconURL: dClient.user.displayAvatarURL({ dynamic: true }) })
    
        return embed
    } else if (template.toLowerCase() == "warning") {
        if(!input) return
    
        let embed = new Discord.MessageEmbed()
        .setColor(getColor("warning"))
        .setAuthor({name:  "Warning!", iconURL: getIcon("warning")})
        .setDescription(input)
        .setFooter({ text: dClient.user.username, iconURL: dClient.user.displayAvatarURL({ dynamic: true }) })
    
        return embed
    }
}

wait = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    getIcon: getIcon,
    getColor: getColor, 
    wait: wait,
    getEmbedTemplate: getEmbedTemplate,
    filterString: filterString,
    randomString: randomString
}
