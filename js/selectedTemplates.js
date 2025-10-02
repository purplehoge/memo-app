/**
 * 選択済みテンプレート管理機能
 * 選択済みテンプレートボックスの表示・編集・操作機能を提供
 */

/**
 * 選択済みテンプレートのテキストボックス群を描画する
 */
function renderSelectedTemplateBoxes() {
    const container = document.getElementById('selectedTemplateBoxes');
    container.innerHTML = '';

    selectedTemplates.forEach(templateName => {
        // 存在しないテンプレートはスキップ
        if (!templates[templateName]) {
            return;
        }

        // テンプレートボックスコンテナ作成
        const boxContainer = document.createElement('div');
        boxContainer.className = 'template-box-container';
        boxContainer.setAttribute('data-template', templateName);

        // テンプレート名ヘッダー
        const header = document.createElement('h4');
        header.className = 'template-box-header';
        header.textContent = `📝 ${templateName}`;

        // テキストエリア作成
        const textArea = document.createElement('textarea');
        textArea.className = 'template-box-textarea';
        textArea.id = `template-box-${templateName}`;
        textArea.value = templates[templateName];
        textArea.placeholder = `${templateName}の内容を編集...`;

        // ボタンコンテナ作成
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'template-box-buttons';

        // 日付付与ボタン
        const dateButton = document.createElement('button');
        dateButton.className = 'btn btn-secondary template-box-btn';
        dateButton.textContent = '📅';
        dateButton.title = '日付付与';
        dateButton.onclick = () => addDateToTemplateBox(templateName);

        // クリップボードコピーボタン
        const copyButton = document.createElement('button');
        copyButton.className = 'btn btn-primary template-box-btn';
        copyButton.textContent = '📋';
        copyButton.title = 'コピー';
        copyButton.onclick = () => copyTemplateToClipboard(templateName);

        // 保存ボタン
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-success template-box-btn';
        saveButton.textContent = '💾';
        saveButton.title = '保存';
        saveButton.onclick = () => saveIndividualTemplate(templateName);

        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger template-box-btn';
        deleteButton.textContent = '🗑️';
        deleteButton.title = '削除';
        deleteButton.onclick = () => deleteTemplateFromBox(templateName);

        // ボタンをコンテナに追加
        buttonContainer.appendChild(dateButton);
        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(deleteButton);

        // 要素組み立て
        boxContainer.appendChild(header);
        boxContainer.appendChild(textArea);
        boxContainer.appendChild(buttonContainer);

        container.appendChild(boxContainer);
    });
}

/**
 * 指定テンプレートボックスに日付を付与する
 * @param {string} templateName - 対象テンプレート名
 */
function addDateToTemplateBox(templateName) {
    const textArea = document.getElementById(`template-box-${templateName}`);
    if (!textArea) {
        alert('テンプレートボックスが見つかりません');
        return;
    }

    const now = new Date();
    const dateStr = now.getFullYear() + DATE_CONFIG.DATE_SEPARATOR +
                   String(now.getMonth() + 1).padStart(2, '0') + DATE_CONFIG.DATE_SEPARATOR +
                   String(now.getDate()).padStart(2, '0');

    let currentContent = textArea.value;

    if (!currentContent.trim()) {
        alert('テンプレートの内容がありません');
        return;
    }

    // 既存の日付付与ロジックを流用
    const monthDay = String(now.getMonth() + 1) + DATE_CONFIG.DATE_SEPARATOR + String(now.getDate());
    let mmddReplaced = currentContent.replace(/(?:^|(?<=\s))mm\/dd(?=\s|$)/gm, monthDay);
    let updatedContent = mmddReplaced.replace(/(?:^|(?<=\s))yyyy\/mm\/dd(?=\s|$)/gm, dateStr);

    if (mmddReplaced !== currentContent) {
        textArea.value = updatedContent;
        alert(`${templateName}のmm/dd を日付に置換しました: ${monthDay}`);
    } else if (updatedContent !== mmddReplaced) {
        textArea.value = updatedContent;
        alert(`${templateName}のyyyy/mm/dd を日付に置換しました: ${dateStr}`);
    } else {
        const hasExistingDate = /\d{4}\/\d{1,2}\/\d{1,2}|\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}/.test(currentContent);

        if (hasExistingDate) {
            alert('既存の日付が検出されたため、日付の追加は行いません');
        } else {
            const finalContent = `${dateStr}\n\n${currentContent}`;
            textArea.value = finalContent;
            alert(`${templateName}の先頭に日付を追加しました: ${dateStr}`);
        }
    }
}

/**
 * 指定テンプレートボックスの内容をクリップボードにコピーする
 * @param {string} templateName - 対象テンプレート名
 */
function copyTemplateToClipboard(templateName) {
    const textArea = document.getElementById(`template-box-${templateName}`);
    if (!textArea) {
        alert('テンプレートボックスが見つかりません');
        return;
    }

    const content = textArea.value;
    if (!content.trim()) {
        alert('コピーするテンプレート内容がありません');
        return;
    }

    navigator.clipboard.writeText(content)
        .then(() => {
            alert(`📋 ${templateName}をクリップボードにコピーしました`);
        })
        .catch(err => {
            console.error('クリップボードコピーエラー:', err);
            // フォールバック機能
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = content;
            document.body.appendChild(tempTextArea);
            tempTextArea.focus();
            tempTextArea.select();
            try {
                document.execCommand('copy');
                alert(`📋 ${templateName}をクリップボードにコピーしました`);
            } catch (fallbackErr) {
                alert('コピーに失敗しました');
            }
            document.body.removeChild(tempTextArea);
        });
}

/**
 * 個別テンプレートボックスの編集内容を保存する
 * @param {string} templateName - 対象テンプレート名
 */
function saveIndividualTemplate(templateName) {
    const textArea = document.getElementById(`template-box-${templateName}`);
    if (!textArea) {
        alert('テンプレートボックスが見つかりません');
        return;
    }

    const content = textArea.value;

    try {
        templates[templateName] = content;
        saveTemplates();
        renderTemplateList(); // 一覧のプレビュー更新
        alert(`💾 ${templateName}を保存しました`);
    } catch (error) {
        console.error('個別テンプレート保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
}

/**
 * 選択済みテンプレートボックスからテンプレートを削除する
 * @param {string} templateName - 削除対象テンプレート名
 */
function deleteTemplateFromBox(templateName) {
    // 確認ダイアログ表示
    const message = `テンプレート「${templateName}」を完全に削除しますか？\n\nこの操作は取り消すことができません。`;

    showSeniorConfirmDialog(message, () => {
        try {
            // テンプレート削除
            delete templates[templateName];

            // 選択状態からも削除
            selectedTemplates.delete(templateName);

            // データ永続化
            saveTemplates();
            saveSelectedTemplates();

            // 表示更新
            renderTemplateList();
            renderSelectedTemplateBoxes();

            alert(`🗑️ テンプレート「${templateName}」を削除しました`);
        } catch (error) {
            console.error('テンプレート削除エラー:', error);
            alert('削除に失敗しました: ' + error.message);
        }
    });
}