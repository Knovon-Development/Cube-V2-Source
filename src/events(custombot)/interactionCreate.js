const { checkHubSetup } = require("../../util/hubs");
const { db } = require("../../util/database/firebase");

module.exports = async (client, i) => {
  //Filter out non-commands
  if (!i.isCommand() && !i.isContextMenu()) {    if (!i.isCommand()) {
    if (i.isAutocomplete()) {
      if (!(await checkHubSetup(i.guild.id))) return;

      const queryText = i.options.getFocused()

      const productNames = []
      const getProducts = await db.get(`hubs/${i.guild.id}/products`)
      if (Array.isArray(getProducts)) {
        getProducts.forEach(product => {
          productNames.push({
            name: product.name,
            value: product.name
          })
        })
      }

      const filtered = productNames.filter(name =>
        name.name.startsWith(queryText)
      )
      return i.respond(filtered)
    } else {
      return
    }
  }}

  //Respond to non-guild commands
  if (!i.inGuild()) return i.reply("You can only use commands in servers.");

  //Error Messages
  sendError = client.sendError;

  //Grab the command data from the client.commands map
  const cmd = client.commands.get(i.commandName);

  //If that command doesn't exist, return error
  if (!cmd)
    return i.reply(
      "That command doesn't exist!\nTry running the command again later."
    );

    if (!cmd.info.name == "setup") await i.deferReply();

    if (!cmd.requiredPermission == "NONE") {
      if (!i.member.permissionsIn(i.channel).has(cmd.perms.user.perm.toString())) {
        return i.reply(
          "You don't have permission to run this command."
        );
      }
    }
  //Run the command
  try {
    // Add command to the database
    await cmd.run(client, i, client.logError);
  } catch (error) {
  }
};
