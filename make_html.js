#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var os = require('os')
var nunjucks = require('nunjucks')
var mkdirp = require('mkdirp')
var fs = require('fs')
var app = require('./app.js')
var util = require('./util.js')

delete Object.prototype.hasOwnPropertyCI
delete Object.prototype.getCI

var savedir = util.savedir
var metafile = util.metafile
var pagesize = 9

function pageFile(n) {
    return n? 'index_' + n + '.html': 'index.html'
}

function htmlpreview(pic) {
    var name = pic._id + '.png'
    var dir = util.bnodir(name)
    return './media/pre/' + dir + '/' + name
}

function writePages(htdocs) {
    return function (metadata) {
        var pictures = []
        var pages = []

        Object.keys(metadata).forEach(function (pic) {
            assert(metadata.hasOwnProperty(pic))

            var picture = metadata[pic]
            picture._id = pic
            pictures.push(picture)
        })

        pictures.sort(function (a, b) {
            return b.unixtime - a.unixtime
        })

        while (pictures.length) {
            pages.push(pictures.splice(0, pagesize))
        }

        pages.forEach(function (pictures, n) {
            var html = nunjucks.render('index.html', {
                pics: pictures.map(htmlpreview),
                prevPage: n? pageFile(n - 1): null,
                nextPage: n < pages.length - 1? pageFile(n + 1): null,
            })
            var name = pageFile(n)
            name = _path.join(htdocs, name)
            console.log('writing', name)
            fs.writeFileSync(name, html, {encoding: 'utf8'})
        })

        return Promise.resolve(1)
    }
}

function main() {
    nunjucks.configure('template', {autoescape: true})

    var htdocs = _path.join(__dirname, 'htdocs')

    mkdirp(htdocs, function (err) {
        assert(err === null)

        app.readFile(metafile)
        .then(writePages(htdocs))
        .catch(function (err) { console.error(err) })
    })
}

if (require.main === module) {
    main()
}
