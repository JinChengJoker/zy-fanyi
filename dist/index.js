"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = void 0;
var https = __importStar(require("https"));
var querystring = __importStar(require("querystring"));
var js_sha256_1 = require("js-sha256");
var private_1 = require("./private");
var errorMap = {
    101: '缺少必填的参数',
    102: '不支持的语言类型',
    103: '翻译文本过长',
    108: '应用ID无效',
    110: '无相关服务的有效实例',
    111: '开发者账号无效',
    112: '请求服务无效',
    203: '访问IP地址不在可访问IP列表',
    302: '翻译查询失败',
    303: '服务端的其它异常',
    304: '会话闲置太久超时',
    411: '访问频率受限,请稍后访问',
    412: '长请求过于频繁，请稍后访问',
};
var options = {
    hostname: 'openapi.youdao.com',
    port: 443,
    path: '/api',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
};
var truncate = function (q) {
    var len = q.length;
    if (len <= 20)
        return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
};
var translate = function (text) {
    var salt = new Date().getTime();
    var curtime = Math.round(new Date().getTime() / 1000);
    var str = private_1.appKey + truncate(text) + salt + curtime + private_1.key;
    var sign = js_sha256_1.sha256(str);
    var postData = querystring.stringify({
        q: text,
        from: 'auto',
        to: 'auto',
        signType: "v3",
        appKey: private_1.appKey, salt: salt, sign: sign, curtime: curtime,
    });
    var request = https.request(options, function (response) {
        var chucks = [];
        response.on('data', function (chunk) {
            chucks.push(chunk);
        });
        response.on('end', function () {
            var dataString = Buffer.concat(chucks).toString();
            var data = JSON.parse(dataString);
            if (data.errorCode === '0') {
                data.translation && data.translation.map(function (item) { return console.log(item); });
                process.exit(0);
            }
            else {
                console.error(errorMap[data.errorCode] || '翻译失败');
                process.exit(parseInt(data.errorCode));
            }
        });
    });
    request.on('error', function (e) {
        console.error("\u8BF7\u6C42\u9047\u5230\u95EE\u9898: " + e.message);
    });
    request.write(postData);
    request.end();
};
exports.translate = translate;
