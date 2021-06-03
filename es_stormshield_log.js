'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const https = require('https');
const http = require('http');
const querystring = require('querystring');
const cfg = require('./ES_WatchGuard_config')
const stormshield_usr_pwd = cfg.strom_shield_user_pwd;
const stormshield_host_ip = cfg.strom_shield_host_ip;
const log_dir = cfg.strom_shield_log_dir
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
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                }
                , (res) => {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) { console.log(res.statusCode, res.headers.location); }
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
                        'Accept': '*/*',
                        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Cache-Control': 'max-age=0',
                        'Connection': 'keep-alive',
                        'Cookie': `${sid}; netasq-nws-webadmin-read-only=-1; netasq-nws-auth-certificate=-1`,
                        'Host': stormshield_host_ip,
                        'Origin': `https://${stormshield_host_ip}/admin/admin.html`,
                        'Referer': `https://${stormshield_host_ip}/admin/admin.html`,
                        'Upgrade-Insecure-Requests': '1',
                    }
                },
                (res) => {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) { console.log(res.statusCode, res.headers.location); }
                        resolve(rawData);
                    });
                }).on('error', (e) => { console.log(e); });
        });
    }
    static Xml2Csv(temp_, fn) {
        let fs = require('fs');
        let patt2 = /<line>(.*?)<\/line>/g;
        let patt_res = temp_.match(patt2)
        if (!patt_res) return;
        let outline = {}
        let field_idx = 0
        let field_name = "Date"
        for (let temp_ of patt_res) {
            let temp__ = temp_.split('"')
            if (temp__[1] == "CurveName") { field_idx++; field_name += "," + temp__[3] }
            if (isNumber(temp__[1])) {
                if (!outline.hasOwnProperty(temp__[1])) outline[temp__[1]] = []
                outline[temp__[1]][field_idx] = temp__[3];
            }
        }
        let outstr = field_name + "\n";
        for (let key in outline) outstr += outline[key].join(",") + "\n";
        fs.writeFileSync(fn + ".csv", outstr);
        return outline;
    }
}
var ST_link_paths = [
    "/api/auth/login",
    '/api/command',
    '/api/command',
    '/api/command',
    '/api/command',
    '/api/command',
    '/api/command',
    '/api/command',
    "/api/auth/logout",
];
// bandwidth | packetstat  |
var ST_link_commands = [
    'reqlevel=admin%2Cmodify%2Cmon_write%2Cbase%2Ccontentfilter%2Clog%2Clog_read%2Cfilter%2Cfilter_read%2Cglobalfilter%2Cvpn%2Cvpn_read%2Creport%2Creport_read%2Cpki%2Cobject%2Cglobalobject%2Cuser%2Cnetwork%2Croute%2Cmaintenance%2Casq%2Cpvm%2Cguest_admin%2Cprivacy%2Cprivacy_read%2Ctpm&app=webadmin&id=0&sessionid=',
    'cmd=MONITOR INTERFACE name%3Dethernet0%2Cethernet1&id=id1&sessionid=',
    'cmd=REPORT GET DAY report%3Dlinechart_bandwidth  offset%3D0 content%3Dethernet0_*%2Cethernet1_*&id=id2&sessionid=',
    'cmd=REPORT GET DAY report%3Dlinechart_bandwidth  offset%3D1 content%3Dethernet0_*%2Cethernet1_*&id=id3&sessionid=',
    'cmd=REPORT GET DAY report%3Dlinechart_bandwidth  offset%3D2 content%3Dethernet0_*%2Cethernet1_*&id=id4&sessionid=',

    'cmd=REPORT GET DAY report%3Dlinechart_packetstat offset%3D0 content%3Dethernet0_*%2Cethernet1_*&id=id2&sessionid=',
    'cmd=REPORT GET DAY report%3Dlinechart_packetstat offset%3D1 content%3Dethernet0_*%2Cethernet1_*&id=id3&sessionid=',
    'cmd=REPORT GET DAY report%3Dlinechart_packetstat offset%3D2 content%3Dethernet0_*%2Cethernet1_*&id=id4&sessionid=',
    "id=0&sessionid="
];
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }
async function asyncStormShieldCall() {
    await ST_WG.HttpGet(stormshield_host_ip, "/admin/disclaimer?_dc=1622450197150", "");
    await ST_WG.HttpGet(stormshield_host_ip, "/admin/admin.html", "");
    await ST_WG.HttpPost(stormshield_host_ip, "/auth/admin.html?", stormshield_usr_pwd, "GetSID");
    console.log(ST_WG.ST_sid)
    var patt = /offset%3D\d/i;
    for (let i = 0; i < ST_link_paths.length; i++) {
        console.log(i, ST_link_commands[i], ST_link_paths[i])
        let temp_ = await ST_WG.HttpPost(stormshield_host_ip, ST_link_paths[i], ST_link_commands[i] + ST_WG.ST_ssid);
        var offset = ST_link_commands[i].match(patt);
        if (ST_link_paths[i].indexOf("/api/auth/login") > -1) {
            ST_WG.ST_ssid = temp_;
            console.log(i, ST_WG.ST_ssid)
        } else if (ST_link_commands[i].indexOf("cmd=REPORT GET DAY report") > -1 && offset) {
            offset = offset[0].replace("offset%3D", "");
            let prefix = ST_link_commands[i].indexOf("packetstat") > -1 ? "packetstat" : "stormshield"
            let end_d = (new Date(Date.now() - 3600 * 24 * 1000 * (Number(offset)))).toISOString().substring(0, 10);
            let fn = log_dir + prefix + end_d + ".xml";
            let fs = require('fs');
            fs.writeFileSync(fn, temp_);
            console.log(i, fn)
            if (prefix == "stormshield") {
                ST_WG.Xml2Csv(temp_, fn)
            }
        }
    }
    return "finish";
}
//Main Function
//asyncStormShieldCall();

