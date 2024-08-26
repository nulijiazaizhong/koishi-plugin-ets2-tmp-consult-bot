const dayjs = require('dayjs')
const guildBind = require('../database/guildBind')
const truckersMpApi = require('../api/truckersMpApi')
const truckyAppApi = require('../api/truckyAppApi')
const baiduTranslate = require('../util/baiduTranslate')
const { segment } = require('koishi')

const userGroup = {
  'Player': '玩家',
  'Retired Legend': '退役',
  'Game Developer': '游戏开发者',
  'Retired Team Member': '退休团队成员',
  'Add-On Team': 'Add-On Team',
  'Game Moderator': 'Game Moderator'
}

module.exports = async (ctx, cfg, session, tempPlayerId) => {
  if (tempPlayerId && isNaN(tempPlayerId)) {
    return `请输入正确的玩家编号`
  }

  if (!tempPlayerId) {
    const guildBindData = await guildBind.get(ctx.database, session.platform, session.userId)
    if (!guildBindData) {
      return `请输入正确的玩家编号`
    }
    tempPlayerId = guildBindData.tmp_id
  }

  const playerInfo = await truckersMpApi.player(ctx.http, tempPlayerId)
  if (playerInfo.error) {
    return '查询玩家信息失败，请重试'
  }

  const playerMapInfo = await truckyAppApi.online(ctx.http, tempPlayerId)
  if (playerMapInfo.error) {
    return '查询玩家信息失败，请重试'
  }

  let message = `<img src="${playerInfo.data.avatar}"/>
😀玩家名称: ${playerInfo.data.name}
📑注册日期: ${dayjs(playerInfo.data.joinDate + 'Z').format('YYYY年MM月DD日')}
💼所属分组: ${userGroup[playerInfo.data.groupName] || playerInfo.data.groupName}
📶在线状态: ${playerMapInfo.data.online ? `在线🟢 (${playerMapInfo.data.serverDetails.name})` : '离线⚫'}
${playerMapInfo.data.online ? `🌍线上位置: ${await baiduTranslate(ctx, cfg, playerMapInfo.data.location.poi.country)} - ${await baiduTranslate(ctx, cfg, playerMapInfo.data.location.poi.realName)}` : ''}

🚫是否封禁: ${playerInfo.data.banned ? '是' : '否'}
🚫封禁次数: ${playerInfo.data.bansCount ?? 0}
${playerInfo.data.banned ? `🚫封禁截止: ${!playerInfo.data.displayBans ? '隐藏' : await getBanInfo(ctx, cfg, tempPlayerId)}` : ''}
${playerInfo.data.vtc && playerInfo.data.vtc.inVTC ? `🚚所属车队: ${playerInfo.data.vtc.name}` : '🚚所属车队: 无'}
${playerInfo.data.vtcHistory && playerInfo.data.vtcHistory.length > 0 ? `
📜历史车队:
${playerInfo.data.vtcHistory.map(vtc => `- ${vtc.name} (加入日期: ${dayjs(vtc.joinDate).format('YYYY年MM月DD日')}, 离开日期: ${dayjs(vtc.leftDate).format('YYYY年MM月DD日')})`).join('\n')}` : '📜历史车队: 无'}

${playerInfo.data.patreon && playerInfo.data.patreon.isPatron ? `
🌟Patreon支持者: 是
💰当前赞助金额: ${(playerInfo.data.patreon.currentPledge ? (playerInfo.data.patreon.currentPledge / 100) : 0)}美元
💰全部赞助金额: ${(playerInfo.data.patreon.lifetimePledge / 100)}美元` : '🌟Patreon支持者: 否'}
`
  return message
}

async function getBanInfo(ctx, cfg, tempPlayerId) {
  const banData = await truckersMpApi.bans(ctx.http, tempPlayerId)
  if (banData.error) {
    return '查询失败'
  }
  const ban = banData.data[0]
  if (!ban.expiration) {
    return '永久'
  }
  const expirationDate = dayjs(ban.expiration + 'Z').format('YYYY年MM月DD日 HH:mm')
  const reason = await baiduTranslate(ctx, cfg, ban.reason, false)
  return `${expirationDate}\n🚫封禁原因: ${reason}`
}
