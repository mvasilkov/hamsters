#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var os = require('os')
var shell = require('shelljs')
var app = require('./app.js')
var sharp = require('sharp')
var util = require('util')

var predir = _path.join(os.homedir(), 'Hamsters', 'pre')
var atlasfile = _path.join(predir, 'hamsters.atlas')

var options = require('./options.json')
var size = util.format('%dx%d', options.combo_size, options.combo_size)

if (!shell.which('kivy')) {
    console.error('Cannot locate kivy')
    shell.exit(1)
}

function flattenBackground(pic) {
    return function () {
        console.log('flatten background', pic)

        var image = _path.join(predir, pic)
        var result = _path.join(predir, pic.replace(/-/, '_'))

        return new Promise(function (resolve, reject) {
            (image = sharp(image))
            .flatten()
            .background('white')
            .toFile(result)
            .then(function (meta) {
                console.log(meta.width + ' × ' + meta.height)
                resolve()
            })
            .catch(function (err) {
                reject(err)
            })
        })
    }
}

function loopBackground(metadata) {
    var promise = Promise.resolve(1)

    Object.keys(metadata).forEach(function (pic) {
        assert(metadata.hasOwnProperty(pic))

        promise = promise
        .then(flattenBackground(pic))
    })

    return promise
}

function main() {
    shell.cd(predir)
    shell.exec('kivy -m kivy.atlas hamsters ' + size + ' *.png', function (code) {
        if (code !== 0) {
            console.error('Errorlevel', code)
            shell.exit(code)
        }

        app.readFile(atlasfile)
        .then(loopBackground)
        .catch(function (err) {
            console.error(err)
        })
    })
}

if (require.main === module) {
    main()
}
