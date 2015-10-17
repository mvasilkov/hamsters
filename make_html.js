#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var os = require('os')
var app = require('./app.js')
var nunjucks = require('nunjucks')
var mkdirp = require('mkdirp')
var fs = require('fs')
var util = require('./util.js')

var savedir = util.savedir
var metafile = util.metafile
var cssfile = util.cssfile
var pagesize = 9

var css = require(cssfile)

function pageFile(n) {
    return n? 'index_' + n + '.html': 'index.html'
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
                pics: pictures.map(function (x) { return x._id }),
                prevPage: n? pageFile(n - 1): null,
                nextPage: n < pages.length - 1? pageFile(n + 1): null,
                css: pageFile(n).replace(/html$/, 'css'),
            })
            var name = pageFile(n)
            name = _path.join(htdocs, name)
            console.log('writing', name)
            fs.writeFileSync(name, html, {encoding: 'utf8'})

            /* CSS */
            var styles = css.basic
            var backgrounds = {}

            pictures.forEach(function (x) {
                styles += css.pictures[x._id]
                backgrounds[css.backgrounds[x._id]] = 1
            })

            Object.keys(backgrounds).forEach(function (x) { styles += x })

            name = name.replace(/html$/, 'css')
            console.log('writing', name)
            fs.writeFileSync(name, styles, {encoding: 'utf8'})
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
