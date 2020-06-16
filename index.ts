import * as https from "https";
import * as querystring from "querystring";
import {sha256} from "js-sha256";
import {appKey, key} from './private';

const errorMap = {
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
}

const options = {
  hostname: 'openapi.youdao.com',
  port: 443,
  path: '/api',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
};

const truncate = (q: string) => {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

const translate = (text) => {
  const salt = new Date().getTime();
  const curtime = Math.round(new Date().getTime() / 1000);
  const str = appKey + truncate(text) + salt + curtime + key;
  const sign = sha256(str);

  const postData = querystring.stringify({
    q: text,
    from: 'auto',
    to: 'auto',
    signType: "v3",
    appKey, salt, sign, curtime,
  })

  const request = https.request(options, (response) => {
    const chucks = []
    response.on('data', (chunk) => {
      chucks.push(chunk)
    });
    response.on('end', () => {
      const dataString = Buffer.concat(chucks).toString()
      type translationResult = {
        errorCode: string
        translation?: [string]
      }
      const data: translationResult = JSON.parse(dataString)
      if(data.errorCode === '0') {
        data.translation.map(item => console.log(item))
        process.exit(0);
      } else {
        console.error(errorMap[data.errorCode] || '翻译失败');
        process.exit(parseInt(data.errorCode));
      }
    });
  });

  request.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`);
  });
  request.write(postData);
  request.end();
}

export {translate}