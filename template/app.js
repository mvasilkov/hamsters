if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (search) {
        return this.slice(-search.length) === search
    }
}

function index_main() {
    $(document.body).on('click', '[data-lnk]', function (event) {
        var lnk = $(this).data('lnk')
        location = './view.html#' + lnk
    })
}

function view_main() {
    var pic = location.hash.substr(1)
    $('<img>', {
        'class': 'view',
        src: './media/pic/' + pic,
    })
    .appendTo('.column1')
    .click(function () {
        $(this).toggleClass('zoom')
    })
}

if (location.pathname.endsWith('/view.html')) {
    view_main()
}
else {
    index_main()
}
