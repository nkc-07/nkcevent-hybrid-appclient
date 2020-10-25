$('.drawer').drawer({
    class: {
        nav: 'drawer-nav',
            toggle: 'drawer-toggle',
            overlay: 'drawer-overlay',
            open: 'drawer-open',
            close: 'drawer-close',
            dropdown: 'drawer-dropdown'
    },
    iscroll: {
        mouseWheel: true,
        preventDefault: false
    },
    showOverlay: true
});

if (localStorage.getItem('token') !== null) {
    $('.drawer-menu .login').show();
    $('.drawer-menu .no-login').hide();

    $('.logout').on('click', function() {
        $.ajax({
                url: 'http://192.168.137.1:8080/api/member/login.php', //送信先
                type: 'DELETE', //送信方法
                datatype: 'json', //受け取りデータの種類
                data: {
                    token: localStorage.getItem('token')
                }
            })
            .done(function(response) {
                console.log(response);
                localStorage.removeItem('token');

                location.href = '/public/html/';
            })
            .fail(function(response) {
                console.log('通信失敗');
                console.log(response);
            })
    });
}