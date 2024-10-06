import { Context, Schema } from 'koishi'
import model from './database/model'
import tmpQuery from './command/tmpQuery'
import tmpServer from './command/tmpServer'
import tmpBind from './command/tmpBind'
import tmpTraffic from './command/tmpTraffic/tmpTraffic'
import tmpPosition from './command/tmpPosition'
import axios from 'axios'


export const name = 'tmp-bot'
export const inject = {
  required: ['database'],
  optional: ['puppeteer']
}

export interface Config {
  baiduTranslateEnable: boolean
  baiduTranslateAppId: string
  baiduTranslateKey: string
  baiduTranslateCacheEnable: boolean
  tmpTrafficType: number
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    baiduTranslateEnable: Schema.boolean().default(false).description('启用百度翻译'),
    baiduTranslateAppId: Schema.string().description('百度翻译APP ID'),
    baiduTranslateKey: Schema.string().description('百度翻译秘钥'),
    baiduTranslateCacheEnable: Schema.boolean().default(false).description('启用百度翻译缓存')
  }).description('基本配置'),
  Schema.object({
    tmpTrafficType: Schema.union([
      Schema.const(1).description('文字'),
      Schema.const(2).description('热力图')
    ]).default(2).description('路况信息展示方式'),
  }).description('指令配置'),
])

export function apply(ctx: Context, cfg: Config) {
  try {
    model(ctx)
  } catch (error) {
    console.error('初始化数据表失败:', error)
    throw error
  }

  ctx.command('查询 <tmpId>').action(async ({ session }, tmpId) => {
    try {
      return await tmpQuery(ctx, cfg, session, tmpId)
    } catch (error) {
      console.error('查询失败:', error)
      return '查询失败，请稍后再试。'
    }
  })

  ctx.command('美卡服务器状态查询').action(async () => {
    try {
      return await tmpServer(ctx, cfg, 'ATS')
    } catch (error) {
      console.error('查询美卡服务器信息失败:', error)
      return '查询失败，请稍后再试。'
    }
  })

  ctx.command('欧卡服务器状态查询').action(async () => {
    try {
      return await tmpServer(ctx, cfg, 'ETS2')
    } catch (error) {
      console.error('查询欧卡服务器信息失败:', error)
      return '查询失败，请稍后再试。'
    }
  })

  ctx.command('绑定 <tmpId>').action(async ({ session }, tmpId) => {
    try {
      return await tmpBind(ctx, cfg, session, tmpId)
    } catch (error) {
      console.error('绑定失败:', error)
      return '绑定失败，请稍后再试。'
    }
  })

  ctx.command('路况信息查询 <serverName>').action(async ({ session }, serverName) => {
    try {
      return await tmpTraffic(ctx, cfg, serverName)
    } catch (error) {
      console.error('交通状况查询失败:', error)
      return '查询失败，请稍后再试。'
    }
  })

  ctx.command('位置信息查询 <tmpId>').action(async ({ session }, tmpId) => {
    try {
      return await tmpPosition(ctx, cfg, session, tmpId)
    } catch (error) {
      console.error('位置信息查询失败:', error)
      return '查询失败，请稍后再试。'
    }
  })

  // 新增规则查询命令
  ctx.command('规则查询 [language]').action(async ({ session }, language) => {
    const languageMap = { 
      '英文': 'https://truckersmp.com/rules',
      '中文': 'https://truckersmp.com/knowledge-base/article/746',
      '繁体中文': 'https://truckersmp.com/knowledge-base/article/746',
      '德语': 'https://truckersmp.com/knowledge-base/article/713',
      '法语': 'https://truckersmp.com/knowledge-base/article/744',
      '西班牙语': 'https://truckersmp.com/knowledge-base/article/708',
      '俄语': 'https://truckersmp.com/knowledge-base/article/744',
      '葡萄牙语': 'https://truckersmp.com/knowledge-base/article/706',
      '波兰语': 'https://truckersmp.com/knowledge-base/article/743',
      '阿拉伯语': 'https://truckersmp.com/knowledge-base/article/1647',
      '意大利语': 'https://truckersmp.com/knowledge-base/article/715',
      '捷克语': 'https://truckersmp.com/knowledge-base/article/715',
      '匈牙利语': 'https://truckersmp.com/knowledge-base/article/1145',
      '挪威语': 'https://truckersmp.com/knowledge-base/article/1372',
      '土耳其语': 'https://truckersmp.com/knowledge-base/article/742',
      '罗马利亚语': 'https://truckersmp.com/knowledge-base/article/711',
    }

    if (language && languageMap[language]) {
      return languageMap[language]
    }

    const languageList = Object.keys(languageMap).map((key, index) => `${index + 1}. ${key}`).join('\n')
    await session.send(`请输入要查询的版本（回复序号）：\n${languageList}`)

    const answer = await session.prompt()
    const selectedLanguage = Object.keys(languageMap)[parseInt(answer, 10) - 1]
    if (answer && selectedLanguage) {
      return languageMap[selectedLanguage]
    } else {
      return '无效的序号，请重新查询。'
    }
  })

  ctx.command('价格查询 <gameName>').action(async ({ session }, gameName) => {
    try {
      const encodedGameName = encodeURIComponent(gameName);
      const apiKey = '9471ab85d82abb1675deec688256b4e52dc0b901';
      const apiUrl = `https://api.isthereanydeal.com/v1/game/history/${encodedGameName}?key=${apiKey}`;

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data && data.data) {
        const prices = data.data[gameName].price;
        return `游戏《${gameName}》的历史价格数据：\n${JSON.stringify(prices, null, 2)}`;
      } else {
        return '未找到该游戏的价格数据。';
      }
    } catch (error) {
      console.error('价格查询失败:', error);
      return '价格查询失败，请稍后再试。';
    }
  });

  ctx.command('版本查询').action(async () => {
    try {
        // 获取当前时间并转换为北京时间
        const queryTimeUTC = new Date();
        const queryTimeCST = new Date(queryTimeUTC.getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').replace('Z', ''); // 转换为北京时间并格式化
        
        const response = await axios.get('https://api.truckersmp.com/v2/version');
        const versionInfo = response.data;

        if (versionInfo) {
            // 提取信息
            const time = versionInfo.time;
            const supportedGameVersion = versionInfo.supported_game_version;
            const supportedAtsGameVersion = versionInfo.supported_ats_game_version;

            // 格式化返回信息
            const versionMessage = `
查询命令发出北京时间：${queryTimeCST} 
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
});



}
