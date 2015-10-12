#!/usr/bin/env node

var assert = require('assert')
var _request = require('request')
var cheerio = require('cheerio')
var mime = require('mime-types')
var mkdirp = require('mkdirp')
var _path = require('path')
var fs = require('fs')
var url = require('url')
var lockfile = require('proper-lockfile')

var request = _request.defaults({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) ' +
            'AppleWebKit/600.7.12 (KHTML, like Gecko) Version/7.1.7 Safari/537.85.16',
        'Referer': 'http://www.pixiv.net/',
    },
    jar: true,
})

var pictureUri = 'http://www.pixiv.net/member_illust.php?mode=medium&illust_id='

var options = require('./options.json')

var homedir = process.env.HOME || process.env.USERPROFILE
var savedir = _path.join(homedir, 'Hamsters')
var metafile = _path.join(savedir, 'Hamsters.json')

function login() {
    console.log('login')

    return new Promise(function (resolve, reject) {
        request.post({
            uri: 'https://www.secure.pixiv.net/login.php',
            headers: {
                'Host': 'www.secure.pixiv.net',
            },
            form: {
                'mode': 'login',
                'return_to': '/',
                'pixiv_id': options.username,
                'pass': options.password,
                'skip': '1',
            },
        }, function (err, res, body) {
            assert(err === null)

            if (res.statusCode == 302 &&
                res.headers.location == 'http://www.pixiv.net/') {

                console.log('looks good')
            }
            else {
                console.error('looks bad')
                return void reject()
            }

            resolve()
        })
    })
}

function checkLogin() {
    console.log('check login')

    return new Promise(function (resolve, reject) {
        request.get({
            uri: 'http://www.pixiv.net/',
            headers: {
                'Host': 'www.pixiv.net',
            },
        }, function (err, res, body) {
            assert(err === null)

            if (res.statusCode == 200) {
                console.log('looks good')
            }
            else {
                console.error('looks bad: got http', res.statusCode)
                return void reject()
            }

            var $ = cheerio.load(body)
            var username = $('h1.user').text()
            assert(username == options.username)

            console.log('logged in as', username)
            resolve()
        })
    })
}

function wait(seconds) {
    return function () {
        console.log('waiting for', seconds, 'seconds')

        return new Promise(function (resolve, reject) {
            setTimeout(resolve, 1000 * seconds)
        })
    }
}

function readFile(filename) {
    console.log('read file', filename)

    return new Promise(function (resolve, reject) {
        fs.readFile(filename, {encoding: 'utf8'}, function (err, str) {
            assert(err === null)

            var res = JSON.parse(str)
            resolve(res)
        })
    })
}

function writeFile(filename) {
    return function (res) {
        console.log('write file', filename)

        return new Promise(function (resolve, reject) {
            var str = JSON.stringify(res, null, 4) + '\n'

            fs.writeFile(filename, str, {encoding: 'utf8'}, function (err) {
                assert(err === null)

                resolve()
            })
        })
    }
}

function saveMeta(pic, meta) {
    console.log('meta', meta)

    return new Promise(function (resolve, reject) {
        lockfile.lock(metafile, function (err, release) {
            assert(err === null)

            readFile(metafile)
            .then(function (res) {
                res[pic] = meta
                return res
            })
            .then(writeFile(metafile))
            .then(function () {
                release()
                resolve()
            })
            .catch(function (err) {
                release()
                reject(err)
            })
        })
    })
}

function download(uri, pic, meta) {
    console.log('download', uri)

    return new Promise(function (resolve, reject) {
        request.get({
            uri: uri,
            headers: {
                'Host': url.parse(uri).hostname,
                'Referer': pictureUri + pic,
            },
            encoding: null,
        }, function (err, res, buf) {
            assert(err === null)

            if (res.statusCode == 200) {
                console.log('looks good')
            }
            else {
                console.error('looks bad: got http', res.statusCode)
                return void reject()
            }

            var saveas = _path.join(savedir, '' + pic)
            var contentType, extension

            if (contentType = res.headers['content-type']) {
                if (extension = mime.extension(contentType)) {
                    if (extension == 'jpg')
                        extension = 'jpeg'

                    saveas += '.' + extension
                }
            }

            assert(extension)
            meta.picture = pic + '.' + extension

            mkdirp(savedir, function (err) {
                assert(err === null)

                fs.writeFile(saveas, buf, function (err) {
                    assert(err === null)

                    resolve(saveMeta(pic, meta))
                })
            })
        })
    })
}

function save1Picture(pic) {
    return function () {
        console.log('save picture', pic)

        return new Promise(function (resolve, reject) {
            request.get({
                uri: pictureUri + pic,
                headers: {
                    'Host': 'www.pixiv.net',
                },
            }, function (err, res, body) {
                assert(err === null)

                if (res.statusCode == 200) {
                    console.log('looks good')
                }
                else {
                    console.error('looks bad: got http', res.statusCode)
                    return void reject()
                }

                var $ = cheerio.load(body)
                var original = $('._illust_modal [data-src]').data('src')
                assert(original)

                var originalTags = $('.tags .self-tag + .text')
                .map(function (a, b) { return $(b).text() })
                .get()

                var tags = {}
                originalTags.forEach(function (a) {
                    if (options.known_tags.hasOwnProperty(a)) {
                        tags[options.known_tags[a]] = 1
                    }
                })

                tags = Object.keys(tags).sort(function (a, b) {
                    return a.localeCompare(b)
                })

                resolve(download(original, pic, {tags: tags}))
            })
        })
    }
}

function savePictures(pictures) {
    return function () {
        var promise = Promise.resolve(1)

        pictures.forEach(function (pic) {
            promise = promise
            .then(wait(2))
            .then(save1Picture(pic))
        })

        return promise
    }
}

function main() {
    process
    .once('SIGINT', function () {
        process.exit(1)
    })
    .once('SIGTERM', function () {
        process.exit(1)
    })

    login()
    .then(checkLogin)
    .then(savePictures(options.illust_ids))
    .catch(function (err) {
        console.error(err)
    })
}

if (require.main === module) {
    main()
}
else {
    module.exports.readFile = readFile
    module.exports.writeFile = writeFile
}
