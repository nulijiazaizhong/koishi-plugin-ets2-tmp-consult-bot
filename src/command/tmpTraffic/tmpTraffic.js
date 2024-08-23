const tmpTrafficMap = require("./tmpTrafficMap");
const tmpTrafficText = require("./tmpTrafficText");

/**
 * 查询路况
 */
module.exports = async (ctx, cfg, serverName) => {
  try {
    switch (cfg.tmpTrafficType) {
      case 1:
        return await tmpTrafficText(ctx, cfg, serverName);
      case 2:
        return await tmpTrafficMap(ctx, cfg, serverName);
      default:
        return '指令配置错误';
    }
  } catch (error) {
    console.error('查询路况时发生错误:', error);
    return '查询路况失败，请稍后再试';
  }
};
