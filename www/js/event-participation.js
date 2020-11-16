let geteventInfo;
let eventparticipationDom;

$(function() {
    $.ajax({
            url: 'http://192.168.137.1:8080/api/member/memberinfo.php', //送信先
            type: 'GET', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: {
                token: localStorage.getItem('token')
            }
        })
        .done(function(response) {
            console.log(response)
            geteventInfo = response['data']['info'];

            // formのイベント
            eventparticipationDom = $(".mx-auto:first");
            geteventparticipation();
        }).fail(function(response) {
            console.log('通信失敗');
            console.log(response);
        });
});

// 取得処理
function geteventparticipation() {
    let sendData = searchUrlGenerater();
    sendData.member_id = geteventInfo['member_id'];
    $.ajax({
            url: 'http://192.168.137.1:8080/api/member/memberparticipation.php', //送信先
            type: 'GET', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: sendData
        })
        .done(function(response) {
            eventdataInfo = response.data
            console.log(eventdataInfo);
            // $(".card-box").empty();
            if (eventdataInfo.length > 0) {
                eventdataInfo.forEach(function(card) {
                    eventparticipationDom = eventparticipationDom.clone();
                    eventparticipationDom.find(".card-link").attr(
                        "href",
                        cordova.file.applicationDirectory +
                        "www/event-list/detail/index.html?event-id=" +
                        card.event_id
                    );
                    eventparticipationDom.find(".thumbnail img").attr("src", 'http://192.168.137.1:8080/' + card.image);
                    eventparticipationDom.find(".card-body .card-date").text(card.held_date)
                    eventparticipationDom.find(".card-body .card-title").text(card.event_name);
                    eventparticipationDom.find(".card-body card-map").text(card.map);
                    eventparticipationDom.find(".user-icon p").text(card.organizer);
                    eventparticipationDom.find(".user-icon img").attr("src", 'http://192.168.137.1:8080/' + card.icon);
                    eventparticipationDom.show();
                    $(".card-columns").append(eventparticipationDom);
                });
            } else {
                $('.card-columns .no-event').show();
            }
            /*
            $(eventparticipationDom).find(".card-body .card-title").text(eventdataInfo[1].event_name);
            $(eventparticipationDom).find(".card-body p").text(eventdataInfo[1].map);
            $(eventparticipationDom).find(".thumbnail p").text(eventdataInfo[1].held_date);
            $(eventparticipationDom).find(".user-icon p").text(eventdataInfo[1].organizer);
            */


            /*
            //tag関係
            eventTags.forEach(eventTag => {
                $(".clear-float ").append('<div class="tag-card"><img src="../../../image/tag_icon.jpg"><span>'+ eventTag.tag_name +'</span></div>');    
            });

            //ユーザ名の追加
            $(detailDom).find(".user-icon span").text(geteventInfo["organizer"])
            

            var helddate = geteventInfo["helddate"].split(' ');
            helddate = helddate[0].split('-');
            let helddateday = helddate[2];
            let helddatemonth = helddate[1];
            console.log(helddate);
            $(detailDom).find(".held-month").text(helddatemonth);
            $(detailDom).find(".held-day").text(helddateday);
            */
        })
        .fail(function(response) {
            console.log(response);
        })
}