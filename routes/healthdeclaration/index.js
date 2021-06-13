'use strict';
const zlib = require('zlib');
var fs = require('fs');
var express = require('express');
const formidable = require('formidable');
const path = require('path');
const url_utils = require('url');
const config = require('../../ES_WatchGuard_Config')
var router = express.Router();
const uploadDir = config.HealthDeclarationDir
const capchaDir = "capcha/"
const stud_list=["SC1A050505","SC1A060606","SC1A070707","SC1A080808"]
function mimetype(filename) {
    var dotoffset = filename.lastIndexOf('.');
    if (dotoffset == -1)
        return "NULL";
    var extra_name = filename.substr(dotoffset);
    var mimetype_obj = {
        '.html': 'text/html',
        '.ico': 'image/x-icon',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.txt': 'text/plain'
    };
    for (var x in mimetype_obj) {
        if (extra_name == x)
            return mimetype_obj[x];
    }
    return "NULL";
};
function base64_encode(file) {
    let bitmap = fs.readFileSync(file);

    return Buffer.from(bitmap, 'binary').toString('base64');
}
router.get('/', (req, res, next) => {
    let today = new Date()
    //console.log(today.toISOString().substring(0,10))
    let key=Math.floor(Math.random() * 100)+100; if (key>999) key=key-100
    let SID=(key*71).toString()
    let capcha=base64_encode(`${capchaDir}${key}.gif`)
    res.render('healthdeclaration/index.pug', {
        curr_date: today.toISOString().substring(0,10),
        profile: req.user,
        SID:SID,
        capcha:"data:image/gif;base64,"+capcha
    });
});
/* GET home page. */
router.use('/up/:book',function (req, res, next) {
    let today = new Date()
    try{
        let query_key=req.params.book
        let SID=req.query.SID;
        let capcha=req.query.capcha;
        if((Number(SID)%Number(capcha))>0){
            return res.end('驗証有誤!')
        }
        try{
        let buff = new Buffer.from(req.params.book, 'base64');
        query_key=buff.toString('ascii')
        }catch{}
        if(query_key.substring(0,10)!=today.toISOString().substring(0,10)){
            return res.end('Date Error!')
        }
        //console.log(req)
        const { headers, method, url } = req;
        let subpath = ""
        if (url[url.length - 1] == "/") { subpath = url }
        else {
            let l_ = url.split("/");
            for (let i = 0; i < l_.length - 1; i++) { subpath += l_[i] + "/" }
        }
        //console.log(method, url, subpath)
        let curr_path = uploadDir + subpath;
        if (req.method == 'POST') {
            //&ctx=20210607110301&crypto=18292930004302
            console.log(req.url)
            //parse a file upload
            //if(req.url.indexOf('s=1')>-1){uploadDir=`xml/1`; }
            curr_path = decodeURI(curr_path).replace("//", "/")
            let form = formidable(
                {
                    multiples: false,
                    uploadDir: curr_path,
                    keepExtensions: true,
                    maxFileSize: 2 * 1024 * 1024,
                    maxFields: 10,
                    maxFieldsSize: 1  * 1024,
                    minFileSize: 1,
                }
            );
            let fileTypes = ['image/jpeg', 'image/png', 'image/gif'];
            
            let curr_date=null;
            let classno=null
            let seat=null
            let bmonth=null
            let bday=null
            let fieldcnt=0;
            let part_err=null;
            form.onPart = part => {
                part.on('data', (buffer) => {
                    if(part.name=="curr_date") {
                       curr_date=buffer.toString()
                       if(curr_date!=today.toISOString().substring(0,10)){
                        part_err='Date Error!'
                       }
                    }
                    if(part.name=="classno") classno=buffer.toString()
                    if(part.name=="seat") seat=buffer.toString()
                    if(part.name=="bmonth") bmonth=buffer.toString()
                    if(part.name=="bday") {
                        bday=buffer.toString()
                        bday=(bday.length==1?"0":"")+bday;
                        seat=(seat.length==1?"0":"")+seat;
                        bmonth=(bmonth.length==1?"0":"")+bmonth;
                        bday=(bday.length==1?"0":"")+bday;
                        let key=`${classno}${seat}${bmonth}${bday}`
                        if(stud_list.indexOf(key)==-1)
                        {
                            part_err='學生資料有誤!'
                        }
                    }
                    // do whatever you want here
                  });
                if(part_err)
                {
                    form._error(new Error(part_err));
                }else if (part.filename&&fileTypes.indexOf(part.mime) === -1&& fieldcnt<5) {
                    // Here is the invalid file types will be handled. 
                    // You can listen on 'error' event
                    form._error(new Error('2MB 內圖版'));
                }
                if(part.name=="curr_date"||part.name=="classno"||part.name=="seat"||part.name=="bmonth"||part.name=="bday"){
                    fieldcnt++;
                    form.handlePart(part);
                }
                else if (!part_err || !part.filename || fileTypes.indexOf(part.mime) !== -1&&fieldcnt==5) {
                    // Let formidable handle the non file-pars and valid file types
                    form.handlePart(part);
                }
            };
    
            form.parse(req, (err, fields, files) => {
                if (err) {
                    //console.log('-----')
                    //console.error(err);
                    //console.log('-----')
                    res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
                    res.end(String(err));
                    return;
                }
                //console.log(files)
                let file = files.file1
                let filename = file.name.split("/")
                filename = curr_date+"_"+classno+seat+"_"+filename[filename.length - 1]
                //console.log(path.join(form.uploadDir, file.name), filename)
                if (file) fs.promises.rename(file.path, path.join(form.uploadDir, filename));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(`資料上傳成功!${filename}`)
                //res.end(JSON.stringify({ fields, files }, null, 2));
            });
            return;
        } else {
            res.redirect("/internal/healthdeclaration")
        }
    }catch(exp ){
        res.end(exp.toString())
    }

});

module.exports = router;
