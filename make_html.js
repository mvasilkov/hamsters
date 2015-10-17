#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var os = require('os')
var app = require('./app.js')
var app2 = require('./make_css.js')
var nunjucks = require('nunjucks')
var mkdirp = require('mkdirp')
var util = require('./util.js')

var savedir = util.savedir
var metafile = util.metafile

function writeIndex(metadata) {
    return new Promise(function (resolve, reject) {
        var html = nunjucks.render('index.html', {pics: Object.keys(metadata)})
        resolve(html)
    })
}

function main() {
    nunjucks.configure('template', { autoescape: true })

    var htdocs = _path.join(__dirname, 'htdocs')
    var index = _path.join(htdocs, 'index.html')

    mkdirp(htdocs, function (err) {
        assert(err === null)

        app.readFile(metafile)
        .then(writeIndex)
        .then(app2.writeFile(index))
        .catch(function (err) {
            console.error(err)
        })
    })
}

if (require.main === module) {
    main()
}
