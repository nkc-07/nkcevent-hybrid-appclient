let getRequestParams = (new URL(document.location)).searchParams;

let myMembername;
let myMemberId;

var eventTags = [];
var host = [];
var eventDisplayStatus = 0;

//イベント情報
let geteventInfo = {
    eventid: getRequestParams.get('event-id'),
    eventname: undefined,
    eventcomment: undefined,
    map: undefined,
    image: undefined,
    postdate: undefined,
    deadlinedate: undefined,
    helddate: undefined,
    organizer_id: undefined,
    organizer_nickname: undefined,
    organizer_icon: undefined,
    eventcancellation: undefined,
    memberlimit: undefined
};

let sendeventInfo = {
    event_name: "Linux協会",
    event_kana: "りなっくすきょうかい",
    event_comment: "みんなもLinuxを使いこなせるようになろう！",
    map: "東京都大田区大森南５",
    image: "Linux.png",
    post_date: "2020-07-13",
    deadline_date: "2020-09-09",
    held_date: "2020-09-15",
    organizer_nickname: 1,
    member_limit: 30
}

$(function() {
    //ログインチェック
    $.ajax({
            url: 'http://52.196.112.175/api/member/logincheck.php', //送信先
            type: 'POST', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                token: localStorage.getItem('token')
            }
        })
        .done(function(response) {
            console.log(response.data.login);
            if (!response.data.login) { $('.participat').prop("disabled", true); } //参加ボタン無効化
        })
        .fail(function(response) {
            console.log('通信失敗');
            console.log(response);
            $('.participat').prop("disabled", true);
        })

    // 取得処理
    $.ajax({
            url: 'http://52.196.112.175/api/member/memberinfo.php', //送信先
            type: 'GET', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                token: localStorage.getItem('token')
            }
        })
        .done(function(response) {
            let memberInfo = response['data']['info'];
            /* ユーザのステータスを変更するために使用 */
            sendMemberInfo = memberInfo;
            myMembername = memberInfo['nickname']
            myMemberId = memberInfo['member_id']
                //$(".user-icon img").attr("src", memberInfo["icon"])
        })
        .fail(function(response) {
            console.log('通信失敗');
            console.log(response);
        })

    $.ajax({
            url: 'http://52.196.112.175/api/event/eventinfo.php', //送信先
            type: 'GET', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                'event_id': getRequestParams.get('event-id')
            }
        })
        .done(function(response) {
            eventdata = response.data.info[0]
            geteventInfo['eventid'] = eventdata.event_id;
            geteventInfo['eventname'] = eventdata.event_name;
            geteventInfo['eventcomment'] = eventdata.event_comment;
            geteventInfo['map'] = eventdata.map;
            geteventInfo['image'] = eventdata.image;
            geteventInfo['postdate'] = eventdata.post_date;
            geteventInfo['deadline_date'] = eventdata.deadline_date;
            geteventInfo['helddate'] = eventdata.held_date;
            geteventInfo['organizer_id'] = eventdata.organizer_id;
            geteventInfo['organizer_nickname'] = eventdata.organizer_nickname;
            geteventInfo['organizer_icon'] = eventdata.organizer_icon;
            geteventInfo['eventcancellation'] = eventdata.event_cancellation;
            geteventInfo['memberlimit'] = eventdata.member_limit;
            eventTags = response.data.event_tag;

            console.log(eventdata)

            $.ajax({
                    url: 'http://52.196.112.175/api/event/eventparticipant.php', //送信先
                    type: 'GET', //送信方法
                    datatype: 'json', //受け取りデータの種類
                    data: {
                        'event_id': getRequestParams.get('event-id')
                    }
                })
                .done(function(response) {
                    joindata = response.data

                    $('#now-member').text(joindata.length)

                    if (joindata.length >= geteventInfo['memberlimit']) {
                        eventDisplayStatus = 1;
                    }

                    joindata.forEach(function(e) {
                        if (e.member_id == myMemberId) {
                            eventDisplayStatus = 2
                        }
                    })

                    if (geteventInfo['organizer_id'] == myMemberId) {
                        eventDisplayStatus = 3
                        if (geteventInfo['eventcancellation'] == 0) {
                            //押せなくする
                            eventDisplayStatus = 5
                        }
                    }

                    $(".event-top .event-title").text(geteventInfo['eventname']);
                    $(".event-comment").html(marked(geteventInfo['eventcomment']));
                    $(".event-top .event-img").attr("src",geteventInfo["image"]);
                    $(".event-top .create-day").text(geteventInfo["postdate"])
                    $(".detail-box .day-box").attr("src", geteventInfo["deadlinedate"]);
                    $(".drawer-menu .drawer-brand").text(geteventInfo["postdate"]);
                    $(".googlemap-address").text(geteventInfo["map"]);
                    $('.googlemap-frame').attr('src', `https://maps.google.co.jp/maps?output=embed&q=${geteventInfo["map"]}`);
                    $('.googlemap-address').attr('href', `https://www.google.com/maps/search/?api=1&query=${geteventInfo["map"]}`);
                    $('#max-member').text(geteventInfo['memberlimit']);

                    //tag関係
                    let userTag = $('.tag-card');
                    eventTags.forEach(eventTag => {
                        let targetTag = userTag.clone()
                        targetTag.find('a').attr('href', '../../event-list/index.html?tag_id=' + eventTag.event_tag)
                        targetTag.find('span').text(eventTag.tag_name);
                        $(".clear-float").append(
                            targetTag.show()
                        );
                    });

                    //ユーザ名の追加
                    $(".user-icon span").text(geteventInfo["organizer_nickname"])
                    $(".user-icon img").attr("src",geteventInfo["organizer_icon"])

                    helddate = new Date(geteventInfo['helddate']);
                    let helddateday = ("0" + (helddate.getDate())).slice(-2);
                    let helddatemonth = ("0" + (helddate.getMonth() + 1)).slice(-2); // 仕様的に0~11なので1をプラス
                    let helddateYear = ("0" + (helddate.getFullYear())).slice(-4);
                    let helddateTime = `${helddate.getHours()}:${("0" + helddate.getMinutes()).slice(-2)}`;
                    $(".held-month").text(helddatemonth);
                    $(".held-day").text(helddateday);
                    $(".held-year").text(helddateYear);
                    $(".held-time").text(helddateTime);

                    let deadlinedate = new Date(geteventInfo['deadline_date']);
                    let deadlineDateday = ("0" + (deadlinedate.getDate())).slice(-2);
                    let deadlineDatemonth = ("0" + (deadlinedate.getMonth() + 1)).slice(-2); // 仕様的に0~11なので1をプラス
                    let deadlineDateYear = deadlinedate.getFullYear();
                    $(".deadline-month").text(deadlineDatemonth);
                    $(".deadline-day").text(deadlineDateday);
                    $(".deadline-year").text(deadlineDateYear);

                    console.log("eventDisplayStatus = " + eventDisplayStatus)
                    switch (eventDisplayStatus) {
                        case 5:
                            /* 主催者イベントでイベントがキャンセルされている処理 */
                            $(".participat").hide();
                            $(".cancellation").show();
                            $(".text-right .cancellation").css({ "background": "red" });
                            $("button.cancellation").prop('disabled', true)
                            break;
                        case 4:
                            break;
                        case 3:
                            /* 主催者イベント処理 */
                            $('.attendance').show();
                            $('.attendance').attr('href', `../../event-list/detail/attendance-confirmation/index.html?event-id=${getRequestParams.get('event-id')}`);
                            $(".participat").hide();
                            $(".cancellation").show();
                            $('.qrscan-active').show();
                            $(".cancellation").click(function() {
                                console.log("中止ボタン");
                                //↓通知処理
                                Swal.fire({
                                    title: 'イベントは中止しますか？',
                                    showCancelButton: true,
                                    confirmButtonText: "はい",
                                    cancelButtonText: 'いいえ',
                                    cancelButtonColor: '#4169E1',
                                    confirmButtonColor: '#ff0000'
                                }).then((result) => {
                                    console.log(result)
                                    if (result.value == true) {
                                        eventcancellation();
                                    }
                                })
                            })
                            break;
                        case 2:
                            /* 参加者イベント処理 */
                            $(".participat").hide();
                            $(".cancel").show();
                            $('.qrscan-active').show();
                            $(".cancel").click(function() {
                                Swal.fire({
                                    title: 'イベントに参加をキャンセルしますか？',
                                    showCancelButton: true,
                                    type: 'warning',
                                    confirmButtonText: "はい",
                                    cancelButtonText: 'いいえ',
                                    cancelButtonColor: '#4169E1',
                                    confirmButtonColor: '#ff0000'
                                }).then((result) => {
                                    eventcancel()

                                    Swal.fire({
                                        type: 'success',
                                        title: 'キャンセルしました'
                                    }).then((result) => {
                                        location.href = "";
                                    });
                                });
                            })
                            break;
                        case 1:
                            /* 定員数に達している処理 */
                            $('.participat').prop('disabled', true);
                            break;
                        case 0:
                            /* 通常イベント処理 */
                            $(".participat").click(function() {
                                Swal.fire({
                                    title: 'イベントに参加しますか？',
                                    type: 'question',
                                    showCancelButton: true,
                                    confirmButtonText: "はい",
                                    cancelButtonText: 'いいえ',
                                    cancelButtonColor: '#ff0000',
                                    confirmButtonColor: '#4169E1'
                                }).then((result) => {
                                    console.log(result)
                                    if (result.value == true) {
                                        console.log("イベントボタン");
                                        eventparticipation();

                                        Swal.fire({
                                            type: 'success',
                                            title: '参加登録を行いました'
                                        }).then((result) => {
                                            location.href = "";
                                        });
                                    }
                                })
                            })
                            break;
                        default:
                            break;
                    }
                })
                .fail(function(response) {
                    console.log('通信失敗');
                    console.log(response);
                })
        })
        .fail(function(response) {
            console.log('通信失敗');
            console.log(response);
        })

});

