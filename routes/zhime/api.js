'use strict';
var express = require('express');
var router = express.Router();
/* GET home page. */

router.get('/', function (req, res) {   
    res.render('zhime/index', { title: '浸信中學教職員網頁 主頁',
    profile: req.user, 
   });
});
module.exports = router;