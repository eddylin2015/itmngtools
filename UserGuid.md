
## ES_WatchGuard_Config.js
```js 
'use strict'
exports.WG_Username = 'admin';
exports.strom_shield_user_pwd = '';
exports.strom_shield_host_ip="";
exports.strom_shield_log_dir="";
exports.repos_data_host = "";
exports.repos_data_path = "";
function checkuser(req) {
    return true;
}
exports.checkuser=checkuser;
```