// 登録処理
function posteventdetail() {
    $.ajax({
            url: 'http://52.196.112.175/api/event/eventinfo.php', //送信先
            type: 'POST', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: sendeventInfo
        })
        .done(function(response) {
            console.log(response);
        })
        .fail(function(response) {
            console.log(response);
        })
}
// 更新処理
function Puteventdetail() {
    console.log("test");
    $.ajax({
            url: 'http://52.196.112.175/api/event/eventinfo.php', //送信先
            type: 'PUT', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: sendeventInfo
        })
        //通信成功
        .done(function(response) {
            console.log(response);
        })
        //通信失敗
        .fail(function(response) {
            console.log(response);
        })
}


/*↓ここからイベントボタン処理↓*/
//イベント参加処理
function eventparticipation() {
    $.ajax({
            url: 'http://52.196.112.175/api/event/eventparticipant.php', //送信先
            type: 'POST', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                token_id: localStorage.getItem('token'),
                event_id: getRequestParams.get('event-id')
            }
        })
        //通信成功
        .done(function(response) {
            console.log(response);
        })
        //通信失敗
        .fail(function(response) {
            console.log(response);
        })
}

//イベントキャンセル
function eventcancel() {
    $.ajax({
            url: 'http://52.196.112.175/api/event/eventparticipant.php', //送信先
            type: 'PUT', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                token_id: localStorage.getItem('token'),
                event_id: getRequestParams.get('event-id')
            }
        })
        //通信成功
        .done(function(response) {
            console.log(response);
            console.log("成功")
        })
        //通信失敗
        .fail(function(response) {
            console.log(response);
            console.log("失敗")
        })
}

//イベント中止(修正必要)
function eventcancellation() {
    $.ajax({
            url: 'http://52.196.112.175/api/event/eventcancellation.php', //送信先
            type: 'PUT', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                "event_id": getRequestParams.get('event-id'),
                "event_cancellation": 0
            }
        })
        //通信成功
        .done(function(response) {
            console.log(response);
            Swal.fire('中止されました').then((result) => {
                document.location.reload(true);
            });
        })
        //通信失敗
        .fail(function(response) {
            console.log(response);
        })
}