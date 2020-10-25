$(function() {
    // Ajax button click
    var reg = /^[a-z]{2}[0-9]*@mailg.denpa.ac.jp/

    // 登録ボタンを押したとき
    $('#sign-up').on('click', function() {
        $(function() {
            flg = true

            var h = $(window).height()

            $('#loader-bg ,#loader')
                .height(h)
                .css('display', 'block')

            //メールアドレスの正規表現、入力確認
            if (!$('input[name=mail]').val() ||
                $('input[name=mail]').val() == '' ||
                !reg.test($('input[name=mail]').val())
            ) {
                $('#mail-err').css('display', 'block')
                flg = false
            } else {
                $('#mail-err').css('display', 'none')
            }

            //パスワードの正規表現
            if (!$('input[name=pass]').val() ||
                $('input[name=pass]').val() == '' ||
                $('input[name=pass]').val().length < 7 ||
                !$('input[name=pass]')
                .val()
                .match(/^(?=.*?[a-zA-Z])(?=.*?\d)[a-zA-Z\d]{8,100}$/)
            ) {
                $('#pass-err').css('display', 'block')
                flg = false
            } else {
                $('#pass-err').css('display', 'none')
            }

            //パスワードの確認
            if (!$('input[name=repass]').val() ||
                $('input[name=repass]').val() == '' ||
                $('input[name=pass]').val() != $('input[name=repass]').val()
            ) {
                $('#repass-err').css('display', 'block')
                flg = false
            } else {
                $('#repass-err').css('display', 'none')
            }

            //ニックネームの入力確認
            if (!$('input[name=name]').val() || $('input[name=name]').val() == '') {
                $('#name-err').css('display', 'block')
                flg = false
            } else {
                $('#name-err').css('display', 'none')
            }

            //性別の入力確認
            if (!$('[name=gender]:checked').val() ||
                $('[name=gender]:checked').val() == ''
            ) {
                $('#gender-err').css('display', 'block')
                flg = false
            } else {
                $('#gender-err').css('display', 'none')
            }

            //生年月日の入力確認
            if (
                $('[id=year]').val() == 0 ||
                $('[id=month]').val() == 0 ||
                $('[id=date]').val() == 0
            ) {
                $('#birthday-err').css('display', 'block')
                flg = false
            } else {
                $('#birthday-err').css('display', 'none')
            }

            if (flg == true) {
                $.ajax({
                    url: 'http://192.168.137.1:8080/api/member/memberinfo.php',
                    type: 'POST',
                    data: {
                        mailaddress: $('input[name=mail]').val(),
                        password: $('input[name=pass]').val(),
                        nickname: $('input[name=name]').val(),
                        gender: $('[name=gender]:checked').val(),
                        birthday: $('[id=year]').val() +
                            '-' +
                            $('[id=month]').val() +
                            '-' +
                            $('[id=date]').val()
                    }
                })

                // Ajaxリクエストが成功した時発動
                .done(data => {
                        $('.result').html(data)
                        console.log(data)
                        location.href = '/public/html/index.html'
                    })
                    // Ajaxリクエストが失敗した時発動
                    .fail(data => {
                        $('.result').html(data)
                        console.log(data)
                        $('#loader-bg').css('display', 'none')
                        console.log(1)

                        // .always(data => {})
                    })
            } else {
                $('#loader-bg').css('display', 'none')
            }
        })
    })
})