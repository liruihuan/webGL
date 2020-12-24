//此服务用于加载本地文件时候跨域处理

const http = require('http');
const fs = require('fs');
const server = http.createServer();
const mimeType = require("./js/mime-type.js");



const readFolder = function (request, response) {
    const url = request.url;

    if (url === '/' || url === "/drawImage") {
        fs.readFile('./drawImage.html', function (error, data) {
            if (error) {
                console.error(error);
                return;
            }
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(data);
        });
    } else if (url !== '/') {
        const contentType = mimeType(url);
        const surl = '.' + url;

        fs.readFile(surl, function (error, data) {
            if (error) {
                console.error(error);
                return;
            }
            response.writeHead(200, { 'Content-type': contentType, 'Content-Length': Buffer.byteLength(data) });
            response.end(data);
        });
    }
}
server.on('request', readFolder);

server.listen(8088, function () {
    console.log("服务已开启,请访问http://127.0.0.1:8088/");
})
