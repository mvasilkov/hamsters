var _path = require('path')
var os = require('os')
var fs = require('fs')

var savedir = _path.join(os.homedir(), 'Hamsters')
var metafile = _path.join(savedir, 'hamsters.json')
var predir = _path.join(savedir, 'pre')

function isFn(method) {
    return function (path) {
        try { return fs.statSync(path)[method]() }
        catch (err) { return null }
    }
}

module.exports.savedir = savedir
module.exports.metafile = metafile
module.exports.predir = predir

module.exports.isDir = isFn('isDirectory')
module.exports.isFile = isFn('isFile')
