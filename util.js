var _path = require('path')
var os = require('os')

var savedir = _path.join(os.homedir(), 'Hamsters')
var metafile = _path.join(savedir, 'hamsters.json')
var predir = _path.join(savedir, 'pre')

module.exports.savedir = savedir
module.exports.metafile = metafile
module.exports.predir = predir
