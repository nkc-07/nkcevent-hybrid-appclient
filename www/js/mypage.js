/* ユーザ情報を表示するための処理 */
let sendMemberInfo
let myMemberId
let userIconChangeFlag = false
var reg = /^[a-z]{2}[0-9]*@mailg.denpa.ac.jp/

$(function() {
    // sweetalertの画面要素
    let modalDom = $('#modal').clone();
    $('#modal')[0].remove();

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

    $.ajax({
            url: 'http://192.168.137.1:8080/api/member/memberinfo.php', //送信先
            type: 'GET', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                token: localStorage.getItem('token')
            }
        })
        .done(function(response) {
            let memberInfo = response['data']['info']
            let memberTag = response['data']['tag']

            /* ユーザのステータスを変更するために使用 */
            sendMemberInfo = memberInfo
            myMemberId = memberInfo['member_id']
            console.log(sendMemberInfo)

            let birtday = memberInfo['birthday'].split('-')
            $('.user-icon').attr('src', 'http://192.168.137.1:8080/' + memberInfo['icon'])
            $('.nickname').val(memberInfo['nickname'])
            $('.mailaddress').val(memberInfo['mailaddress'])
            $('.target-year').text(birtday[0])
            $('.target-year').val(birtday[0])
            $('.target-month').text(birtday[1])
            $('.target-month').val(birtday[1])
            $('.target-date').text(birtday[2])
            $('.target-date').val(birtday[2])
            $(`input[value=${memberInfo['gender']}]`).prop('checked', true)

            getParticipationEvent()
        })
        .fail(function(response) {
            console.log('通信失敗')
            console.log(response)
        })

    $('#change-pas').click(function() {
        Swal.fire({
            title: 'パスワードの変更',
            html: modalDom.show(),
            showCancelButton: true,
            cancelButtonText: 'キャンセル',
            confirmButtonText: 'パスワードを変更',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                if (
                    $('#pass').val() === $('#repass').val() &&
                    $('#pass').val() &&
                    $('#repass').val()
                ) {
                    $.ajax({
                        url: 'http://192.168.137.1:8080/api/member/password.php', //送信先
                        type: 'POST', //送信方法
                        data: {
                            password: $('#modal').find('input[name="old-pass"]').val(),
                            token: localStorage.getItem('token')
                        },
                        datatype: 'json'
                    }).done(function(response) {
                        sendMemberInfo['new_password'] = $('#modal').find('input[name="pass"]').val();
                        sendMemberInfo['old_password'] = $('#modal').find('input[name="old-pass"]').val();
                        $('.check-pass').show();
                        Swal.fire({
                            title: 'パスワードの変更確認が出来ました',
                            icon: 'success'
                        })
                    }).fail(function(response) {
                        Swal.fire({
                            title: 'パスワードの変更確認が出来ませんでした',
                            icon: 'error'
                        })
                    })
                } else {
                    Swal.fire({
                        title: 'パスワードが一致しません。',
                        icon: 'error'
                    })
                }
            },
        })
    })

    $('.change-button').click(async function(e) {
        flg = true
            //入力判定
        if (
            $('.nickname').val() != '' &&
            $('.mailaddress').val() != '' &&
            reg.test($('.mailaddress').val()) &&
            $('[id=year]').val() != 0 &&
            $('[id=month]').val() != 0 &&
            $('[id=date]').val() != 0
        ) {
            sendMemberInfo['icon'] = await getUserIconName()
            sendMemberInfo['nickname'] = $('.nickname').val()
            sendMemberInfo['mailaddress'] = $('.mailaddress').val()
            sendMemberInfo['birthday'] =
                $('[id=year]').val() +
                '-' +
                $('[id=month]').val() +
                '-' +
                $('[id=date]').val()
            sendMemberInfo['gender'] = $('[name=gender]:checked')[0].value
            changePassword()
        } else {
            Swal.fire({
                icon: 'error',
                title: '注意',
                text: '正しく入力してください。'
            })
            flg = false
        }

        console.log(sendMemberInfo)
        if (flg) {
            $.ajax({
                    url: 'http://192.168.137.1:8080/api/member/memberinfo.php', //送信先
                    type: 'PUT', //送信方法
                    datatype: 'json', //受け取りデータの種類
                    data: sendMemberInfo
                })
                .done(function(response) {
                    Swal.fire({
                            icon: 'success',
                            title: 'プロフィールの変更に成功しました。'
                        })
                        .then(function() {
                            location.href = "";
                        });
                })
                .fail(function(response) {
                    console.log(response)
                })
        }
    })

    $('.cancel-button').click(function(e) {
        location.href = ''
    })
})

