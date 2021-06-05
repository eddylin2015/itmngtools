'use strict'
var fs = require('fs');
var path = require('path');
var process = require("process");
var moveFrom = "logs/";
var moveTo = "logs_ex/"
var li = new Array();
// Loop through all the files in the temp directory
var itedir = function (moveFrom) {
    fs.readdir(moveFrom, function (err, files) {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }
        files.forEach(function (file, index) {
            // Make one pass and make the file complete
            var fromPath = path.join(moveFrom, file);
            var toPath = path.join(moveTo, file);
            fs.stat(fromPath, function (error, stat) {
                if (error) {
                    console.error("Error stating file.", error);
                    return;
                }
                if (stat.isFile()) {
                    if (file.toLowerCase().indexOf(".jpg") > -1) {
                        console.log("node uppic.js \"%s\" \"%s\"\n", fromPath, file);
                    }
                    li.push(fromPath);
                }
                else if (stat.isDirectory()) {
                    itedir(fromPath);
                }
            });
        });
    });
}
itedir(moveFrom);
