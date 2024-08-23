const BASE_API = 'https://api.truckersmp.com/v2';

module.exports = {
  /**
   * 查询玩家信息
   */
  async player(http, tmpId) {
    return this.fetchData(http, `player/${tmpId}`);
  },
  /**
   * 查询服务器列表
   */
  async servers(http) {
    return this.fetchData(http, 'servers');
  },
  /**
   * 查询玩家封禁信息
   */
  async bans(http, tmpId) {
    return this.fetchData(http, `bans/${tmpId}`);
  },
  /**
   * 通用数据获取方法
   */
  async fetchData(http, endpoint) {
    try {
      const result = await http.get(`${BASE_API}/${endpoint}`);
      return {
        error: false,
        data: result.response
      };
    } catch (error) {
      return {
        error: true,
        message: error.message
      };
    }
  }
};