$('.icon-img, input[type="file"]').on('change', function(e) {
    userIconChangeFlag = true
    let reader = new FileReader()
    reader.onload = function(e) {
        $('.list-margin, .user-icon').attr('src', e.target.result)
    }
    reader.readAsDataURL(e.target.files[0])
})

function getParticipationEvent() {
    /* 参加イベントを表示するための処理 */
    let eventparticipationDom = $('.participation-event')

    $.ajax({
            url: 'http://192.168.137.1:8080/api/member/memberparticipation.php', //送信先
            type: 'GET', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                member_id: myMemberId,
                limit: 10,
                page: 1
            }
        })
        .done(function(response) {
            let eventCount = 0
            eventdataInfo = response.data

            eventdataInfo.some(function(card) {
                eventparticipationCloneDom = eventparticipationDom.clone()
                eventparticipationCloneDom
                    .find('a')
                    .attr(
                        'href',
                        cordova.file.applicationDirectory +
                        'www/event-list/detail/index.html?event-id=' +
                        card.event_id
                    )
                eventparticipationCloneDom.find('a').text(card.event_name)
                eventparticipationCloneDom.show()
                $('.participation-event:first').after(eventparticipationCloneDom)

                eventCount++
                if (eventCount >= 3) {
                    return true
                }
            })
            if (eventCount == 0) {
                eventparticipationDom.show()
                eventparticipationDom.find('a').remove()
                eventparticipationDom
                    .find('td')
                    .text('参加しているイベントはありません...')
            }
        })
        .fail(function(response) {
            console.log(response)
        })
}

function getUserIconName() {
    return new Promise(resolve => {
        var img = new Image()
        var reader = new FileReader()
        var file = $('.send-user-icon').prop('files')[0]

        if ($('.send-user-icon').prop('files')[0] === undefined) {
            resolve(sendMemberInfo['icon'])
        }
        if (!file.type.match(/^image\/(bmp|png|jpeg|gif)$/)) {
            alert('対応画像ファイル[bmp|png|jpeg|gif]')
            resolve(sendMemberInfo['icon'])
        }

        reader.onload = function(event) {
            img.onload = function() {
                var data = { data: img.src.split(',')[1] }
                if (userIconChangeFlag) {
                    $.ajax({
                            url: 'http://192.168.137.1:8080/api/event/image.php', //送信先
                            type: 'POST', //送信方法
                            data: {
                                name: file['name'],
                                image: data
                            }
                        })
                        .done(function(response) {
                            console.log('success')
                            console.log(response)

                            let imageName = JSON.parse(response)
                            resolve('http://192.168.137.1:8080/public/image/' + imageName['data'])
                        })
                        .fail(function(response) {
                            console.log('通信失敗')
                            console.log(response)

                            resolve(sendMemberInfo['icon'])
                        })
                }
            }
            img.src = event.target.result
        }
        reader.readAsDataURL(file)
    })
}

function changePassword() {
    if (
        sendMemberInfo.hasOwnProperty('old_password') &&
        sendMemberInfo.hasOwnProperty('new_password')
    ) {
        $.ajax({
            url: 'http://192.168.137.1:8080/api/member/password.php', //送信先
            type: 'PUT', //送信方法
            data: {
                old_password: sendMemberInfo['old_password'],
                new_password: sendMemberInfo['new_password'],
                token: localStorage.getItem('token')
            },
            datatype: 'json'
        }).done(function(response) {
            console.log(Response);
        }).fail(function(response) {
            console.log('通信失敗')
            console.log(response)
        })
    }

}