$('#qrcode').on('click', function() {
    QRScanner.prepare(onDone);
});

var done = function(err, status) {
    function displayContents(err, text) {
        if (err) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: '読み込めませんでした...',
            });
        } else {
            alert(text);
            QRScanner.destroy();
            $('main').show();
            $('body').css('background-color', ''); // qrcode実行時に追加されるものを初期状態に戻す
        }
    }

    if (err) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'アプリに使用制限がかかります...',
        });
    } else {
        $('main').hide();
        QRScanner.scan(displayContents);
        QRScanner.show(function(status) {
            console.log(status);
        });
    }
};

function onDone(err, status) {
    if (err) {
        console.error(err);
    }
    if (status.authorized) {
        QRScanner.prepare(done);
    } else if (status.denied) {
        // The video preview will remain black, and scanning is disabled. We can
        // try to ask the user to change their mind, but we'll have to send them
        // to their device settings with `QRScanner.openSettings()`.
    } else {
        // we didn't get permission, but we didn't get permanently denied. (On
        // Android, a denial isn't permanent unless the user checks the "Don't
        // ask again" box.) We can ask again at the next relevant opportunity.
    }
}