$('#qrcode').on('click', function() {
    Swal.fire({
        title: '出席登録確認',
        html: $('#qrcode-modal')[0].innerHTML,
        showConfirmButton: false,
    })
    $('#qrcode-btn .btn-success').click(function() {
        QRScanner.prepare(onDone);
        swal.close()
    });
    $('#qrcode-btn .btn-danger').click(function() {
        Swal.fire({
            title: '本当に欠席登録を行いますか？',
            icon: 'warning',
            text: '一度登録すると主催者に連絡しない限り取り消すことができません。',
            showCancelButton: true,
            confirmButtonText: "はい",
            cancelButtonText: 'いいえ',
            cancelButtonColor: '#4169E1',
            confirmButtonColor: '#ff0000'
        }).then((result) => {
            if (result.value) {
                Swal.fire({
                    icon: 'success',
                    title: '欠席登録を行いました',
                })
            } else {
                swal.close()
            }
        })
    })
    $('#qrcode-btn .btn-secondary').click(function() {
        swal.close()
    })
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
            var conn = new WebSocket('ws://192.168.137.1:81?mode=attendance&participation_event=' + getRequestParams.get('event-id'));
            var memberData;
            conn.onopen = function(e) {

                let sendJsonDate = {
                    event_id: getRequestParams.get('event-id'),
                    token_id: localStorage.getItem('token'),
                    qrcode_value: text,
                    status: 2
                };

                conn.send(JSON.stringify(sendJsonDate));

                console.log(JSON.stringify(sendJsonDate));

                conn.onmessage = function(e) {
                    memberData = JSON.parse(e.data)
                    console.log(e);
                };
            };

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