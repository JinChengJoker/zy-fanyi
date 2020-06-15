import * as https from "https";
import * as querystring from "querystring";
import {sha256} from "js-sha256";
import {appKey, key} from './private'

const truncate = (q: string) => {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

const translate = (word) => {
  const salt = new Date().getTime();
  const curTime = Math.round(new Date().getTime() / 1000);
  const query = word;  // 多个query可以用\连接  如 query='apple\banner\orange'
  const from = 'auto';
  const to = 'auto';
  const str = appKey + truncate(query) + salt + curTime + key;
  const sign = sha256(str);

  const options = {
    hostname: 'openapi.youdao.com',
    port: 443,
    path: '/api',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };

  const postData = querystring.stringify({
    q: query,
    appKey: appKey,
    salt: salt,
    from: from,
    to: to,
    sign: sign,
    signType: "v3",
    curtime: curTime,
  })

  const request = https.request(options, (response) => {
    const chucks = []
    response.on('data', (chunk) => {
      chucks.push(chunk)
    });
    response.on('end', () => {
      const dataString = Buffer.concat(chucks).toString()
      const data = JSON.parse(dataString)
      console.log(data.translation)
    })
  });

  request.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`);
  });

  request.write(postData)
  request.end();
}

export {translate}