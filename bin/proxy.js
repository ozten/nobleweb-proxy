#!/usr/bin/env node

var http = require('http');
var fs = require('fs');


var httpProxy = require('http-proxy');


var determineContentType = require('../lib/content_type');


var options = {
    secure: true
};

var proxy = httpProxy.createProxyServer(options);

proxy.on('error', function(err, req, res) {
    if (err) process.stderr.write('Proxy ERROR: ' + err + ' for ' +
        req.url +
        '\n');
});

var proxyServer = require('http').createServer(function(req, res) {

    console.log('PROCESSING: ' + req.url);

    var bodyEncoding = null;
    var headers = {};

    var _setHeader = res.setHeader;
    res.setHeader = function(name, value) {
        headers[name] = value;
        if ('content-type' === name.toLowerCase()) {
            switch (name.toLowerCase) {
                case 'text/html':
                    bodyEncoding = 'utf8';
                    break;
                default:
                    // No-op
                    break;
            }
        }
        return _setHeader.call(res, name, value);
    };

    var bufferLen = 0;
    var buffers = [];
    var _write = res.write;
    res.write = function(chunk, /* optional */ encoding) {

        if (!encoding) {
            // Binary Buffer
            buffers.push(chunk);
            bufferLen += chunk.length;
        } else {
            // String
            console.log('Encoding', encoding);
            bodyEncoding = encoding;
        }
        return _write.call(res, chunk, encoding);
    };

    var _end = res.end;
    res.end = function( /* optional */ data, /* optional */ encoding) {
        if (!!data) {
            if (!encoding) {
                // Binary Buffer
                buffers.push(data);
                bufferLen += data.length;
            } else {
                // String
                console.log('Encoding', encoding);
                bodyEncoding = encoding;
                buffers = new Buffer(data);
            }
        }
        return _end.call(res, data, encoding);
    };

    res.on('close', function() {
        console.log('CLOSED');
    });

    res.on('finish', function() {
        var meta = {
            status: res.statusCode,
            headers: headers
        }
        var cacheFilename = getCacheFilename(req, headers['content-type']);
        var metaFilename = getMetaFilename(req);
        fs.writeFile(metaFilename, JSON.stringify(meta, null, 4), {
            encoding: 'utf8'
        }, function(err) {
            if (err) {
                process.stderr.write('Error writing metadata ' +
                    (err.stack || err.toString()) + '\n');
            }
            if (buffers.length > 0) {
                var body = Buffer.concat(buffers, bufferLen);
                console.log('Writing file ' + cacheFilename + ' encoding:' + bodyEncoding);
                fs.writeFile(cacheFilename,
                    body, {
                        encoding: bodyEncoding
                    },
                    function(err) {
                        if (err) {
                            process.stderr.write('Unable to write to ' + cacheFilename + ' ERR:' +
                                (err.stack.toString || err.toString()) + '\n');
                        }
                    });
            }
        });

    });

    try {
        proxy.web(req, res, {
            forward: req.url,
            target: req.url
        });
    } catch (e) {
        console.log('catching err=' + (e.stack.toString() || e.toString()));
    }

});

function getCacheFilename(req, contentType) {
    var ext = determineContentType(req, contentType);
    return new Date().getTime() + ext;
}

function getMetaFilename(req) {
    return new Date().getTime() + '_meta.json';
}

process.on('uncaughtException', function(err) {
    // dns failures are common
    if ('ENOTFOUND' === err.code) {

    } else {
        // Unknown error, best to fall over
        throw new Error(err);
    }

});

proxyServer.listen(1080);