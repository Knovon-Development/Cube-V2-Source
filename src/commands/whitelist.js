// Discord
const Discord = require('discord.js')
const util = require('../../util')
module.exports.run = async (client, interaction, logError) => {

  const embed = new Discord.MessageEmbed()
    .setTitle('Whitelist Snippet')
    .setDescription(`Your whitelist snippet is available below. **Please remember to fill in the productId and MainModel.**
    
\`\`\`LUA
-- CONFIG BELOW
local MainModel = script
local ProductId  = "" -- Put the Product ID here.
local HubId = "${interaction.guild.id}"
local RunService = game:GetService("RunService")
-- DO NOT TOUCH UNLESS YOU KNOW WHAT YOU'RE DOING
local module = require(9607406165)
function HttpCheck()
  local http = pcall(function()
      game:GetService('HttpService'):GetAsync('http://www.google.com/')
  end)
  return http
end
if RunService:IsStudio() then
  warn("Cube | Our products do not work in studio! This is for security reasons!")
  MainModel:Destroy()
end
if HttpCheck() == false then
  warn("Cube | Please enable HTTP Requests for your Product to work!")
  MainModel:Destroy()
  return
end
local PlaceInfo = game:GetService("MarketplaceService"):GetProductInfo(game.PlaceId)
local gameOwner = nil
if game.CreatorType == Enum.CreatorType.Group then
  gameOwner = game:GetService("GroupService"):GetGroupInfoAsync(PlaceInfo.Creator.CreatorTargetId).Owner.Id
else
  gameOwner = game.CreatorId
end
local isWhitelisted = module.checkWhitelist(gameOwner, HubId, ProductId)
print(isWhitelisted)
if isWhitelisted == false then
  warn("Cube | User does not own Product!")
  MainModel:Destroy()
  return
 end
          
-- Product Code here\`\`\``)
    .setColor(util.getColor("primary"))
  interaction.reply({ embeds: [embed], ephemeral: true })

}

module.exports.requiredPermission = "NONE"

module.exports.info = {
  "name": "whitelist",
  "description": "Access the whitelist snippet.",
}