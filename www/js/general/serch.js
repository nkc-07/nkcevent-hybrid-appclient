let getRequestParams = (new URL(document.location)).searchParams;
/* ソートの値変更に使う変数 */
let sortObject = {
    'recent_held_event': '直近開催イベント順',
    'recent_post_event': '登録イベント順'
};

function searchUrlGenerater() {
    $('[type=serch]').val(getRequestParams.get('event_name'));
    $('.dropdown-toggle').text(sortObject[getRequestParams.get('sort')]);

    let sendData = new Object;
    if (getRequestParams.get('event_name') !== null) {
        sendData.event_name = getRequestParams.get('event_name');
    }
    if (getRequestParams.get('tag_id') !== null) {
        sendData.tag_id = getRequestParams.get('tag_id');
    }
    if (getRequestParams.get('sort') !== null) {
        sendData.sort = getRequestParams.get('sort');
    }
    if (getRequestParams.get('page') !== null) {
        sendData.page = getRequestParams.get('page');
    } else {
        sendData.page = 1;
    }
    sendData.limit = 30;

    return sendData;
}

$(document).on('click', '.dropdown-menu .dropdown-item', function() {
    let sortGetRequest = location.search.split('&').find(
        element => element.match('sort=*') !== null
    );

    if (sortGetRequest === undefined) {
        location.href += (location.search ? '&' : '?') + 'sort=' + $(this).val();
    } else {
        location.href = location.href.replace(sortGetRequest, '?sort=' + $(this).val());
    }
});