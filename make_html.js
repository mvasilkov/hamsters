#!/usr/bin/env node

var assert = require('assert')
var _path = require('path')
var os = require('os')
var nunjucks = require('nunjucks')
var mkdirp = require('mkdirp')
var fs = require('fs')
var permalink = require('permalink')
var app = require('./app.js')
var util = require('./util.js')

delete Object.prototype.hasOwnPropertyCI
delete Object.prototype.getCI

var savedir = util.savedir
var metafile = util.metafile
var htdocs = _path.join(__dirname, 'htdocs')
var pagesize = 9

function pageFile(n) {
    return n? 'index_' + n + '.html': 'index.html'
}

function pageFileTag(name, n) {
    return permalink(n? name + ' ' + n: name, '_') + '.html'
}

function htmlpreview(pic) {
    var name = pic._id + '.png'
    var dir = util.bnodir(name)
    return './media/pre/' + dir + '/' + name
}

function buildIndexTags(metadata) {
    var index = {}

    Object.keys(metadata).forEach(function (pic) {
        assert(metadata.hasOwnProperty(pic))

        var picture = metadata[pic]
        picture._id = pic
        picture.tags.forEach(function (name) {
            if (typeof index[name] == 'undefined') {
                index[name] = []
            }
            index[name].push(picture)
        })
    })

    return index
}

function _writePages(pictures, template, options, pageFile) {
    var pages = []

    while (pictures.length) {
        pages.push(pictures.splice(0, pagesize))
    }

    pages.forEach(function (pictures, n) {
        var html = nunjucks.render(template, {
            pics: pictures.map(htmlpreview),
            prevPage: n? pageFile(n - 1): null,
            nextPage: n < pages.length - 1? pageFile(n + 1): null,
            options: options,
        })
        var name = pageFile(n)
        name = _path.join(htdocs, name)
        console.log('writing', name)
        fs.writeFileSync(name, html, {encoding: 'utf8'})
    })
}

function writePages() {
    return function (metadata) {
        var pictures = []

        Object.keys(metadata).forEach(function (pic) {
            assert(metadata.hasOwnProperty(pic))

            var picture = metadata[pic]
            picture._id = pic
            pictures.push(picture)
        })

        pictures.sort(function (a, b) {
            return b.unixtime - a.unixtime
        })

        var indexTags = buildIndexTags(metadata)
        var tags = Object.keys(indexTags).map(function (name) {
            return {name: name, uri: permalink(name, '_') + '.html'}
        })

        _writePages(pictures, 'index.html', {tags: tags}, pageFile)

        Object.keys(indexTags).forEach(function (name) {
            assert(indexTags.hasOwnProperty(name))

            var pictures = indexTags[name]

            pictures.sort(function (a, b) {
                return b.unixtime - a.unixtime
            })

            _writePages(pictures, 'index_tag.html', {name: name, tags: tags},
                        pageFileTag.bind(null, name))
        })

        return Promise.resolve(1)
    }
}

function main() {
    nunjucks.configure('template', {autoescape: true})

    mkdirp(htdocs, function (err) {
        assert(err === null)

        app.readFile(metafile)
        .then(writePages())
        .catch(function (err) { console.error(err) })
    })
}

if (require.main === module) {
    main()
}
