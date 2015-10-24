var assert = require('assert')
var _path = require('path')
var os = require('os')
var fs = require('fs')
var murmurhash3 = require('murmurhash3')
var options = require('./options.json')

var savedir = _path.join(os.homedir(), 'Hamsters')
var metafile = _path.join(savedir, 'hamsters.json')
var predir = _path.join(savedir, 'pre')

function isFn(method) {
    return function (path) {
        try { return fs.statSync(path)[method]() }
        catch (err) { return null }
    }
}

function bucketPath(path) {
    assert(typeof options.buckets == 'number' && options.buckets)

    return function (name) {
        var x = murmurhash3.murmur32Sync(name, 96)
        return _path.join(path, '' + x % options.buckets)
    }
}

module.exports.savedir = savedir
module.exports.metafile = metafile
module.exports.predir = predir

module.exports.isDir = isFn('isDirectory')
module.exports.isFile = isFn('isFile')

module.exports.bsavedir = bucketPath(savedir)
module.exports.bpredir = bucketPath(predir)

Object.prototype.hasOwnPropertyCI = function (a) {
    a = a.toUpperCase()
    return Object.keys(this).some(function (b) {
        return a === b.toUpperCase()
    })
}

Object.prototype.getCI = function (a) {
    var value

    a = a.toUpperCase()
    Object.keys(this).some(function (b) {
        if (a === b.toUpperCase())
            return (value = this[b]), true
    }.bind(this))

    return value
}
