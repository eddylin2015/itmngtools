'use strict'
const https = require('http');
const fs = require("fs");
const url = require('url');
const formidable = require('formidable');
const path = require('path');
const config = require('./ES_WatchGuard_Config')
const hostdir = config.strom_shield_log_dir
const port = 81;
var routes = require('./routes/index');
var express = require('express');
var app = express();
app.disable('x-powered-by');
app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.get('/', (req, res) => {
	res.redirect("/upfile")
});
app.use(routes);
app.use('/upfile', require('./routes/upfile/api'));

app.use(function (req, res) { WebRouter(req, res); });
 
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
