#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var os = require('os')
var app = require('./app.js')
var _util = require('util')
var fs = require('fs')

var predir = _path.join(os.homedir(), 'Hamsters', 'pre')
var atlasfile = _path.join(predir, 'hamsters.atlas')
var cssfile = _path.join(predir, 'hamsters.css')

var options = require('./options.json')
var size = options.preview_size
var csize = options.combo_size

function writeFile(filename) {
    return function (str) {
        console.log('write file', filename)

        return new Promise(function (resolve, reject) {
            fs.writeFile(filename, str, {encoding: 'utf8'}, function (err) {
                assert(err === null)

                resolve()
            })
        })
    }
}

function writeCss(metadata) {
    console.log('write css')

    return new Promise(function (resolve, reject) {
        var css = _util.format('.pc { height: %dpx; width: %dpx }\n', size, size)
        var ms, url, pics

        Object.keys(metadata).forEach(function (sheet) {
            assert(metadata.hasOwnProperty(sheet))

            ms = metadata[sheet]
            url = _util.format('url(./%s)', sheet.replace(/-/, '_'))
            ~
            (pics = Object.keys(ms)).forEach(function (pic) {
                assert(ms.hasOwnProperty(pic))

                css += _util.format('.p[data-p=\'%s\'] {\n', pic)
                css += _util.format('background-position: -%dpx -%dpx;\n',
                                   ms[pic][0], csize - ms[pic][1] - ms[pic][3])
                css += _util.format('height: %dpx;\n', ms[pic][3])
                css += _util.format('width: %dpx;\n', ms[pic][2])

                if (ms[pic][2] < size) {
                    css += _util.format('left: %dpx;\n', 0.5 * (size - ms[pic][2]))
                }
                if (ms[pic][3] < size) {
                    css += _util.format('top: %dpx;\n', 0.5 * (size - ms[pic][3]))
                }

                css += '}\n'
            })

            pics = pics.map(function (x) { return _util.format('.p[data-p=\'%s\']', x) })

            css += _util.format('%s { background-image: %s }\n', pics, url)
        })

        resolve(css)
    })
}

function main() {
    app.readFile(atlasfile)
    .then(writeCss)
    .then(writeFile(cssfile))
    .catch(function (err) {
        console.error(err)
    })
}

if (require.main === module) {
    main()
}
else {
    module.exports.writeFile = writeFile
}
