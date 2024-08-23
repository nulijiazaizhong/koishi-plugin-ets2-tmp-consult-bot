"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.Config = exports.inject = exports.name = void 0;
const koishi_1 = require("koishi");
const model = require('./database/model');
const tmpQuery = require('./command/tmpQuery');
const tmpServer = require('./command/tmpServer');
const tmpBind = require('./command/tmpBind');
const tmpTraffic = require('./command/tmpTraffic/tmpTraffic');
const tmpPosition = require('./command/tmpPosition');
exports.name = 'tmp-bot';
exports.inject = {
    required: ['database'],
    optional: ['puppeteer']
};
exports.Config = koishi_1.Schema.intersect([
    koishi_1.Schema.object({
        baiduTranslateEnable: koishi_1.Schema.boolean().default(false).description('启用百度翻译'),
        baiduTranslateAppId: koishi_1.Schema.string().description('百度翻译APP ID'),
        baiduTranslateKey: koishi_1.Schema.string().description('百度翻译秘钥'),
        baiduTranslateCacheEnable: koishi_1.Schema.boolean().default(false).description('启用百度翻译缓存')
    }).description('基本配置'),
    koishi_1.Schema.object({
        tmpTrafficType: koishi_1.Schema.union([
            koishi_1.Schema.const(1).description('文字'),
            koishi_1.Schema.const(2).description('热力图')
        ]).default(1).description('路况信息展示方式'),
    }).description('指令配置'),
]);
function apply(ctx, cfg) {
    // 初始化数据表
    model(ctx);
    // 注册指令
    ctx.command('查询 <tmpId>').action(async ({ session }, tmpId) => await tmpQuery(ctx, cfg, session, tmpId));
    ctx.command('查询美卡服务器信息').action(async () => await tmpServer(ctx, cfg, 'ATS'));
    ctx.command('查询欧卡服务器信息').action(async () => await tmpServer(ctx, cfg, 'ETS2'));
    ctx.command('绑定 <tmpId>').action(async ({ session }, tmpId) => await tmpBind(ctx, cfg, session, tmpId));
    ctx.command('查询交通 <serverName>').action(async ({ session }, serverName) => await tmpTraffic(ctx, cfg, serverName));
    ctx.command('查询位置信息 <tmpId>').action(async ({ session }, tmpId) => await tmpPosition(ctx, cfg, session, tmpId));
}
exports.apply = apply;