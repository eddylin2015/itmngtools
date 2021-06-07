var http = require('http');
var fs = require('fs');
var path = require('path');
var mimes = {
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg'
};
var filename = process.argv[process.argv.length-1];
var ext = path.extname(filename);
var mime = mimes[ext];
if (!mime) return;
const base64 = fs.readFileSync(filename, "base64");
var stats = fs.statSync(filename)
var fileSizeInBytes = stats.size;
console.log(fileSizeInBytes)
var filesize = base64.length;
console.log(filesize)
var boundary = "----WebKitFormBoundaryENl50aIWkiBG2Umn"

var options = {
  host: '127.0.0.1',
  port: '81',
  path: '/upfile/',
  method: 'POST',
  headers: {
    'content-type': 'multipart/form-data; boundary=' + boundary,
    'content-length': filesize*2
  },
  form: { 'file1': filename  }
}
var req = http.request(options, function(res) {
  res.on('data', function(chunk) {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', function(err) {
  console.log("upload err : " + err);
});

function myFunc(arg) {
    console.log(base64)
    req.write("--" + boundary + "\r\n");
    req.write('Content-Disposition: form-data; name="crypt"\r\n\r\n');
    req.write("123456")
    req.write("\r\n")
    req.write("--" + boundary + "\r\n");
    req.write('Content-Disposition: form-data; name="ctx"\r\n\r\n');
    req.write("abcd")
    req.write("\r\n")
    req.write("--" + boundary + "\r\n");
    req.write('Content-Disposition: form-data; name="file1"; filename="'+filename+'"\r\n');
    req.write("Content-Transfer-Encoding: base64\r\n");
    req.write(`Content-Type: ${mime}\r\n\r\n`);
    req.write(base64)
    req.write("\r\n\r\n--" + boundary + "--\r\n");
    req.end();
}
setTimeout(myFunc, 1000,"");

// Create a base64 string from an image => ztso+Mfuej2mPmLQxgD ...
//const base64 = fs.readFileSync(filename, "base64");
// Convert base64 to buffer => <Buffer ff d8 ff db 00 43 00 ...
//const buffer = Buffer.from(base64, "base64");
