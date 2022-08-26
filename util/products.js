const Discord = require('discord.js')
const { s3 } = require('./aws')
const { clientLogger } = require('./logger')
const util = require('./')

/**
 *
 *
 * @param {*} productId Product ID
 * @param {*} userId User ID Of the person that will receive the product
 * @param {*} deliveryType Delivery Type, 1 - Purchased from the hub, 2 - Given by an admin or transfered from another user, 3 - Retrieved with command
 */

const { db } = require('./database/firebase')
const sendProduct = async (productId, userId, deliveryType) => {
  const { dClient } = require('..')

  const product = await db.get(`products/${productId}`)
  if (!product) {
    clientLogger.error('Product not found')
  }

  const user = await db.get(`users/${userId}`)
  if (!user) {
    clientLogger.error('User not found')
  }

  if (!user.robloxId) {
    clientLogger.error('User does not have a ROBLOX account linked')
  }

  // Product Delivery Types
  // 1 - Purchased from the hub
  // 2 - Given by an admin or transfered from another user
  // 3 - Retrieved with command
  // 4 - Gifted to a user

  const deliveryEmbed = new Discord.MessageEmbed().setColor(
    util.getColor("primary")
  )

  if (deliveryType === 1) {
    await db.add(`hubs/${product.hubId}/totalSales`, 1)
    await db.add(
      `hubs/${product.hubId}/sales/${new Date().toISOString().split('T')[0]}`,
      1
    )

    deliveryEmbed
      .setTitle('Purchase Receipt')
      .setDescription(
        `Hey, thanks for buying **${product.name}**. `)
      .addField("Product", product.name, true)
      if (product.description) {
        deliveryEmbed.addField("Description", product.description, true)
      }
      deliveryEmbed.addField("Roblox User Id", user.robloxId.toString(), true)
  } else if (deliveryType === 2) {
    deliveryEmbed
      .setTitle('Purchase Receipt')
      .setDescription(
        `Hey, thanks for buying **${product.name}**`
      )
      .addField("Product", product.name, true)
      if (product.description) {
        deliveryEmbed.addField("Description", product.description, true)
      }
      deliveryEmbed.addField("Roblox User Id", user.robloxId.toString(), true)
      .addField("Price", "Free", true)
  } else if (deliveryType === 3) {
    deliveryEmbed
    .setTitle("Retrieve")
      .setDescription(
        `Hey, You have retrieved **${product.name}**, The product resource is below.`
      )
  }

  const s3Params = {
    Bucket: process.env.S3_BUCKET,
    Key: product.filePath
  }

  const getUser = await dClient.users.fetch(userId)

  if (product.fileType === 1) {
    s3.getObject(s3Params, async (err, data) => {
      if (err) {
        clientLogger.error(err)
      }

      const getUser = await dClient.users.fetch(userId)

      await getUser.send({
        embeds: [deliveryEmbed]
      })

      return getUser
        .send({
          files: [
            { attachment: data.Body, name: product.filePath.split('/').pop() }
          ]
        })
        .then(() => {
          clientLogger.success(
            `Sent product ${product.name} to ${getUser.username} (${getUser.id}) | HUB ID: ${product.hubId}`
          )
        })
        .catch(err => {
          clientLogger.error(err)
        })
    })
  } else if (product.fileType === 2) {
    deliveryEmbed.addField('Product Resource', product.file)
    getUser
      .send({
        embeds: [deliveryEmbed]
      })
      .then(() => {
        clientLogger.success(
          `Sent product ${product.name} to ${getUser.username} (${getUser.id}) | HUB ID: ${product.hubId}`
        )
      })
      .catch(err => {
        clientLogger.error(err)
      })
  } else {
    clientLogger.error('Invalid File Type')
  }
}

module.exports = { sendProduct }
