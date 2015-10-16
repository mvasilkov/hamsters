#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var os = require('os')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var app = require('./app.js')
var sharp = require('sharp')

var savedir = _path.join(os.homedir(), 'Hamsters')
var metafile = _path.join(savedir, 'Hamsters.json')
var predir = _path.join(savedir, 'pre')

var options = require('./options.json')
var size = options.preview_size

function dirFunction(name, wrappedFunction) {
    return function () {
        console.log(name)

        return new Promise(function (resolve, reject) {
            wrappedFunction(predir, function (err) {
                assert(err === null)

                resolve()
            })
        })
    }
}

var rmdir = dirFunction('rmdir', rimraf)
var mkdir = dirFunction('mkdir', mkdirp)

function generate1Preview(options) {
    var picture
    assert(picture = options.picture)

    return function () {
        console.log('generate preview', picture)

        var image = _path.join(savedir, picture)
        var result = _path.join(predir, _path.parse(picture).name + '.png')

        return new Promise(function (resolve, reject) {
            (image = sharp(image))
            .metadata()
            .then(function (meta) {
                assert(meta.height > size)
                assert(meta.width > size)

                if (meta.height > meta.width)
                    image = image.resize(null, size)
                else
                    image = image.resize(size)

                return image
                .interpolateWith(sharp.interpolator.bicubic)
                .flatten()
                .background('white')
                .toFile(result)
            })
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

function generatePreviews(metadata) {
    var promise = Promise.resolve(1)

    Object.keys(metadata).forEach(function (pic) {
        assert(metadata.hasOwnProperty(pic))

        promise = promise
        .then(generate1Preview(metadata[pic]))
    })

    return promise
}

function main() {
    rmdir()
    .then(mkdir)
    .then(function () {
        return app.readFile(metafile)
    })
    .then(generatePreviews)
    .catch(function (err) {
        console.error(err)
    })
}

if (require.main === module) {
    main()
}
