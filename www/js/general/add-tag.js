let searchTagInfo = undefined;
let targetTagInfo = undefined;
let sendTagList = Array();
let tagCardDom = $('.tag-card');

$(function() {
    $.ajax({
            type: "GET",
            url: "/api/other/tag.php",
            dataType: "json"
        })
        .done(function(response) {
            searchTagInfo = response;
        });

    let modalDom = $('#modal').clone();
    $('#modal')[0].remove();

    $('#tag-button').click(function() {
        modalDom.find('.tag-box .clear-float')[0].innerHTML = $('.detail-box .tag-box .clear-float')[0].innerHTML;
        Swal.fire({
            title: 'タグの追加',
            html: modalDom.show()
        }).then(function(result) {
            $('.detail-box .tag-box .clear-float')[0].innerHTML = $('#modal').find('.tag-box .clear-float')[0].innerHTML;
        });

        // ajax用の設定もあるが、matchedイベントを発火できないので別で取得
        $('.add-tag .tag-text').MySuggest({
            msArrayList: searchTagInfo['autocompleteInfo'],
            msRegExpAll: true
        });

        $('#modal .tag-text').off('selected matched');
        $('#modal .tag-text').on('selected matched', function() {
            targetTagInfo = searchTagInfo['tagInfo'].find(({ tag_name }) => tag_name == $(this).val());
            console.log(targetTagInfo)
        });

        $('#modal .tag-text').on('keyup', function(e) {
            if (e.which == 13) {
                addTag();
            }
        });

        $('#modal .add-tag-button').click(function() {
            addTag();
        });

        $('#modal').off('click', '.tag-card');
        $('#modal').on('click', '.tag-card', function(e) {
            deleteTag = $(this).find('span').text();
            sendTagList.forEach((element, index) => {
                if (element['tag_name'] === deleteTag) sendTagList.splice(index, 1);
            });

            $(this).remove();
        });
    });
});

function addTag() {
    if (targetTagInfo !== undefined) {
        let duplication = false
        duplication = sendTagList.find(({ tag_name }) => tag_name == targetTagInfo['tag_name']);

        if (duplication === undefined) {
            let tagCardDOmClone = tagCardDom.clone().show();
            tagCardDOmClone.find('span').text(targetTagInfo['tag_name']);
            $('#modal .tag-box .clear-float').append(tagCardDOmClone);

            sendTagList.push(targetTagInfo);
            console.log(sendTagList);

            targetTagInfo = undefined;
        }
    } else {
        let targetTagInfo = {
            tag_id: undefined,
            tag_name: $('.add-tag .tag-text').val()
        };
        duplication = sendTagList.find(({ tag_name }) => tag_name == targetTagInfo['tag_name']);

        if (duplication === undefined) {
            let tagCardDOmClone = tagCardDom.clone().show();
            tagCardDOmClone.find('span').text(targetTagInfo['tag_name']);
            $('#modal .tag-box .clear-float').append(tagCardDOmClone);

            sendTagList.push(targetTagInfo);
        }
    }
}

function sendTag(eventId) {
    sendTagList.forEach(async e => {
        if (e['tag_id'] === undefined) {
            e['tag_id'] = await newTag(e);
        }
        $.ajax({
            type: "POST",
            url: "/api/event/eventtag.php",
            dataType: "json",
            data: {
                event_id: eventId,
                event_tag: e['tag_id']
            }
        }).done(function() {
            console.log('success');
        });
    });
}

function newTag(newTagInfo) {
    return new Promise((resolve) => {
        $.ajax({
            type: "POST",
            url: "/api/other/tag.php",
            dataType: "json",
            data: {
                tag_name: newTagInfo['tag_name']
            }
        }).done(function(response) {
            // e['tag_id'] = response['data'];
            console.log(response['data']);
            resolve(response['data']);
        });
    });
}