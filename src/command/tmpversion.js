const axios = require('axios');

async function getVersion() {
  try {
    const response = await axios.get('https://api.truckersmp.com/v2/version');
    const versionInfo = response.data;

    if (versionInfo) {
      // 提取信息
      const time = versionInfo.time;
      const supportedGameVersion = versionInfo.supported_game_version;
      const supportedAtsGameVersion = versionInfo.supported_ats_game_version;

      // 格式化返回信息
      const versionMessage = `
        版本更新UTC时间：${time}
        支持的欧卡版本：${supportedGameVersion}
        支持的美卡版本：${supportedAtsGameVersion}
      `;
      return versionMessage.trim(); // 去除多余空白
    } else {
      return '未找到版本信息。';
    }
  } catch (error) {
    console.error('版本查询失败:', error);
    return '版本查询失败，版本正在更新。';
  }
}

module.exports = getVersion;
