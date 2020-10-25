$(function() {
    $.ajax({ //ログインチェック
            url: 'http://192.168.137.1:8080/api/member/logincheck.php', //送信先
            type: 'POST', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                token: localStorage.getItem('token')
            }
        })
        .done(function(response) {
            if (!response.data.login) { location.href = '/www/'; }
        })
        .fail(function(response) {
            console.log('通信失敗');
            console.log(response);
            location.href = '/www/event-list/';
        })

    $('input[type="number"].member_limit').keyup(function(e) {
        if (
            Number($('.member_limit').val()) < 0 ||
            e.key == "-"
        ) {
            $('.member_limit').val("");
        }
    });
});

var simplemde = new SimpleMDE({
    renderingConfig: {
        markedOptions: {
            sanitize: true
        }
    },
    element: $("#markdown-editor")[0]
});

simplemde.codemirror.on('beforeChange', (instance, changes) => {
    if (simplemde.value().length >= 1000 &&
        changes.origin !== "+delete" &&
        changes.origin !== "setValue" // value()で再帰禁止用
    ) {
        changes.cancel();
        simplemde.value(simplemde.value().slice(0, 1000)); // コピペの場合、変化が見えないので1000文字文のみ前から置き換える
    }
});

/* イベントを作成するために使用する各情報を入れておくための変数 */
let createEventInfo = {
    'event_name': undefined,
    'event_kana': undefined,
    'event_comment': undefined,
    'map': undefined,
    'image': undefined,
    'post_date': undefined,
    'deadline_date': undefined,
    'held_date': undefined,
    'token_id': undefined,
    'member_limit': undefined
}

$.ajax({
    url: 'http://192.168.137.1:8080/api/member/memberinfo.php', //送信先
    type: 'GET', //送信方法
    datatype: 'json', //受け取りデータの種類
    data: {
        token: localStorage.getItem('token')
    }
}).done(function(response) {
    let memberInfo = response['data']['info'];

    $('.user-img').attr('src', memberInfo['icon']);
    $('.nickname').text(memberInfo['nickname']);

    createEventInfo['token_id'] = localStorage.getItem('token');
});

let citieNameTmp = undefined;
$('.postal-code').keyup(function(e) {
    let pattern = /^[0-9]{3}-?[0-9]{4}$/;
    if ($(this).val().match(pattern)) {
        $.ajax({
                url: 'http://zipcloud.ibsnet.co.jp/api/search',
                dataType: 'jsonp',
                data: {
                    'zipcode': $(this).val()
                }
            }) //通信成功
            .done(function(response) {
                console.log(response);
                if (
                    response.results != null &&
                    response.results.length == 1
                ) {
                    let citieName = response.results[0].address1 +
                        response.results[0].address2 +
                        response.results[0].address3;
                    $('.cities').val(citieName);
                    citieNameTmp = citieName;
                }
            })
            //通信失敗
            .fail(function(response) {
                console.log(response);
            })
    }
});


let nowTime = (new Date()).toISOString().split('T')[0];
$('.held-date').attr('min', nowTime + 'T00:00');
$('.deadline-date').attr('min', nowTime);
$('.held-date').change(function(e) {
    $('.deadline-date').attr('max', $(this).val().split('T')[0]);
    if ($('.deadline-date').val() != "" && $('.deadline-date').val() > $('.held-date').val()) {
        $('.deadline-date').val("");
    }

    let date = $(this).val().split('-');

    $('.held-month').text(date[1]);
    $('.held-day').text(date[2].split('T')[0]);
    $('.held-time').text(date[2].split('T')[1]);
});
$('.deadline-date').change(function(e) {
    if ($('.held-date').val() != "" && $('.deadline-date').val() > $('.held-date').val()) {
        $('.deadline-date').val("");
    }
});
let toDayObjcr = new Date();
let toDayStr = toDayObjcr.getFullYear() + '-' +
    toDayObjcr.getMonth() + '-' +
    toDayObjcr.getDate();
$('.create-day').text(toDayStr);
createEventInfo['post_date'] = toDayStr;

$('.send-event-img').on('change', function(e) {
    let reader = new FileReader();
    reader.onload = function(e) {
        $('.event-img').attr('src', e.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);
});

$('.participation-event').click(function(e) {
    //画像
    var img = new Image();
    var reader = new FileReader();
    var file = $('.send-event-img').prop('files')[0];
    console.log(file);
    if (file.type.match(/^image\/(bmp|png|jpeg|gif)$/) === null) {
        alert("対応画像ファイル[bmp|png|jpeg|gif]");
        return;
    }

    reader.onload = function(event) {
        img.onload = function() {
            var data = { data: img.src.split(',')[1] };
            $.ajax({
                url: 'http://192.168.137.1:8080/api/event/image.php', //送信先
                type: 'POST', //送信方法
                data: {
                    "name": file["name"],
                    "image": data,
                }
            }).done(function(response) {
                console.log('success');
                console.log(response);

                let imageName = JSON.parse(response);

                //イベント詳細
                createEventInfo['event_name'] = $('.event-name').val();
                createEventInfo['event_kana'] = 'test_kana';
                createEventInfo['event_comment'] = simplemde.value();
                if ($('.street-number').val() !== "") {
                    createEventInfo['map'] = citieNameTmp + $('.street-number').val();
                } else {
                    createEventInfo['map'] = undefined;
                }
                if (typeof $('.send-event-img').prop('files')[0] !== "undefined") {
                    createEventInfo['image'] = "http://192.168.137.1:8080/public/image/" + imageName['data'];
                }
                createEventInfo['deadline_date'] = $('.deadline-date').val();
                createEventInfo['held_date'] = $('.held-date').val();
                if (createEventInfo['deadline_date'] >= createEventInfo['held_date']) {
                    alert("締切日");
                    return;
                }
                if ($('.member_limit').val() >= 2) {
                    createEventInfo['member_limit'] = $('.member_limit').val();
                }

                $.ajax({
                    url: 'http://192.168.137.1:8080/api/event/eventinfo.php', //送信先
                    type: 'POST', //送信方法
                    datatype: 'json', //受け取りデータの種類
                    data: createEventInfo
                }).done(function(e) {
                    sendTag(e['data']);
                    location.href = '/www/event-list/'
                }).fail(function(e) {
                    console.log('通信失敗');
                    console.log(e);
                });
            }).fail(function(response) {
                console.log('通信失敗');
                console.log(response);
            });
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});