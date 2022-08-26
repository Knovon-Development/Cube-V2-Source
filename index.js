const fs = require('fs');
const util = require('./util')
const Discord = require('discord.js');
const dClient = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES
    ],
    allowedMentions: { repliedUser: false }
});

const discordModals = require('discord-modals')
discordModals(dClient);

require('dotenv').config();

// Roblox
require('./util/roblox')
require('./http')

//Attach to dClient
dClient.wait = ms => new Promise(resolve => setTimeout(resolve, ms));
dClient.random = arr => arr[Math.floor(Math.random() * arr.length)]
dClient.logError = async function(source, error) {
    try {
        console.log("New Error!")
        console.log("Source:", source)
        console.log("Error:", error)
    } catch (e) {
        console.log(e)
    }
}

//Load modules
if(fs.existsSync('./modules.js')){
    require('./modules.js')(dClient)
}

//Load events
fs.readdir('./src/events/', (_err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        
        const event = require(`./src/events/${file}`);
        let eventName = file.split('.')[0];

        dClient.on(eventName, event.bind(null, dClient));
        console.log(`Event loaded: ${eventName}`);
    });
});

dClient.commands = new Discord.Collection();
dClient.ownerCommands = new Discord.Collection();

//Load commands
fs.readdir('./src/commands/', async (_err, files) => {
    files.forEach(file => {
        if (!file.endsWith('.js')) return;

        let props = require(`./src/commands/${file}`);
        let commandName = file.split('.')[0];

        dClient.commands.set(props.info.name, props);
        console.log(`Command loaded: ${props.info.name}`);
    });
});

//dClient Login
try{
    dClient.login(process.env.TOKEN)
}
catch(error){
    console.log('[Error] Could not login. Please make sure the token is valid.')
    process.exit(1)
}

module.exports = { dClient }
