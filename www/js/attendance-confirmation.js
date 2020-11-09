let getRequestParams = (new URL(document.location)).searchParams;

let qrcodeValue;
let userList; // 出席するメンバーのリスト
let eventAttendanceId; // 主催者のID
let attendanceIcons = { // 出席状況のアイコンとテキスト
    0: {
        img: '../../../image/svg/question.svg',
        text: '未確認'
    },
    1: {
        img: '../../../image/svg/cross.svg',
        text: '欠席'
    },
    2: {
        img: '../../../image/svg/check.svg',
        text: '出席確認済み'
    }
};

let attendanceUserDom = $('.attendance-user');

var conn = new WebSocket('ws://localhost:81?mode=attendance&participation_event=' + getRequestParams.get('event-id'));
conn.onopen = function(e) {
    console.log("Connection established!");
};

conn.onmessage = function(e) {
    let memberData = JSON.parse(e.data)
    userList.find(function(element) {
        return memberData['participant_member'] == element.member_id
    }).is_attendance = memberData['status'];
    $('.member-id-' + memberData['participant_member'] + ' .svg').attr('src', attendanceIcons[memberData['status']].img);
    $('.member-id-' + memberData['participant_member'] + ' .dropdown-toggle').text(attendanceIcons[memberData['status']].text);
};

$(document).on('click', '.filtering .dropdown-item', function(e) {
    showAttendanceList($(this).val());
    var visibleItem = $('.dropdown-toggle', $(this).closest('.dropdown'));
    visibleItem.text($(this).text());
});

$(document).on('click', '.user-status .dropdown-item', function(e) {
    let sendJsonDate = {
        event_id: getRequestParams.get('event-id'),
        token_id: localStorage.getItem('token'),
        qrcode_value: qrcodeValue,
        target_member_id: $(this).parents('.attendance-user').attr('class').replace(/[^0-9]/g, ''),
        status: $(this).val()
    };
    conn.send(JSON.stringify(sendJsonDate));
});

$.ajax({
        url: 'http://192.168.137.1:8080/api/member/logincheck.php', //送信先
        type: 'POST', //送信方法
        datatype: 'json', //受け取りデータの種類
        data: {
            token: localStorage.getItem('token')
        }
    })
    .fail(function(response) {
        location.href = '../../../event-list/detail/?event-id=' + getRequestParams.get('event-id');
        console.log('通信失敗');
        console.log(response);
    })

$.ajax({
    url: 'http://192.168.137.1:8080/api/event/eventinfo.php', //送信先
    type: 'GET', //送信方法
    datatype: 'json', //受け取りデータの種類
    data: {
        'event_id': getRequestParams.get('event-id')
    }
}).done(function(response) {
    eventAttendanceId = response['data']['info'][0]['organizer_id'];
    $('.event-title').text(response['data']['info'][0]['event_name']);
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
        console.log(response)
        if (!response['data']['info']['member_id'] == eventAttendanceId) {
            location.href = '../../../event-list/detail/?event-id=' + getRequestParams.get('event-id');
        } else {
            $('.organizer-box img').attr('src', 'http://192.168.137.1:8080' + response['data']['info']['icon']);
            $('.organizer-box p').text(response['data']['info']['nickname']);
        }
    })
    .fail(function(response) {
        console.log('通信失敗');
        console.log(response);
    })

$.ajax({
        url: 'http://192.168.137.1:8080/api/event/eventattendance.php', //送信先
        type: 'GET', //送信方法
        datatype: 'json', //受け取りデータの種類
        data: {
            'event_id': getRequestParams.get('event-id')
        }
    })
    .done(function(response) {
        userList = response.data.info;
        qrcodeValue = response.data.qrcode;
        showAttendanceList("all");
        $('#qrcode-table').qrcode({
            width: 180,
            height: 180,
            text: qrcodeValue
        });
    })
    .fail(function(response) {
        console.log('通信失敗');
        console.log(response);
    })

$(function() {
    $('.detail-back-link').attr('href', '../../../event-list/detail/index.html?event-id=' + getRequestParams.get('event-id'));
})

function showAttendanceList(changeDisplay) {
    $('.attendance-list').empty();
    let loopFlag = true;
    userList.forEach(function(items) {
        if (items.is_attendance == changeDisplay || changeDisplay === "all") {
            tempAttendanceUserDom = attendanceUserDom.clone();
            tempAttendanceUserDom.addClass('member-id-' + items.member_id);
            tempAttendanceUserDom.find('.user-icon img').attr('src', 'http://192.168.137.1:8080' + items.icon);
            tempAttendanceUserDom.find('.svg').attr('src', attendanceIcons[items.is_attendance].img);
            tempAttendanceUserDom.find('.dropdown-toggle').text(attendanceIcons[items.is_attendance].text);
            tempAttendanceUserDom.find('.user-icon p').text(items.nickname);
            tempAttendanceUserDom.show();
            $('.attendance-list').append(tempAttendanceUserDom);

            loopFlag = false;
        }
    });

    if (loopFlag) {
        $('.attendance-list').text('該当するユーザーが存在しません');
    }
}