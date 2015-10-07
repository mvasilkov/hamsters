#!/usr/bin/env node

var assert = require('assert')
var _request = require('request')
var cheerio = require('cheerio')

var request = _request.defaults({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) ' +
            'AppleWebKit/600.7.12 (KHTML, like Gecko) Version/7.1.7 Safari/537.85.16',
        'Referer': 'http://www.pixiv.net/',
    },
    jar: true,
})

var options = require('./options.json')

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
                console.log('looks bad')
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
                console.log('looks bad')
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

function main() {
    login()
    .then(checkLogin)
    .then(wait(2))
}

if (require.main === module) {
    main()
}
