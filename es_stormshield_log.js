
'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const https = require('https');
const config = require('./ES_WatchGuard_Config')
const stormshield_usr_pwd = config.strom_shield_user_pwd;
const stormshield_host_ip = config.strom_shield_host_ip;
const log_dir = "/code/wg/"
class ST_WG {
    static ST_sid = null;
    static ST_ssid = null;
    static HttpPost(host_, path_, param_postData, sid = null) {
        sid = sid == null ? ST_WG.ST_sid : sid
        return new Promise(resolve => {
            const req = https.request(
                {
                    hostname: host_,
                    port: 443,
                    path: path_,
                    method: 'POST',
                    headers:
                    {
                        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Connection': 'keep-alive',
                        "Content-Length": Buffer.byteLength(param_postData),
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Cookie': `${sid}; netasq-nws-webadmin-read-only=-1; netasq-nws-auth-certificate=-1`,
                        'Host': stormshield_host_ip,
                        'Origin': `https://${stormshield_host_ip}`,
                        'Referer': `https://${stormshield_host_ip}/admin/admin.html`,
                        'sec-ch-ua': '"Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
                        'sec-ch-ua-mobile': '?0',
                        'Sec-Fetch-Dest': 'empty',
                        'Sec-Fetch-Mode': 'cors',
                        'Sec-Fetch-Site': 'same-origin',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                }
                , (res) => {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
                            console.log(res.statusCode, res.location);
                        }
                        if (sid == "GetSID") {
                            ST_WG.ST_sid = res.headers['set-cookie'][0].split(";")[0]
                            resolve(ST_WG.ST_sid);
                        } else if (path_.indexOf("/api/auth/login") > -1) {
                            let tt__ = rawData.split("sessionid")[1].replace(">", "").replace("</", "")
                            resolve(tt__)
                        } else {
                            resolve(rawData);
                        }
                    });
                });
            req.write(param_postData);
            req.end();
        });
    }
    static HttpGet(host_, path_, sid = null) {
        sid = sid == null ? ST_WG.ST_sid : sid
        return new Promise(resolve => {
            https.get(
                {
                    hostname: host_,
                    port: 443,
                    path: path_,
                    method: 'GET',
                    headers: {
                        'Origin': `https://${stormshield_host_ip}/admin/admin.html`,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,',
                        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Cache-Control': 'max-age=0',
                        'Connection': 'keep-alive',
                        'Cookie': `${sid}; netasq-nws-webadmin-read-only=-1; netasq-nws-auth-certificate=-1`,
                        'Host': stormshield_host_ip,
                        'Referer': `https://${stormshield_host_ip}/admin/admin.html`,
                        'Upgrade-Insecure-Requests': '1',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
                    }
                },
                (res) => {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
                            console.log(res.statusCode, res.headers.location);
                        }
                        resolve(rawData);
                    });
                }).on('error', (e) => { console.log(e); });
        });
    }
}

var ST_link_paths = [
    "/api/auth/login",
    '/api/command',
    '/api/command',
    '/api/command',
    '/api/command',
    "/api/auth/logout",
];

var ST_link_commands = [
    'reqlevel=admin%2Cmodify%2Cmon_write%2Cbase%2Ccontentfilter%2Clog%2Clog_read%2Cfilter%2Cfilter_read%2Cglobalfilter%2Cvpn%2Cvpn_read%2Creport%2Creport_read%2Cpki%2Cobject%2Cglobalobject%2Cuser%2Cnetwork%2Croute%2Cmaintenance%2Casq%2Cpvm%2Cguest_admin%2Cprivacy%2Cprivacy_read%2Ctpm&app=webadmin&id=0&sessionid=',
    'cmd=MONITOR INTERFACE name%3Dethernet0%2Cethernet1&id=id1&sessionid=',
    'cmd=REPORT GET DAY report%3Dlinechart_bandwidth offset%3D0 content%3Dethernet0_*%2Cethernet&id=id2&sessionid=',
    'cmd=REPORT GET DAY report%3Dlinechart_bandwidth offset%3D1 content%3Dethernet0_*%2Cethernet&id=id3&sessionid=',
    'cmd=REPORT GET DAY report%3Dlinechart_bandwidth offset%3D2 content%3Dethernet0_*%2Cethernet&id=id4&sessionid=',
    "id=0&sessionid="
];

async function asyncStormShieldCall() {
    await ST_WG.HttpGet(stormshield_host_ip, "/admin/disclaimer?_dc=1622450197150", "");
    await ST_WG.HttpGet(stormshield_host_ip, "/admin/admin.html", "");
    await ST_WG.HttpPost(stormshield_host_ip, "/auth/admin.html?", stormshield_usr_pwd, "GetSID");
    console.log(ST_WG.ST_sid)
    for (let i = 0; i < ST_link_paths.length; i++) {
        console.log(i, ST_link_commands[i], ST_link_paths[i])
        let temp_ = await ST_WG.HttpPost(stormshield_host_ip, ST_link_paths[i], ST_link_commands[i] + ST_WG.ST_ssid);
        if (ST_link_paths[i].indexOf("/api/auth/login") > -1) {
            ST_WG.ST_ssid = temp_;
            console.log(i, ST_WG.ST_ssid)
        }
        if (ST_link_commands[i].indexOf("cmd=REPORT GET DAY report") > -1) {
            let end_d = (new Date(Date.now() - 3600 * 24 * 1000 * (i - 2))).toISOString().substring(0, 10);
            let fn = log_dir + "stormshield" + end_d + ".xml";
            let fs = require('fs');
            fs.writeFileSync(fn, temp_);
            console.log(i, fn)
        }
    }
    return "finish";
}
asyncStormShieldCall();
/* xml2js
var parseString = require('xml2js').parseString;
parseString(temp_, function (err, result) {
    console.dir(result);
    try {
    }
    catch (e) {
        console.log(e)
    }
});*/

