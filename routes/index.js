'use strict';
var express = require('express');
var router = express.Router();
/* GET home page. */

router.get('/itnmg/', function (req, res) {   
    res.render('index', { title: '浸信中學教職員網頁 主頁',
    profile: req.user, 
   });
});

// Define routes.
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
function a2hex(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i ++) {
      var hex = Number(str.charCodeAt(i)).toString(16);
      arr.push(hex);
    }
    return arr.join('');
  }
module.exports = router;
