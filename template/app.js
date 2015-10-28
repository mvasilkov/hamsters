if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (search) {
        return this.slice(-search.length) === search
    }
}

if (typeof localStorage == 'undefined') {
    localStorage = {
        getItem: function () {},
        setItem: function () {},
    }
}

function index_main() {
    $(document.body).on('click', '[data-lnk]', function (event) {
        var pre = $(this)
        var lnk = pre.data('lnk')
        localStorage.setItem(lnk, pre.data('tags'))
        location = './view.html#' + lnk
    })
}

function view_main() {
    var permalink = urlfmt /* TODO */
    var pic = location.hash.substr(1)
    $('<img>', {
        'class': 'view',
        src: './media/pic/' + pic,
    })
    .appendTo('.column1')
    .click(function () {
        $(this).toggleClass('zoom')
    })

    var tags = localStorage.getItem(pic)
    if (typeof tags == 'string') {
        tags.split(':').forEach(function (name) {
            $('<a>', {
                href: './' + permalink(name, '_') + '.html',
                text: name,
            })
            .appendTo($('<li>').appendTo('.tags'))
        })
    }
}

if (location.pathname.endsWith('/view.html')) {
    view_main()
}
else {
    index_main()
}
