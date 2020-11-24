$(function() {
    $.ajax({
            url: 'http://52.196.112.175/api/event/eventpager.php', //送信先
            type: 'GET', //送信方法
            datatype: 'json', //受け取りデータの種類
            data: { limit: 30 }
        }).done(function(response) {
            let now = getRequestParams.get('page') == null ? 1 : getRequestParams.get('page');
            now = Number(now);

            generateGetUrl(now - 1, $('.pagination .back'));
            generateGetUrl(now + 1, $('.pagination .next'));
            let pagerItem = $('.pagination .page-item.list-item').clone();

            let pageCnt = Math.abs(
                now > 2 ?
                (now <= response.data.page_cunt - 2 ?
                    now - 1 : response.data.page_cunt - 2
                ) : 1
            );
            if (
                pageCnt < response.data.page_cunt &&
                now <= response.data.page_cunt &&
                now > 0
            ) {
                if (now != 1) {
                    $('.pagination .back').removeClass('disabled');
                }

                if (now > 2) {
                    addPagerItem(pagerItem.clone(), 1, false);
                    if (now != 3) {
                        addPagerItem(pagerItem.clone(), '...', true);
                    }
                }

                for (let i = 0; i < 3 && i < response.data.page_cunt; i++) {
                    let currentDom = addPagerItem(pagerItem.clone(), pageCnt, false);

                    if (now == pageCnt) {
                        currentDom.addClass('active');
                    }

                    pageCnt++;
                }

                if (now <= response.data.page_cunt - 2) {
                    if (now != response.data.page_cunt - 2) {
                        addPagerItem(pagerItem.clone(), '...', true);
                    }
                    addPagerItem(pagerItem.clone(), response.data.page_cunt, false);
                }

                if (now != response.data.page_cunt) {
                    $('.pagination .next').removeClass('disabled');
                }
            }
        })
        .fail(function(response) {
            console.log('通信失敗');
            console.log(response);
        })
})

function addPagerItem(dom, insertValue, is_disabled) {
    let pagerItemDom = dom.clone();
    $('.pagination .pahe-item-list').append(pagerItemDom.show());
    pagerItemDom.find('.page-link').text(insertValue);
    if (is_disabled) {
        pagerItemDom.addClass('disabled');
    }
    generateGetUrl(insertValue, pagerItemDom);

    return pagerItemDom;
}

function generateGetUrl(value, dom) {
    let pageGetRequest = location.search.split('&').find(
        element => element.match('page=*') !== null
    );

    if (pageGetRequest === undefined) {
        dom.find('a').attr('href', (location.search ? '&' : '?') + 'page=' + value);
    } else {
        dom.find('a').attr('href', location.href.replace(pageGetRequest, '?page=' + value));
    }
}