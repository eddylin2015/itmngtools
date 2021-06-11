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

router.get('/', (req, res, next) => {
    res.render('healthdeclaration/index.pug', {
        profile: req.user,
    });
});
/* GET home page. */
router.use(function (req, res, next) {
    const { headers, method, url } = req;
    let subpath = ""
    if (url[url.length - 1] == "/") { subpath = url }
    else {
        let l_ = url.split("/");
        for (let i = 0; i < l_.length - 1; i++) { subpath += l_[i] + "/" }
    }
    console.log(method, url, subpath)
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
                maxFieldsSize: 1 * 1024 * 1024,
                minFileSize: 1,
            }
        );
        fileTypes = ['image/jpeg', 'image/png', 'image/gif'];

        form.onPart = part => {
            if (fileTypes.indexOf(part.mime) === -1) {
                // Here is the invalid file types will be handled. 
                // You can listen on 'error' event
                form._error(new Error('File type is not supported'));
            }
            if (!part.filename || fileTypes.indexOf(part.mime) !== -1) {
                // Let formidable handle the non file-pars and valid file types
                form.handlePart(part);
            }
        };

        form.parse(request).on('error', _err => {
            // You also pass it through next() to errorHandle function
            debug(_err.message); // output: File type is not supported
        })
        form.on('field', function (field, value) {
            console.log(field, value);
            fields.push([field, value]);
        })
            /* this is where the renaming happens */
            .on('fileBegin', function (name, file) {
                var fileType = file.type.split('/').pop();
                if (fileType == 'jpg' || fileType == 'png' || fileType == 'jpeg') {
                    //rename the incoming file
                    file.path = form.uploadDir + "/" + images_hash + '_' + image_count + '.' + fileType;
                    //increment image counter for next possible incoming image
                    ++image_count;
                } else {
                    console.log('incorrect file type: ' + fileType);
                }
            })
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err);
                res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
                res.end(String(err));
                return;
            }
            console.log(files)
            let file = files.file1
            let filename = file.name.split("/")
            filename = filename[filename.length - 1]
            console.log(path.join(form.uploadDir, file.name), filename)
            if (file) fs.promises.rename(file.path, path.join(form.uploadDir, filename));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ fields, files }, null, 2));
        });
        return;
    } else {
        res.render('healthdeclaration/index.pug', {
            profile: req.user,
        });
    }
});

module.exports = router;
