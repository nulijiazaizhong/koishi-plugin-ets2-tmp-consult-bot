const BASE_API_V3 = 'https://api.truckyapp.com/v3';
const BASE_API_V2 = 'https://api.truckyapp.com/v2';

module.exports = {
  /**
   * 查询线上信息
   */
  async online(http, tmpId) {
    try {
      const result = await http.get(`${BASE_API_V3}/map/online?playerID=${tmpId}`);
      if (!result || !result.response || result.response.error) {
        return { error: true };
      }
      return { error: false, data: result.response };
    } catch (e) {
      return { error: true };
    }
  },
  /**
   * 查询热门交通数据
   */
  async trafficTop(http, serverName) {
    try {
      const result = await http.get(`${BASE_API_V2}/traffic/top?game=ets2&server=${serverName}`);
      if (!result || !result.response || result.response.length <= 0) {
        return { error: true };
      }
      return { error: false, data: result.response };
    } catch (e) {
      return { error: true };
    }
  }
};
