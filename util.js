var _path = require('path')
var os = require('os')

var savedir = _path.join(os.homedir(), 'Hamsters')
var metafile = _path.join(savedir, 'hamsters.json')
var predir = _path.join(savedir, 'pre')
var atlasfile = _path.join(predir, 'hamsters.atlas')
var cssfile = _path.join(predir, 'hamsters_css.json')

module.exports.savedir = savedir
module.exports.metafile = metafile
module.exports.predir = predir
module.exports.atlasfile = atlasfile
module.exports.cssfile = cssfile
