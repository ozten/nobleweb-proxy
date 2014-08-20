module.exports = function(req, contentTypeTree) {
    var ext = '.unknown';
    if (undefined === contentTypeTree) return ext;
    var contentType = contentTypeTree.split(';')[0];
    switch (contentType) {
        case undefined:
        case null:
            break;
        case 'image/png':
            ext = '.png';
            break;
        case 'image/jpeg':
            ext = '.jpg';
            break;
        case 'image/gif':
            ext = '.gif';
            break;
        case 'text/html':
        case 'application/xhtml+xml':
            ext = '.html';
            break;
        case 'text/css':
            ext = '.css';
            break;
        case 'text/javascript':
        case 'application/javascript':
        case 'application/ecmascript':
            ext = '.js';
            break;
        case 'application/json':
            ext = '.json';
            break;
        case 'video/avi':
            ext = '.avi';
            break;
        case 'video/mpeg':
            ext = '.mpeg';
            break;
        case 'video/mp4':
            ext = '.mp4';
            break;
        case 'video/ogg':
            ext = '.ogg';
            break;
        case 'video/webm':
            ext = '.webm';
            break;
        case 'text/plain':
            ext = '.txt';
            break;
        case 'application/zip':
            ext = '.zip';
            break;
        case 'application/gzip':
            ext = '.gzip';
            break;
        case 'application/pdf':
            ext = '.pdf';
            break;
        case 'text/csv':
            ext = '.csv';
            break;
        case 'application/atom+xml':
        case 'application/xml':
            ext = '.xml';
            break;
        case 'application/x-font-ttf':
            ext = '.ttf';
            break;
        case 'application/ocsp-response':
            ext = '.ocsp';
            break;
        default:
            process.stdout.write('Unknown file extention ' +
                contentType + ' for ' + req.url + '\n');
            break;
    }
    return ext;
};