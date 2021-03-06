#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var fs = require('fs')
var app = require('./app.js')
var util = require('./util.js')

function main() {
    var arg = process.argv[2]
    var saveas

    assert(arg)
    console.log('-- delete', arg)

    app.readFile(util.metafile)
    .then(function (metadata) {
        console.log('-- delete %s from metafile', arg)
        if (!metadata.hasOwnProperty(arg)) {
            console.log('-- no metafile record', arg)
            return metadata
        }

        saveas = metadata[arg].picture
        delete metadata[arg]
        return metadata
    })
    .then(app.writeFile(util.metafile))

    .then(function () {
        var dir = util.bsavedir(saveas)
        saveas = _path.join(dir, saveas)

        console.log('-- delete file', saveas)
        fs.unlinkSync(saveas)
    })
}

if (require.main === module) {
    main()
}
