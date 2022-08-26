// Discord
const Discord = require("discord.js");

// Util
const { clientLogger } = require("../../util/logger");
const { db } = require("../../util/database/firebase");
var pjson = require("../../package.json");
const util = require("../../util");

// Util
const axios = require("axios");
const robloxClient = require("noblox.js");


function getTestingType(number) {
  if (number == 0) return "In Game";
  if (number == 1) return "Game Link";
}
module.exports.run = async (client, interaction, logError) => {
  const checkUser = await db.has(
    `users/${interaction.guild.ownerId}/robloxId`
)
if (!checkUser) {
    return interaction.reply({
        embeds: [
            getEmbedTemplate(
                client,
                "error",
                "Server owner does not own a Hub whitelist"
            ),
        ],
        ephemeral: true,
    })
}

const userProducts = await db.get(
    `users/${interaction.guild.ownerId}/ownedProducts`
)

if (Array.isArray(userProducts)) {
    const productOwns = userProducts.find(
        (product) => product === "K66nqwUz5QCOGFixQHY_y0up0wYxi-Uz3pw1"
    )

    if (!productOwns) {
        return interaction.reply({
            embeds: [
                getEmbedTemplate(
                    client,
                    "error",
                    "Server owner does not own a Hub Whitelist"
                ),
            ],
            ephemeral: true,
        })
    }
} else {
    return interaction.reply({
        embeds: [
            getEmbedTemplate(
                client,
                "error",
                "Server owner does not own a Hub Whitelist"
            ),
        ],
        ephemeral: true,
    })
}
 try {
   await interaction.deferReply();
        if (!(await db.get(`hubs/${interaction.guild.id}`))) {
          // If the hub already exists in the database send an ephemeral warning
          const embed = util.getEmbedTemplate(
            client,
            "error",
            "Hub not setup"
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        if (interaction.options.getInteger("group-id")) {
          const group = interaction.options.getInteger("group-id");

          robloxClient.getGroup(group).then(async (group) => {
            if (!group) {
              const embed = util.getEmbedTemplate(
                client,
                "error",
                "Group does not exist"
              );
              return interaction.followUp({ embeds: [embed] });
            }

            const row = new Discord.MessageActionRow().addComponents(
              new Discord.MessageButton()
                .setCustomId("confirmGroup")
                .setLabel("It's mine")
                .setStyle("PRIMARY"),
              new Discord.MessageButton()
                .setCustomId("declineGroup")
                .setLabel("Cancel")
                .setStyle("DANGER")
            );

            await axios
              .get(
                `https://thumbnails.roblox.com/v1/groups/icons?group-ids=${group.id}&size=150x150&format=Png&isCircular=false`
              )
              .then(async (res) => {
                const embed = new Discord.MessageEmbed()
                  .setTitle(
                    "Please confirm this is yours"
                  )
                  .addField("Name", group.name, true)
                  .addField("Owner", group.owner.username, true)
                  .setThumbnail(res?.data?.data[0]?.imageUrl || null)
                  .setColor(util.getColor("primary"));
                interaction.followUp({ embeds: [embed], components: [row] });

                const groupButtons = (i) => i.user.id === interaction.user.id;
                const buttonsCollector =
                  interaction.channel.createMessageComponentCollector({
                    groupButtons,
                    max: 1,
                  });

                buttonsCollector.on("collect", async (i) => {
                  if (i.customId === "confirmGroup") {
                    await i.update({
                      components: [],
                    });

                    await db.set(`hubs/${interaction.guild.id}/group`, {
                      id: group.id,
                    });
                  } else if (i.customId === "declineGroup") {
                    const embed = util.getEmbedTemplate(
                      client,
                      "error",
                      "Cancelled"
                    );
                    return i.update({ embeds: [embed], components: [] });
                  }
                });
              })
              .catch((err) => {
                clientLogger.error(err);
                const embed = util.getEmbedTemplate(
                  client,
                  "error",
                  "error!"
                );
                return interaction.followUp({ embeds: [embed] });
              });
          });
        }
        if (interaction.options.getChannel("log-channel")) {
          const channel = interaction.options.getChannel("log-channel");
          if (!channel.isText()) {
            return interaction.followUp({
              embeds: [
                util.getEmbedTemplate(
                  client,
                  "error",
                  "text channel only"
                ),
              ],
            });
          } else {
            try {
              await db.set(`hubs/${interaction.guild.id}/settings`, {
                logChannel: channel.id,
              });
            } catch (e) {
              const embed = util.getEmbedTemplate(
                client,
                "error",
                "Something went wrong! Try again soon or contact support."
              );
              return interaction.followUp({ embeds: [embed] });
            }
          }
        }
        if (interaction.options.getString("description")) {
          if (
            interaction.options.getString("description").length > 400 ||
            interaction.options.getString("description").length < 20
          ) {
            const embed = util.getEmbedTemplate(
              client,
              "error",
              "Description must be less than 400 characters, and more than 20 characters."
            );
            return interaction.followUp({ embeds: [embed] });
          } else {
            try {
              await db.set(`hubs/${interaction.guild.id}/settings`, {
                description: interaction.options.getString("description"),
              });
            } catch (e) {
              const embed = util.getEmbedTemplate(
                client,
                "error",
                "Something went wrong! Try again soon or contact support."
              );
              return interaction.followUp({ embeds: [embed] });
            }
          }
        }
        if (interaction.options.getString("delivery-message")) {
          if (
            interaction.options.getString("delivery-message").length > 400 ||
            interaction.options.getString("delivery-message").length < 10
          ) {
            const embed = util.getEmbedTemplate(
              client,
              "error",
              "Delivery Message must be less than 400 characters, and more than 10 characters."
            );
            return interaction.followUp({ embeds: [embed] });
          } else {
            try {
              await db.set(`hubs/${interaction.guild.id}/settings`, {
                "delivery-message":
                  interaction.options.getString("delivery-message"),
              });
            } catch (e) {
              const embed = util.getEmbedTemplate(
                client,
                "error",
                "Something went wrong! Try again soon or contact support."
              );
              return interaction.followUp({ embeds: [embed] });
            }
          }
        }
        if (interaction.options.getInteger("testing-type")) {
          const testingType = interaction.options.getInteger("testing-type");
          try {
            await db.set(`hubs/${interaction.guild.id}/settings`, {
              testingType: testingType,
            });
          } catch (e) {
            const embed = util.getEmbedTemplate(
              client,
              "error",
              "Something went wrong! Try again soon or contact support."
            );
            return interaction.followUp({ embeds: [embed] });
          }
        }
        if (interaction.options.getRole("purchased-role")) {
          const role = interaction.options.getRole("purchased-role");
          if (!role.editable || role.managed) {
            return interaction.followUp({
              embeds: [
                util.getEmbedTemplate(
                  client,
                  "error",
                  "I do not have access to this role!"
                ),
              ],
            });
          } else {
            try {
              await db.set(`hubs/${interaction.guild.id}/settings`, {
                purchasedRole: role.id,
              });
            } catch (e) {
              const embed = util.getEmbedTemplate(
                client,
                "error",
                "Something went wrong! Try again soon or contact support."
              );
              return interaction.followUp({ embeds: [embed] });
            }
          }
        }
        if (interaction.options.getRole("vefified-role")) {
          const role = interaction.options.getRole("verified-role");
          if (!role.editable || role.managed) {
            return interaction.followUp({
              embeds: [
                util.getEmbedTemplate(
                  client,
                  "error",
                  "I do not have access to this role!"
                ),
              ],
            });
          } else {
            try {
              await db.set(`hubs/${interaction.guild.id}/settings`, {
                verifiedRole: role.id,
              });
            } catch (e) {
              const embed = util.getEmbedTemplate(
                client,
                "error",
                "Something went wrong! Try again soon or contact support."
              );
              return interaction.followUp({ embeds: [embed] });
            }
          }
        }
      } catch (err) {
        clientLogger.error(err);
        const embed = util.getEmbedTemplate(
          client,
          "error",
          "Something went wrong! Try again soon or contact support."
        );
        return interaction.followUp({ embeds: [embed] });
      }
     
    
      return interaction.followUp({
        embeds: [completedSetup],
      });
};

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  name: "confighub",
  description: "Hub config",
options: [
        {
          type: 4,
          name: "group-id",
          description: "Your group's ROBLOX Group ID.",
          required: false,
        },
        {
          type: 3,
          name: "description",
          description: "The description of the hub.",
          required: false,
        },
        {
          type: 8,
          name: "purchased-role",
          description: "Role users will receive on product purchase.",
          required: false,
        },

  ],
};

