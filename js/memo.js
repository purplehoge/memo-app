/**
 * メモ機能
 * メモエリアでの日付付加、新規作成、クリップボードコピー、クリア機能を提供
 */

/**
 * メモエリアに日付を付与する機能
 * 本文が空の場合でも日付を追加可能
 */
function addDateToMemo() {
    const now = new Date();
    const dateStr = now.getFullYear() + DATE_CONFIG.DATE_SEPARATOR +
                   String(now.getMonth() + 1).padStart(2, '0') + DATE_CONFIG.DATE_SEPARATOR +
                   String(now.getDate()).padStart(2, '0');

    const memoTextArea = document.getElementById('memoText');
    let currentContent = memoTextArea.value;

    // 本文が空の場合は日付のみを設定（最優先処理）
    if (!currentContent || currentContent.trim() === '') {
        memoTextArea.value = dateStr + '\n\n';
        alert('📅 日付を追加しました: ' + dateStr);
        return;
    }

    // mm/dd形式の日付を当日の月/日で置換（0埋めなし）
    const monthDay = String(now.getMonth() + 1) + DATE_CONFIG.DATE_SEPARATOR + String(now.getDate());
    // mm/ddのリテラル文字列のみ置換（独立した単語として存在する場合のみ）
    let mmddReplaced = currentContent.replace(/(?:^|(?<=\s))mm\/dd(?=\s|$)/gm, monthDay);

    // yyyy/mm/dd形式の完全パターン置換
    let updatedContent = mmddReplaced.replace(/(?:^|(?<=\s))yyyy\/mm\/dd(?=\s|$)/gm, dateStr);

    if (mmddReplaced !== currentContent) {
        // mm/dd形式が見つかった場合
        memoTextArea.value = updatedContent;
        alert('mm/dd を日付に置換しました: ' + monthDay);
    } else if (updatedContent !== mmddReplaced) {
        // yyyy/mm/ddのみが見つかった場合
        memoTextArea.value = updatedContent;
        alert('yyyy/mm/dd を日付に置換しました: ' + dateStr);
    } else {
        // プレースホルダが見つからない場合
        // 既存の日付パターン（YYYY/MM/DD、YYYY-MM-DD、MM/DD）をチェック
        const hasExistingDate = /\d{4}\/\d{1,2}\/\d{1,2}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}/.test(currentContent);

        if (hasExistingDate) {
            // 既存の日付がある場合は何もしない
            alert('既存の日付が検出されたため、日付の追加は行いません');
        } else {
            // 日付がない場合のみ、先頭に日付を付加
            const finalContent = `${dateStr}\n\n${currentContent}`;
            memoTextArea.value = finalContent;
            alert('先頭に日付を追加しました: ' + dateStr);
        }
    }
}

/**
 * 新規メモを作成する（日付付きで初期化）
 */
function newMemo() {
    const now = new Date();
    const dateStr = now.getFullYear() + DATE_CONFIG.DATE_SEPARATOR +
                   String(now.getMonth() + 1).padStart(2, '0') + DATE_CONFIG.DATE_SEPARATOR +
                   String(now.getDate()).padStart(2, '0');

    document.getElementById('memoText').value = `${dateStr}\n\n`;
    document.getElementById('templateName').value = '';
    selectedTemplate = null;
    renderTemplateList();
}

/**
 * メモの内容をクリップボードにコピーする
 */
function copyToClipboard() {
    const memoText = document.getElementById('memoText').value;

    if (!memoText.trim()) {
        alert('コピーするメモの内容がありません');
        return;
    }

    navigator.clipboard.writeText(memoText)
        .then(() => {
            alert('📋 クリップボードにコピーしました');
        })
        .catch(err => {
            console.error('クリップボードコピーエラー:', err);
            // フォールバック機能
            const textArea = document.createElement('textarea');
            textArea.value = memoText;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                alert('📋 クリップボードにコピーしました');
            } catch (fallbackErr) {
                alert('コピーに失敗しました');
            }
            document.body.removeChild(textArea);
        });
}

/**
 * メモの内容をクリアする
 */
function clearMemo() {
    const memoContent = document.getElementById('memoText').value;
    if (!memoContent.trim()) {
        alert('クリアするメモの内容がありません');
        return;
    }

    showSeniorConfirmDialog(
        'メモの内容をクリアしますか？\n\n入力した内容は失われます。',
        () => {
            // クリア実行
            document.getElementById('memoText').value = '';
            document.getElementById('templateName').value = '';
            selectedTemplate = null;
            renderTemplateList();
            alert('メモの内容をクリアしました');
        },
        () => {
            // キャンセル時
            alert('クリアをキャンセルしました');
        }
    );
}