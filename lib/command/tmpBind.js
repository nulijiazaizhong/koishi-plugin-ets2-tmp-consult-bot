const guildBind = require('../database/guildBind');
const truckersMpApi = require("../api/truckersMpApi");

/**
 * 绑定 TMP ID
 */
module.exports = async (ctx, cfg, session, tmpId) => {
  if (!tmpId || isNaN(tmpId)) {
    return '请输入正确的玩家编号';
  }

  try {
    // 查询玩家信息
    const playerInfo = await truckersMpApi.player(ctx.http, tmpId);
    if (playerInfo.error) {
      return '绑定失败 (查询玩家信息失败)';
    }

    // 更新数据库
    await guildBind.saveOrUpdate(ctx.database, session.platform, session.userId, session.author.username, tmpId);

    return `绑定成功 ( ${playerInfo.data.name} )`;
  } catch (error) {
    console.error('绑定过程中发生错误:', error);
    return '绑定失败 (发生未知错误)';
  }
};
