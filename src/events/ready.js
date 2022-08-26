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

  //Set first status
 setInterval(() => {
    client.user.setPresence({
      activities: [
        {
          name: `over ${client.guilds.cache.size + 1} Hub(s)`,
          type: "WATCHING",
        },
      ],
      status: "online",
    });
  }, 10000);
  } catch (error) {
    console.log("[Status Error] Could not set status");
  }
};