//Sub Xml2CSV
class WG {
    static HttpPost(host_, path_, param_postData, sid, port_ = 80) {
        return new Promise(resolve => {
            let http_proc = port_ == 443 ? https : http;
            let http_https_ = port_ == 443 ? "https" : "http";
            let Origin_ = http_https_ + "://" + host_;
            const req = http_proc.request(
                {
                    hostname: host_,
                    port: port_,
                    path: path_,
                    method: 'POST',
                    headers: {
                        'Connection': 'keep-alive',
                        'Content-Length': Buffer.byteLength(param_postData),
                        'Cache-Control': 'max-age=0',
                        'Origin': Origin_,
                        'Upgrade-Insecure-Requests': 1,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': '*/*',
                        'Accept-Language': 'zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4',
                        'Cookie': sid
                    }
                }
                , (res) => {
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => { rawData += chunk; });
                    res.on('end', () => {
                        resolve(rawData);
                    });
                });
            req.write(param_postData);
            req.end();
        });
    }
}

async function asyncPutLog2DBCall() {
    let fs = require('fs')
    let path = require('path');
     fs.readdir(log_dir,async function (err, files) {
        for (let f of files) {
            if (f.endsWith(".xml") && f.startsWith("stormshield")) {
                let fn = path.join(log_dir, f)
                let temp_ = fs.readFileSync(fn, 'utf8');
                let outline = ST_WG.Xml2Csv(temp_, fn)
                for (let key in outline) {
                    let stime = outline[key][0]
                    let etime = outline[key][0].replace(":00:00", ":30:00")
                    let incoming = Number(outline[key][1]) + Number(outline[key][3]);
                    let outgoing = Number(outline[key][5]) + Number(outline[key][7]);
                    incoming = incoming * 225 / 1024 / 1024
                    outgoing = outgoing * 225 / 1024 / 1024
                    let jres = { 'incoming': incoming.toFixed(2), 'outgoing': outgoing.toFixed(2), 'stime': stime, 'etime': etime };
                    console.log(jres);
                    let inc_id = await WG.HttpPost(cfg.repos_data_host, cfg.repos_data_path, querystring.stringify(jres), "sid", 80);
                    console.log(inc_id, " end.");
                }
            }
        }
    });
}
asyncPutLog2DBCall()
