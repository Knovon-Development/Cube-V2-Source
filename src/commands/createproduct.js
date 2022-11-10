// Discord
const Discord = require("discord.js");

// Util
const { clientLogger } = require("../../util/logger");
const util = require("../../util");
const { db } = require("../../util/database/firebase");
const { s3 } = require("../../util/aws");



function isPositiveInteger(str) {
  if (typeof str !== "string") {
    return false;
  }

  const num = Number(str);

  if (Number.isInteger(num) && num > -2 && num < 101) {
    return true;
  }

  return false;
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
  await interaction.deferReply();
    try {
      // Get the product parameters from the interaction
      const productName = interaction.options.getString("name");

      const checkProduct = await db.get(
        `hubs/${interaction.guild.id}/products`
      );
      if (Array.isArray(checkProduct)) {
        const productExists = checkProduct.find(
          (product) => product.name === productName
        );

        if (productExists) {
          const embed = util.getEmbedTemplate(
            client,
            "error",
            `Product ${productName} already exists!`
          );
          return interaction.followUp({ embeds: [embed], ephemeral: true });
        }
      }
      if (interaction.options.getString("description")) {
        if (
          interaction.options.getString("description").length > 100 ||
          interaction.options.getString("description").length < 5
        ) {
          if (
            (await db.get(`hubs/${interaction.guild.id}`).experimentsEnabled) ==
            true
          ) {
            if (
              interaction.options.getString("description").length > 400 ||
              interaction.options.getString("description").length < 5
            ) {
              const embed = util.getEmbedTemplate(
                client,
                "error",
                "Description must be less than 400 characters, and more than 5 characters."
              );
              return interaction.followUp({ embeds: [embed] });
            }
          } else {
            const embed = util.getEmbedTemplate(
              client,
              "error",
              "Description must be less than 100 characters, and more than 5 characters."
            );
            return interaction.followUp({ embeds: [embed] });
          }
        }
      }

      let stockCount;

      if (interaction.options.getInteger("stock")) {
        stockCount = interaction.options.getInteger("stock");
      }

      let boostEnabled = false;
      let testPlaceId = 0;

      if (interaction.options.getInteger("test-place-id")) {
        testPlaceId = interaction.options.getInteger("test-place-id");
      }

      const filter = (m) => m.author.id === interaction.user.id;

      const productDeveloper =
        interaction.options.getInteger("developer-product");

      const image = interaction.options.getInteger("image");

      const productFileEmbed = new Discord.MessageEmbed()
        .setTitle("Product File")
        .setDescription(
          "Please upload a product file to be sent automatically once the product is purchase!"
        )
        .setColor(util.getColor("primary"));
      interaction.followUp({ embeds: [productFileEmbed] });

      interaction.channel
        .awaitMessages({ filter, max: 1 })
        .then(async (productFile) => {
          if (productFile.first().content.toLowerCase() === "cancel") {
            const cancelEmbed = util.getEmbedTemplate(
              client,
              "error",
              "Cancelled"
            );
            return interaction.followUp({ embeds: [cancelEmbed] });
          } else {
            const file = productFile.first().attachments.first();
            let fileType;

            if (!file) {
              fileType = 2;
            } else {
              fileType = 1;
            }

            const { nanoid } = require("nanoid");

            const productId = nanoid(36);
            const product = {
              id: productId,
              name: util.filterString(productName),
              description: util.filterString(
                interaction.options.getString("description")
              ),
              developerProduct: productDeveloper,
              fileType,
              stock: interaction.options.getInteger("stock") || -1,
              boostEnabled: boostEnabled,
              image: image,
              testingPlaceId: testPlaceId,
            };

            const axios = require("axios");

            if (fileType === 1) {
              let buffer = await axios.get(file.url, {
                responseType: "arraybuffer",
              });

              buffer = Buffer.from(buffer.data);

              s3.upload(
                {
                  Bucket: process.env.S3_BUCKET,
                  Key: `hubs/${
                    interaction.guild.id
                  }/products/${productId}.${file.name.split(".").pop()}`,
                  Body: buffer,
                },
                async (err, data) => {
                  if (err) {
                    clientLogger.error(err);

                    const errorEmbed = util.getEmbedTemplate(
                      client,
                      "error",
                      "Something went wrong while uploading the file, please contact support"
                    );
                    return interaction.followUp({ embeds: [errorEmbed] });
                  }

                  product.file = `${process.env.S3_BUCKET}/hubs/${
                    interaction.guild.id
                  }/products/${productId}.${file.name.split(".").pop()}`;

                  product.filePath = `hubs/${
                    interaction.guild.id
                  }/products/${productId}.${file.name.split(".").pop()}`;

                  await db.push(
                    `hubs/${interaction.guild.id}/products`,
                    product
                  );

                  product.hubPath = `hubs/${interaction.guild.id}/products`;
                  product.hubId = interaction.guild.id;

                  await db.set(`products/${productId}`, product);

                  const embed = util.getEmbedTemplate(
                    client,
                    "success",
                    "Success!",
                    `Product \`${productName}\` has been created! \`${productId}\``
                  );
                  return interaction.followUp({ embeds: [embed] });
                }
              );
            } else if (fileType === 2) {
              const text = (product.file = productFile.first().content);
              if (!text) {
                const embed = util.getEmbedTemplate(
                  client,
                  "error",
                  "Please upload a file or text"
                );
                return interaction.followUp({ embeds: [embed] });
              }

              product.file = text;
              await db.push(`hubs/${interaction.guild.id}/products`, product);

              product.hubPath = `hubs/${interaction.guild.id}/products`;
              product.hubId = interaction.guild.id;

              await db.set(`products/${productId}`, product);
          
              const embed = util.getEmbedTemplate(
                client,
                "success",
                "Product Created",
                `Product \`${productName}\` has been created! \`${productId}\``
              );
              return interaction.followUp({ embeds: [embed] });
            }
          }
        });
    } catch (e) {
      clientLogger.error(e);
      interaction.followUp({
        embeds: [
          util.getEmbedTemplate(
            client,
            "error",
            "Oh no! There has been an error! Please contact support if this issue still persists.",
            interaction
          ),
        ],
      });
  }
};

module.exports.requiredPermission = "ADMINISTRATOR"

module.exports.info = {
  name: "productcreate",
  description: "create a product",
  options: [
     {
          type: 3,
          name: "name",
          description: "The name of the product.",
          required: true,
        },
        {
          type: 3,
          name: "description",
          description: "What is your Hub's Description?",
          required: true,
        },
        {
          type: 4,
          name: "developer-product",
          description: "What is the product's Developer Product ID?",
          required: true,
        },
        {
          type: 4,
          name: "image",
          description: "What is the ROBLOX Image Asset ID?",
        },
        {
          type: 5,
          name: "file",
          description: "The file for the product.",
          required: false,
        },
        {
          type: 4,
          name: "stock",
          description: "How much of the product do you want to sell?",
        },
        {
          type: 4,
          name: "test-place-id",
          description:
            "Testing Place ID to the game. This will only work if the hub is set to game-link.",
          required: false,
    },
  ],
};