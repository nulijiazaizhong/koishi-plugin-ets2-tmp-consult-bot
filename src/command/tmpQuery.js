const dayjs = require('dayjs')
const guildBind = require('../database/guildBind')
const truckersMpApi = require('../api/truckersMpApi')
const truckyAppApi = require('../api/truckyAppApi')
const baiduTranslate = require('../util/baiduTranslate')

/**
 * 用户组
 */
const userGroup = {
  'Player': '玩家',
  'Retired Legend': '退役',
  'Game Developer': '游戏开发者',
  'Retired Team Member': '退休团队成员',
  'Add-On Team': 'Add-On Team',
  'Game Moderator': 'Game Moderator'
}

/**
 * 查询玩家信息
 */
module.exports = async (ctx, cfg, session, tmpId) => {
  if (tmpId && isNaN(tmpId)) {
    return `请输入正确的玩家编号`
  }

  // 如果没有传入tmpId，尝试从数据库查询绑定信息
  if (!tmpId) {
    let guildBindData = await guildBind.get(ctx.database, session.platform, session.userId)
    if (!guildBindData) {
      return `请输入正确的玩家编号`
    }
    tmpId = guildBindData.tmp_id
  }

  // 查询玩家信息
  let playerInfo = await truckersMpApi.player(ctx.http, tmpId)
  if (playerInfo.error) {
    return '查询玩家信息失败，请重试'
  }

  // 查询线上信息
  let playerMapInfo = await truckyAppApi.online(ctx.http, tmpId)
  if (playerMapInfo.error) {
    return '查询玩家信息失败，请重试'
  }

  // 拼接消息模板
  let message = `<img src="${playerInfo.data.avatar}"/>`
  message += '\n😀玩家名称: ' + playerInfo.data.name
  message += '\n📑注册日期: ' + dayjs(playerInfo.data.joinDate + 'Z').format('YYYY年MM月DD日')
  message += '\n💼所属分组: ' + (userGroup[playerInfo.data.groupName] || playerInfo.data.groupName) // 🪪💼📂🚹
  if (playerInfo.data.vtc && playerInfo.data.vtc.inVTC) {
    message += '\n🚚所属车队: ' + playerInfo.data.vtc.name
  }
  message += '\n🚫是否封禁: ' + (playerInfo.data.banned ? '是' : '否')
  if (playerInfo.data.banned) {
    message += '\n🚫封禁截止: '
    if (!playerInfo.data.displayBans) {
      message += '隐藏'
    } else {
      let banData = await truckersMpApi.bans(ctx.http, tmpId)
      if (!banData.error) {
        let ban = banData.data[0]
        if (!ban.expiration) {
          message += '永久'
        } else {
          message += dayjs(ban.expiration + 'Z').format('YYYY年MM月DD日 HH:mm')
        }
        message += "\n🚫封禁原因: " + await baiduTranslate(ctx, cfg, ban.reason, false)
      } else {
        message += '查询失败'
      }
    }
  }
  message += '\n🚫封禁次数: ' + playerInfo.data.bansCount || 0
  message += '\n📶在线状态: ' + (playerMapInfo.data.online ? `在线🟢 (${playerMapInfo.data.serverDetails.name})` : '离线⚫')
  if (playerMapInfo.data.online) {
    message += '\n🌍线上位置: '
    message += await baiduTranslate(ctx, cfg, playerMapInfo.data.location.poi.country)
    message += ' - '
    message += await baiduTranslate(ctx, cfg, playerMapInfo.data.location.poi.realName)
  }

  // 添加Patreon信息
  if (playerInfo.data.patreon && playerInfo.data.patreon.isPatron) {
    message += '\n🌟Patreon支持者: 是'
<<<<<<<<< Temporary merge branch 1
    message += '\n💰当前赞助金额: ' + (playerInfo.data.patreon.currentPledge ? (playerInfo.data.patreon.currentPledge / 100) : 0)
    message += '\n💰全部赞助金额: ' + (playerInfo.data.patreon.lifetimePledge / 100)
=========
    message += '\n💰当前赞助金额: ' + (playerInfo.data.patreon.currentPledge ? (playerInfo.data.patreon.currentPledge / 100) : 0) + '美元'
    message += '\n💰全部赞助金额: ' + (playerInfo.data.patreon.lifetimePledge / 100) + '美元'
>>>>>>>>> Temporary merge branch 2
  } else {
    message += '\n🌟Patreon支持者: 否'
  }

  // 添加历史VTC信息
  if (playerInfo.data.vtcHistory && playerInfo.data.vtcHistory.length > 0) {
    message += '\n📜历史车队:'
    playerInfo.data.vtcHistory.forEach(vtc => {
      message += `\n- ${vtc.name} (加入日期: ${dayjs(vtc.joinDate).format('YYYY年MM月DD日')}, 离开日期: ${dayjs(vtc.leftDate).format('YYYY年MM月DD日')})`
    })
  }

  return message
}
