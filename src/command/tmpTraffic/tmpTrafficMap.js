const truckyAppApi = require('../../api/truckyAppApi')
const truckersMpMapApi = require('../../api/truckersMpMapApi')
const baiduTranslate = require('../../util/baiduTranslate')
const {resolve} = require("path");
const common = require("../../util/common");
const {segment} = require("koishi");

/**
 * 服务器别名
 */
const serverAlias = {
  's1': { name: 'sim1', mapType: 'ets', serverId: 2, bounds: [[-94189, 93775], [79264, -78999]] },
  's2': { name: 'sim2', mapType: 'ets', serverId: 41, bounds: [[-94189, 93775], [79264, -78999]] },
  'p': { name: 'eupromods1', mapType: 'promods', serverId: 50, bounds: [[-96355, 16381], [205581, -70750]] },
  'a': { name: 'arc1', mapType: 'ets', serverId: 7, bounds: [[-94189, 93775], [79264, -78999]] }
}

/**
 * 路况程度转中文
 */
const severityToZh = {
  'Fluid': { text: '畅通', color: '#00d26a' },
  'Moderate': { text: '正常', color: '#ff6723' },
  'Congested': { text: '缓慢', color: '#f8312f' },
  'Heavy': { text: '拥堵', color: '#8d67c5' }
}

/**
 * 位置类型转中文
 */
const typeToZh = {
  'City': '城市',
  'Road': '公路',
  'Intersection': '十字路口'
}

/**
 * 查询路况
 */
module.exports = async (ctx, cfg, serverName) => {
  if (!ctx.puppeteer) return '未启用 puppeteer 服务'

  const serverInfo = serverAlias[serverName]
  if (!serverInfo) return '请输入正确的服务器名称 (s1, s2, p, a)'

  try {
    const trafficData = await truckyAppApi.trafficTop(ctx.http, serverInfo.name)
    if (trafficData.error) return '查询路况信息失败'

    const mapData = await truckersMpMapApi.area(ctx.http, serverInfo.serverId, ...serverInfo.bounds.flat())

    const data = {
      mapType: serverInfo.mapType,
      queryTime: new Date().toLocaleString(), // 添加查询时间
      trafficList: await Promise.all(trafficData.data.map(async traffic => ({
        country: await baiduTranslate(ctx, cfg, traffic.country),
        province: await baiduTranslate(ctx, cfg, traffic.name.substring(0, traffic.name.lastIndexOf('(') - 1)),
        playerCount: traffic.players,
        severity: severityToZh[traffic.newSeverity] || { text: '未知', color: '#ffffff' }
      }))),
      playerCoordinateList: mapData.error || !mapData.data ? [] : mapData.data.map(item => [item.X, item.Y])
    }

    const page = await ctx.puppeteer.page()
    try {
      await page.setViewport({ width: 1000, height: 1000 })
      await page.goto(`file:///${resolve(__dirname, '../../resource/traffic.html')}`)
      await page.evaluate(`setData(${JSON.stringify(data)})`)
      await common.sleep(100)
      await page.waitForNetworkIdle()
      const element = await page.$("#container")
      return segment.image(await element.screenshot({ encoding: "binary" }), "image/jpg")
    } finally {
      await page.close()
    }
  } catch (e) {
    console.error(e)
    return '渲染异常，请重试'
  }
}
