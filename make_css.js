#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var os = require('os')
var app = require('./app.js')
var _util = require('util')
var fs = require('fs')
var util = require('./util.js')

var predir = util.predir
var atlasfile = util.atlasfile
var cssfile = util.cssfile

var options = require('./options.json')
var size = options.preview_size
var csize = options.combo_size

function writeCss(metadata) {
    console.log('write css')

    return new Promise(function (resolve, reject) {
        var css = {
            basic: _util.format('.pc { height: %dpx; width: %dpx }\n', size, size),
            pictures: {},
            backgrounds: {},
        }

        var ms, url, pics

        Object.keys(metadata).forEach(function (sheet) {
            assert(metadata.hasOwnProperty(sheet))

            ms = metadata[sheet]
            url = _util.format('url(./%s)', sheet.replace(/-/, '_'))
            ~
            (pics = Object.keys(ms)).forEach(function (pic) {
                assert(ms.hasOwnProperty(pic))

                var a = _util.format('.p[data-p=\'%s\'] {\n', pic)
                a += _util.format('background-position: -%dpx -%dpx;\n',
                                  ms[pic][0], csize - ms[pic][1] - ms[pic][3])
                a += _util.format('height: %dpx;\n', ms[pic][3])
                a += _util.format('width: %dpx;\n', ms[pic][2])

                if (ms[pic][2] < size) {
                    a += _util.format('left: %dpx;\n', 0.5 * (size - ms[pic][2]))
                }
                if (ms[pic][3] < size) {
                    a += _util.format('top: %dpx;\n', 0.5 * (size - ms[pic][3]))
                }

                a += '}\n'

                css.pictures[pic] = a
            })

            var classes = pics.map(function (x) { return _util.format('.p[data-p=\'%s\']', x) })
            var b = _util.format('%s { background-image: %s }\n', classes, url)

            pics.forEach(function (pic) {
                css.backgrounds[pic] = b
            })
        })

        resolve(css)
    })
}

function main() {
    app.readFile(atlasfile)
    .then(writeCss)
    .then(app.writeFile(cssfile))
    .catch(function (err) {
        console.error(err)
    })
}

if (require.main === module) {
    main()
}
