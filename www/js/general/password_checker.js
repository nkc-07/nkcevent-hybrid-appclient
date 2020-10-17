function chkPass(password) {
    var nScore = 0
    var nLength = 0
    var nAlphaUC = 0
    var nAlphaLC = 0
    var nNumber = 0
    var nMidChar = 0
    var nRequirements = 0
    var nRepChar = 0
    var nUnqChar = 0
    var nRepInc = 0
    var nMultConsecAlphaUC = 0
    var nConsecAlphaUC = 0
    var nConsecAlphaLC = 0
    var nConsecNumber = 0
    var nSeqAlpha = 0
    var nSeqNumber = 0
    var nReqChar = 0
    var nMultMidChar = 2
    var nMultConsecAlphaLC = 2
    var nMultConsecNumber = 2
    var nMultSeqAlpha = 3
    var nMultSeqNumber = 3
    var nMultLength = 4
    var nMultNumber = 4
    var nTmpAlphaUC = ''
    var nTmpAlphaLC = ''
    var nTmpNumber = ''
    var sAlphas = 'abcdefghijklmnopqrstuvwxyz'
    var sNumerics = '01234567890'
    var nMinPwdLen = 8

    if (password) {
        nScore = parseInt(password.length * nMultLength)
        nLength = password.length

        var arrPwd = password.replace(/\s+/g, '').split(/\s*/)
        var arrPwdLen = arrPwd.length

        /*パスワードをループして、記号、数値、小文字、大文字のパターンの一致を確認します*/

        for (var a = 0; a < arrPwdLen; a++) {
            //大文字のパターン
            if (arrPwd[a].match(/[A-Z]/g)) {
                if (nTmpAlphaUC !== '') {
                    if (nTmpAlphaUC + 1 == a) {
                        nConsecAlphaUC++
                    }
                }
                nTmpAlphaUC = a
                nAlphaUC++
            }
            //小文字のパターン
            else if (arrPwd[a].match(/[a-z]/g)) {
                if (nTmpAlphaLC !== '') {
                    if (nTmpAlphaLC + 1 == a) {
                        nConsecAlphaLC++
                    }
                }
                nTmpAlphaLC = a
                nAlphaLC++
            }
            //数値のパターン
            else if (arrPwd[a].match(/[0-9]/g)) {
                if (a > 0 && a < arrPwdLen - 1) {
                    nMidChar++
                }
                if (nTmpNumber !== '') {
                    if (nTmpNumber + 1 == a) {
                        nConsecNumber++
                    }
                }
                nTmpNumber = a
                nNumber++
            }

            /*繰り返し文字をチェックするためのパスワードによる内部ループ*/
            var bCharExists = false
            for (var b = 0; b < arrPwdLen; b++) {
                if (arrPwd[a] == arrPwd[b] && a != b) {
                    /*繰り返し文字が存在します*/
                    bCharExists = true
                    nRepInc += Math.abs(arrPwdLen / (b - a))
                }
            }
            if (bCharExists) {
                nRepChar++
                nUnqChar = arrPwdLen - nRepChar
                nRepInc = nUnqChar ? Math.ceil(nRepInc / nUnqChar) : Math.ceil(nRepInc)
            }
        }

        /* 連続したアルファ文字列パターンをチェックします（フォワードとリバース）*/
        for (var s = 0; s < 23; s++) {
            var sFwd = sAlphas.substring(s, parseInt(s + 3))
            var sRev = strReverse(sFwd)
            if (
                password.toLowerCase().indexOf(sFwd) != -1 ||
                password.toLowerCase().indexOf(sRev) != -1
            ) {
                nSeqAlpha++
            }
        }

        /*連続する数値文字列パターンをチェックします（順方向および逆方向）。*/
        for (var s = 0; s < 8; s++) {
            var sFwd = sNumerics.substring(s, parseInt(s + 3))
            var sRev = strReverse(sFwd)
            if (
                password.toLowerCase().indexOf(sFwd) != -1 ||
                password.toLowerCase().indexOf(sRev) != -1
            ) {
                nSeqNumber++
            }
        }

        /*使用量と要件に基づいて全体的なスコア値を変更する*/

        /*一般的なポイントの割り当て*/
        if (nAlphaUC > 0 && nAlphaUC < nLength) {
            //大文字
            nScore = parseInt(nScore + (nLength - nAlphaUC) * 2)
        }
        if (nAlphaLC > 0 && nAlphaLC < nLength) {
            //小文字
            nScore = parseInt(nScore + (nLength - nAlphaLC) * 2)
        }
        if (nNumber > 0 && nNumber < nLength) {
            //数字
            nScore = parseInt(nScore + nNumber * nMultNumber)
        }
        if (nMidChar > 0) {
            //記号
            nScore = parseInt(nScore + nMidChar * nMultMidChar)
        }

        /*貧弱な慣行に対するポイント控除*/

        if ((nAlphaLC > 0 || nAlphaUC > 0) /*&& nSymbol === 0*/ && nNumber === 0) {
            // 文字のみ
            nScore = parseInt(nScore - nLength)
        }
        if (nAlphaLC === 0 && nAlphaUC === 0 /*&& nSymbol === 0*/ && nNumber > 0) {
            // 数値のみ
            nScore = parseInt(nScore - nLength)
        }
        if (nRepChar > 0) {
            // 同じ文字が複数存在します
            nScore = parseInt(nScore - nRepInc)
        }
        if (nConsecAlphaUC > 0) {
            // 連続した大文字が存在する
            nScore = parseInt(nScore - nConsecAlphaUC * nMultConsecAlphaUC)
        }
        if (nConsecAlphaLC > 0) {
            // 連続した小文字が存在する
            nScore = parseInt(nScore - nConsecAlphaLC * nMultConsecAlphaLC)
        }
        if (nConsecNumber > 0) {
            //	連続した数値が存在する
            nScore = parseInt(nScore - nConsecNumber * nMultConsecNumber)
        }
        if (nSeqAlpha > 0) {
            // 連続したアルファ文字列が存在します（3文字以上）
            nScore = parseInt(nScore - nSeqAlpha * nMultSeqAlpha)
        }
        if (nSeqNumber > 0) {
            // 連続した数値が存在します(3文字以上)
            nScore = parseInt(nScore - nSeqNumber * nMultSeqNumber)
        }

        nRequirements = nReqChar

        if (password.length >= nMinPwdLen) {
            var nMinReqChars = 3
        } else {
            var nMinReqChars = 4
        }
        if (nRequirements > nMinReqChars) {
            // 必要な文字が1つ以上存在します
            nScore = parseInt(nScore + nRequirements * 2)
            sRequirements = '+ ' + parseInt(nRequirements * 2)
        }

        /*全体的なスコアに基づいて複雑さを決定する*/
        /*if (nScore > 100) { 
            nScore = 100; 
          } else if (nScore < 0) { 
            nScore = 0; 
          }*/

        /*更新されたスコア基準をクライアントに表示する*/

        //var score = '-' + parseInt(nScore * 5) + 'px'

        if (nScore > 0 && nScore < 100) {
            var score = parseInt(nScore) + '%'
            $('.scorebar').css('background-position', score + " 0")
        }
    }
}

function strReverse(str) {
    return str
        .split('')
        .reverse()
        .join('')
}