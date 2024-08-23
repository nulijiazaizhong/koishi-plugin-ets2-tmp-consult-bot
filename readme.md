# 欧洲卡车模拟2 TMP查询机器人

[![npm](https://img.shields.io/npm/v/koishi-plugin-ets2-tmp-consult-bot?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-ets2-tmp-consult-bot)

---
## 指令说明
| 指令名称           | 指令介绍                                                                                                                                                                                   | 使用示例            |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|
| 绑定               | 绑定 TMPID，绑定后使用其他指令时可省略输入                                                                                                                                                  | 绑定 123            |
| 查询               | 查询TMP玩家信息                                                                                                                                                                           | 查询 123            |
| 查询位置信息       | 查询玩家位置信息                                                                                                                                                                           | 查询位置信息 123     |
| 查询交通           | 查询服务器热门地点路况信息，仅支持使用服务器简称查询，具体支持查询的服务器和服务器简称信息如下</br>Simulation 1 (简称: s1)</br>Simulation 2 (简称: s2)</br>ProMods (简称: p)</br>Arcade  (简称: a) | 查询交通 s1          |
| 查询美卡服务器信息  | 查询美卡服务器信息列表                                                                                                                                                                     | 查询美卡服务器信息    |
| 查询欧卡服务器信息  | 查询欧卡服务器信息列表                                                                                                                                                                     | 查询欧卡服务器信息    |


另外非常感谢非常感谢 [79887143](https://github.com/79887143)提供的api接口，和思路
>[79887143的koishi-plugin-tmp-bot](https://github.com/79887143/koishi-plugin-tmp-bot?tab=readme-ov-file#koishi-plugin-tmp-bot)

另外非常感谢非常感谢 [79887143](https://github.com/79887143)提供的api接口，和思路
>[79887143的koishi-plugin-tmp-bot](https://github.com/79887143/koishi-plugin-tmp-bot?tab=readme-ov-file#koishi-plugin-tmp-bot)

### 更新日志
- 2024-08-23: 查询指令新增输出Patreon订阅信息
- 2024-08-24: 查询指令新增输出历史VTC信息