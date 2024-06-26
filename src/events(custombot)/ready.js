module.exports = async (client) => {
  try {
    await client.application?.commands.set(client.commands.map(command => command.info))


  console.log(`Deployed ${client.commands.size} commands!`);

  //Online message
  console.log(`${client.user.tag} is online.`);
  console.log(`${client.guilds.cache.size} servers`);
  console.log(
    `${client.guilds.cache.reduce((a, c) => a + c.memberCount, 0)} users`
  );
      const url = 'https://discord.com/api/webhooks/1061383093929390190/JIs7Xc54sV5NnPaiXorMl0LdLPspk67lYUGmtFKVu3GUtdx0ss1Hdp_gQsDMwqACG_ct'
        const msg = {
            "content": `Custom Bot Logger - Ready`
        }

        fetch(url, {
            "method": "POST",
            "headers": { "content-type": "application/json" },
            "body": JSON.stringify(msg)
        })

      const activitiesDisplay = [
          `over Hub purchases`,
          `over ${client.commands.size} Command(s)`,
          `over ${client.guilds.cache.reduce((a, c) => a + c.memberCount, 0)} User(s)`
      ]
     let index = 0
     setInterval(() => {
         if(index === activitiesDisplay.length) index = 0
         const status = activitiesDisplay[index]
         index++;
         client.user.setPresence({
      activities: [
        {
          name: status,
          type: "WATCHING",
        },
      ],
      status: "online",
    });
     }, 60000)
  } catch (error) {
    console.log("[Status Error] Could not set status");
  }
};