// Discord
const Discord = require("discord.js");

// Util
const { clientLogger } = require("../../util/logger");
const { db } = require("../../util/database/firebase");
const { dClient } = require("../..");

const util = require("../../util");
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
                "The server owner doesn't own the hub!"
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
                    "The server owner doesn't own the hub!"
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
                "The server owner doesn't own the hub!"
            ),
        ],
        ephemeral: true,
    })
}
  try {

    await interaction.deferReply();

    const productToAnnounce = interaction.options.getString("product");
    let messageToAnnounce = interaction.options.getString("message");

    const checkProduct = await db.get(`hubs/${interaction.guild.id}/products`);
    if (Array.isArray(checkProduct)) {
      const productExists = checkProduct.find(
        (product) => product.name === productToAnnounce
      );

      if (!productExists) {
        const embed = util.getEmbedTemplate(
          client,
          "error",
          "product deosnt exist"
        );
        return interaction.followUp({ embeds: [embed], ephemeral: true });
      }

      const users = await db.get("users");
      const usersToAnnounce = Object.keys(users).filter((user) => {
        const ownedProducts = users[user].ownedProducts;

        if (Array.isArray(ownedProducts)) {
          return users[user].ownedProducts.includes(productExists.id);
        } else {
          return false;
        }
      });

      if (usersToAnnounce.length === 0) {
        const embed = util.getEmbedTemplate(
          client,
          "error",
          "no one owns this :("
        );
        return interaction.followUp({ embeds: [embed], ephemeral: true });
      }

      messageToAnnounce = util.filterString(messageToAnnounce);

      usersToAnnounce.forEach(async (user) => {
        const userToAnnounce = await dClient.users.fetch(user);
        const announcementEmbed = new Discord.MessageEmbed()
          .setTitle("Product Announcement")
          .setDescription(
            `Howdy, ${userToAnnounce.username}! \nwe have an announcement for you`
          )
          .addField("Message", messageToAnnounce, false)
          .addField("Product", productExists.name, true)
          .addField("Server", interaction.guild.name, true)
          .setThumbnail(
            "https://media.discordapp.net/attachments/995493103039414312/1026406146807975987/326031.png"
          )
          .setColor(util.getColor("primary"))
          .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL(),
          });

        userToAnnounce.send({
          embeds: [announcementEmbed],
        });
      });
      
      const embed = util.getEmbedTemplate(
        client,
        "success",
        "Announcement Sent",
        `The announcement has been sent to ${usersToAnnounce.length} users! Some DMs were closed though.`
      );
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      const embed = util.getEmbedTemplate(
        client,
        "error",
        "The product you are trying to create an announcement for does not exist!"
      );
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  } catch (e) {
    clientLogger.error(e);
    interaction.followUp({
      embeds: [
        util.getEmbedTemplate(
          client,
          "error",
          "There has  been an error! Please contact support if the issue persists."
        ),
      ],
    });
  }
};

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  name: "announce",
  description: "Sends a message to users that own the provided product.",
  options: [
    {
      type: 3,
      name: "product",
      description: "Product Name",
      required: true,
      autocomplete: true,
    },
    {
      type: 3,
      name: "message",
      description:
        "Message to send in the announcement. (1024 characters max.)",
      required: true,
    },
  ],
}