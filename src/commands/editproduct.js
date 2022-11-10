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
      const productToEdit = interaction.options.getString("name");
      let updated = false;
      const checkProduct = await db.get(
        `hubs/${interaction.guild.id}/products`
      );
      if (Array.isArray(checkProduct)) {
        const productExists = checkProduct.find(
          (product) => product.name === productToEdit
        );

        if (!productExists) {
          return interaction.followUp({
            embeds: [
              util.getEmbedTemplate(
                client,
                "error",
                "We've searched our database and swept the cornors and still couldn't find your product."
              ),
            ],
            ephemeral: true,
          });
        }

        if (interaction.options.getBoolean("file") == true) {
          updated = true;
          const productFileEmbed = new Discord.MessageEmbed()
            .setTitle("Product File")
            .setDescription(
              "Please upload the Product File, Text or URL that you want to deliver when a product is bought"
            )
            .setColor(util.getColor("primary"));
          interaction.followUp({ embeds: [productFileEmbed] });
          const filter = (m) => m.author.id === interaction.user.id;
          interaction.channel
            .awaitMessages({ filter, max: 1 })
            .then(async (productFile) => {
              if (productFile.first().content.toLowerCase() === "cancel") {
                const cancelEmbed = util.getEmbedTemplate(
                  client,
                  "error",
                  "Product Update has been cancelled."
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

                const productId = productExists.id;

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

                        return interaction.followUp({
                          embeds: [
                            util.getEmbedTemplate(
                              client,
                              "error",
                              "Something went wrong while uploading the file, please contact support"
                            ),
                          ],
                        });
                      }

                      const newArray = checkProduct.map((product) =>
                        product.id === productId
                          ? {
                              ...product,
                              file: `hubs/${
                                interaction.guild.id
                              }/products/${productId}.${file.name
                                .split(".")
                                .pop()}`,
                              filePath: `hubs/${
                                interaction.guild.id
                              }/products/${productId}.${file.name
                                .split(".")
                                .pop()}`,
                              fileType,
                            }
                          : product
                      );

                      await db.set(
                        `hubs/${interaction.guild.id}/products`,
                        newArray
                      );

                      await db.set(
                        `products/${productId}/hubPath`,
                        `hubs/${interaction.guild.id}/products`
                      );

                      await db.set(
                        `products/${productId}/hubId`,
                        interaction.guild.id
                      );

                      await db.set(
                        `products/${productId}/file`,
                        `hubs/${
                          interaction.guild.id
                        }/products/${productId}.${file.name.split(".").pop()}`
                      );

                      await db.set(
                        `products/${productId}/filePath`,
                        `hubs/${
                          interaction.guild.id
                        }/products/${productId}.${file.name.split(".").pop()}`
                      );
                    }
                  );
                } else if (fileType === 2) {
                  const text = productFile.first().content;
                  if (!text) {
                    return interaction.followUp({
                      embeds: [
                        util.getEmbedTemplate(
                          client,
                          "error",
                          "Please upload a file or text"
                        ),
                      ],
                    });
                  }

                  await db.set(`products/${productId}/fileType`, fileType);

                  await db.set(
                    `products/${productId}/hubPath`,
                    `hubs/${interaction.guild.id}/products`
                  );

                  await db.set(
                    `products/${productId}/hubId`,
                    interaction.guild.id
                  );

                  await db.set(`products/${productId}/file`, text);
                  await db.delete(`products/${productId}/filePath`);

                  const newArray = checkProduct.map((product) =>
                    product.id === productId
                      ? {
                          ...product,
                          file: text,
                          fileType,
                          filePath: null,
                        }
                      : product
                  );

                  await db.set(
                    `hubs/${interaction.guild.id}/products`,
                    newArray
                  );
                }
              }
            });
        }
        if (interaction.options.getInteger("test-place-id")) {
          updated = true;
          const checkProduct = await db.get(
            `hubs/${interaction.guild.id}/products`
          );
          const newArray = checkProduct.map((product) =>
            product.id === productExists.id
              ? {
                  ...product,
                  testingPlaceId:
                    interaction.options.getInteger("test-place-id"),
                }
              : product
          );
          await db.set(`hubs/${interaction.guild.id}/products`, newArray);
          await db.set(
            `products/${productExists.id}/developerProduct`,
            interaction.options.getInteger("test-place-id")
          );
        }
        if (interaction.options.getInteger("developer-product")) {
          updated = true;
          const productDeveloper =
            interaction.options.getInteger("developer-product");
          if (isNaN(productDeveloper) || productDeveloper.length < 6) {
            const embed = util
              .getEmbedTemplate(
                client,
                "error",
                "Product Developer ID must be a number and at least 6 digits long"
              )
              .setColor(util.getColor("primary"))
              .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL(),
              });
            return interaction.followUp({ embeds: [embed] });
          }

          const checkProduct = await db.get(
            `hubs/${interaction.guild.id}/products`
          );
          const newArray = checkProduct.map((product) =>
            product.id === productExists.id
              ? {
                  ...product,
                  developerProduct: productDeveloper,
                }
              : product
          );

          await db.set(`hubs/${interaction.guild.id}/products`, newArray);
          await db.set(
            `products/${productExists.id}/developerProduct`,
            productDeveloper
          );
        }

        if (interaction.options.getInteger("image")) {
          updated = true;
          const productDeveloper = interaction.options.getInteger("image");
          if (isNaN(productDeveloper) || productDeveloper.length < 6) {
            const embed = util
              .getEmbedTemplate(
                client,
                "error",
                "Image ID must be a number and at least 6 digits long"
              )
              .setColor(util.getColor("primary"))
              .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL(),
              });
            return interaction.followUp({ embeds: [embed] });
          }

          const checkProduct = await db.get(
            `hubs/${interaction.guild.id}/products`
          );
          const newArray = checkProduct.map((product) =>
            product.id === productExists.id
              ? {
                  ...product,
                  image: productDeveloper,
                }
              : product
          );

          await db.set(`hubs/${interaction.guild.id}/products`, newArray);
          await db.set(`products/${productExists.id}/image`, productDeveloper);
        }

        if (interaction.options.getInteger("stock")) {
          updated = true;
          let stockCount = interaction.options.getInteger("stock");

          const checkProduct = await db.get(
            `hubs/${interaction.guild.id}/products`
          );
          const newArray = checkProduct.map((product) =>
            product.id === productExists.id
              ? {
                  ...product,
                  stock: parseInt(stockCount),
                }
              : product
          );

          await db.set(`hubs/${interaction.guild.id}/products`, newArray);
          await db.set(
            `products/${productExists.id}/stock`,
            parseInt(stockCount)
          );
        }
      
        if (interaction.options.getString("description")) {
          updated = true;
          if (
            interaction.options.getString("description").length > 100 ||
            interaction.options.getString("description").length < 5
          ) {
            return interaction.followUp({
              embeds: [
                util.getEmbedTemplate(
                  client,
                  "error",
                  "Description must be less than 100 characters, and more than 5 characters."
                ),
              ],
            });
          }

          const checkProduct = await db.get(
            `hubs/${interaction.guild.id}/products`
          );
          const newArray = checkProduct.map((product) =>
            product.id === productExists.id
              ? {
                  ...product,
                  description: interaction.options.getString("description"),
                }
              : product
          );

          await db.set(`hubs/${interaction.guild.id}/products`, newArray);
          await db.set(
            `products/${productExists.id}/description`,
            interaction.options.getString("description")
          );
        }

        if (!interaction.options) {
          return interaction.followUp({
            embeds: [
              util.getEmbedTemplate(
                client,
                "error",
                "You did not choose an option to update!"
              ),
            ],
          });
        }
        interaction.followUp({
          embeds: [
            util.getEmbedTemplate(
              client,
              "success",
              "Product Updated!",
              `${productToEdit} has been successfuly updated. (If you are updating the file upload a file it will automatically be updated!)`
            ),
          ],
        });
      } else {
        return interaction.followUp({
          embeds: [
            util.getEmbedTemplate(
              client,
              "error",
              "There are no products to update, start developing!"
            ),
          ],
          ephemeral: true,
        });
      }
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
  "name": "productedit",
  "description": "product configuration",
  "options": [
            {
              type: 3,
              name: "name",
              description: "Name of the product you want to update.",
              required: true,
              autocomplete: true,
            },
            {
              type: 3,
              name: "description",
              description: "What is your Hub's Description?",
              required: false,
            },
            {
              type: 4,
              name: "stock",
              description: "How much of the product do you want to sell?",
            },
            {
              type: 4,
              name: "developer-product",
              description: "What is the product's Developer Product ID?",
            },
            {
              type: 4,
              name: "image",
              description: "What is the ROBLOX Image Asset ID?",
            },
            {
              type: 5,
              name: "file",
              description: "Do you want to update the file?",
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

