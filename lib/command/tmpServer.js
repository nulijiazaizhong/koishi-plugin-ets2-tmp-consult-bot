const truckersMpApi = require('../api/truckersMpApi')

module.exports = async (ctx, cfg, game) => {
  try {
    // 查询服务器信息
    const serverData = await truckersMpApi.servers(ctx.http)
    if (serverData.error) {
      return '查询服务器失败，请稍后重试'
    }

    // 过滤服务器
    const etsServerList = serverData.data.filter(server => server.game === game)

    // 构建消息
    return etsServerList.reduce((message, server) => {
      // 如果前面有内容，换行
      if (message) {
        message += '\n\n'
      }

      message += `服务器: ${server.online ? '🟢' : '⚫'}${server.name}`
      message += `\n玩家人数: ${server.players}/${server.maxplayers}`
      if (server.queue) {
        message += ` (队列: ${server.queue})`
      }
      // 服务器特性
      const characteristicList = []
      if (!server.afkenabled) {
        characteristicList.push('⏱挂机')
      }
      if (server.collisions) {
        characteristicList.push('💥碰撞')
      }
      if (characteristicList.length > 0) {
        message += `\n服务器特性: ${characteristicList.join(' ')}`
      }
      return message
    }, '')
  } catch (error) {
    console.error('查询服务器时发生错误:', error)
    return '查询服务器失败，请稍后重试'
  }
}
