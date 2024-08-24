"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.inject = exports.name = void 0;
exports.apply = apply;
const koishi_1 = require("koishi");
const model_1 = __importDefault(require("./database/model"));
const tmpQuery_1 = __importDefault(require("./command/tmpQuery"));
const tmpServer_1 = __importDefault(require("./command/tmpServer"));
const tmpBind_1 = __importDefault(require("./command/tmpBind"));
const tmpTraffic_1 = __importDefault(require("./command/tmpTraffic/tmpTraffic"));
const tmpPosition_1 = __importDefault(require("./command/tmpPosition"));
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
        ]).default(2).description('路况信息展示方式'),
    }).description('指令配置'),
]);
function apply(ctx, cfg) {
    // 初始化数据表
    try {
        (0, model_1.default)(ctx);
    }
    catch (error) {
        console.error('初始化数据表失败:', error);
        throw error;
    }
    // 注册指令
    ctx.command('查询 <tmpId>').action(async ({ session }, tmpId) => {
        try {
            return await (0, tmpQuery_1.default)(ctx, cfg, session, tmpId);
        }
        catch (error) {
            console.error('查询失败:', error);
            return '查询失败，请稍后再试。';
        }
    });
    ctx.command('美卡服务器状态查询').action(async () => {
        try {
            return await (0, tmpServer_1.default)(ctx, cfg, 'ATS');
        }
        catch (error) {
            console.error('查询美卡服务器信息失败:', error);
            return '查询失败，请稍后再试。';
        }
    });
    ctx.command('欧卡服务器状态查询').action(async () => {
        try {
            return await (0, tmpServer_1.default)(ctx, cfg, 'ETS2');
        }
        catch (error) {
            console.error('查询欧卡服务器信息失败:', error);
            return '查询失败，请稍后再试。';
        }
    });
    ctx.command('绑定 <tmpId>').action(async ({ session }, tmpId) => {
        try {
            return await (0, tmpBind_1.default)(ctx, cfg, session, tmpId);
        }
        catch (error) {
            console.error('绑定失败:', error);
            return '绑定失败，请稍后再试。';
        }
    });
    ctx.command('路况信息查询 <serverName>').action(async ({ session }, serverName) => {
        try {
            return await (0, tmpTraffic_1.default)(ctx, cfg, serverName);
        }
        catch (error) {
            console.error('交通状况查询失败:', error);
            return '查询失败，请稍后再试。';
        }
    });
    ctx.command('位置信息查询 <tmpId>').action(async ({ session }, tmpId) => {
        try {
            return await (0, tmpPosition_1.default)(ctx, cfg, session, tmpId);
        }
        catch (error) {
            console.error('位置信息查询失败:', error);
            return '查询失败，请稍后再试。';
        }
    });
}
