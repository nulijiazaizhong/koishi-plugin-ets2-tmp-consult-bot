const BASE_API = 'https://tracker.ets2map.com';

module.exports = {
  /**
   * 区域查询玩家
   */
  async area(http, serverId, x1, y1, x2, y2) {
    try {
      const result = await http.get(`${BASE_API}/v3/area?x1=${x1}&y1=${y1}&x2=${x2}&y2=${y2}&server=${serverId}`);
      return {
        error: false,
        data: result.Success ? result.Data : null
      };
    } catch (error) {
      return {
        error: true,
        message: error.message // 增加错误信息
      };
    }
  }
};
