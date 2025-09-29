let templates = {};
let selectedTemplate = null;
let selectedTemplates = new Set(); // 複数選択用（新機能）

// ローカルストレージキー定数
const STORAGE_KEYS = {
    TEMPLATES: 'memoAppTemplates',
    SELECTED_TEMPLATES: 'memoAppSelectedTemplates'
};

function init() {
    loadTemplates();
    selectedTemplates = loadSelectedTemplates(); // 選択状態復元
    updateDateInfo();
    renderTemplateList();
    renderSelectedTemplateBoxes(); // 選択済みテンプレートボックス描画
    setupAccessibility();
    setupKeyboardNavigation();
    optimizeTouchEvents();
}

function updateDateInfo() {
    const now = new Date();
    const dateStr = now.getFullYear() + '年' + 
                   String(now.getMonth() + 1).padStart(2, '0') + '月' + 
                   String(now.getDate()).padStart(2, '0') + '日 (' + 
                   ['日', '月', '火', '水', '木', '金', '土'][now.getDay()] + ')';
    document.getElementById('dateInfo').textContent = '今日の日付: ' + dateStr;
}

function loadTemplates() {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (saved) {
        try {
            templates = JSON.parse(saved);
        } catch (error) {
            console.error('テンプレートデータの読み込みに失敗:', error);
            templates = {};
        }
    }
}

/**
 * 選択状態をローカルストレージから復元する
 * @returns {Set<string>} 選択済みテンプレート名の集合
 */
function loadSelectedTemplates() {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_TEMPLATES);
    if (saved) {
        try {
            return new Set(JSON.parse(saved));
        } catch (error) {
            console.error('選択状態の読み込みに失敗:', error);
            return new Set();
        }
    }
    return new Set();
}

function saveTemplates() {
    try {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch (error) {
        console.error('テンプレート保存エラー:', error);
        alert('データの保存に失敗しました: ' + error.message);
    }
}

/**
 * 選択状態をローカルストレージに保存する
 */
function saveSelectedTemplates() {
    try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_TEMPLATES,
                           JSON.stringify(Array.from(selectedTemplates)));
    } catch (error) {
        console.error('選択状態保存エラー:', error);
    }
}

function renderTemplateList() {
    const list = document.getElementById('templateList');
    list.innerHTML = '';

    Object.keys(templates).forEach(name => {
        const item = document.createElement('div');
        item.className = 'template-item';

        // チェックボックス作成
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'template-checkbox';
        checkbox.checked = selectedTemplates.has(name);
        checkbox.onchange = () => toggleTemplateSelection(name);

        // チェックボックスラベル作成
        const label = document.createElement('label');
        label.className = 'template-checkbox-label';
        label.htmlFor = `checkbox-${name}`;
        checkbox.id = `checkbox-${name}`;

        // テンプレート内容エリア作成（チェックボックスとは分離）
        const contentDiv = document.createElement('div');
        contentDiv.className = 'template-content';
        contentDiv.onclick = () => selectTemplate(name); // 既存互換性維持

        const nameDiv = document.createElement('div');
        nameDiv.className = 'template-name';
        nameDiv.textContent = name;

        const previewDiv = document.createElement('div');
        previewDiv.className = 'template-preview';
        const preview = templates[name].length > 50 ?
                       templates[name].substring(0, 50) + '...' :
                       templates[name];
        previewDiv.textContent = preview;

        // 要素組み立て
        label.appendChild(checkbox);
        contentDiv.appendChild(nameDiv);
        contentDiv.appendChild(previewDiv);

        item.appendChild(label);
        item.appendChild(contentDiv);

        // 既存選択状態の表示（単一選択）
        if (selectedTemplate === name) {
            item.classList.add('selected');
        }

        // チェック状態の表示
        if (selectedTemplates.has(name)) {
            item.classList.add('checked');
        }

        list.appendChild(item);
    });
}

function selectTemplate(name) {
    selectedTemplate = name;
    document.getElementById('templateName').value = name;
    document.getElementById('memoText').value = templates[name];
    renderTemplateList();
}

/**
 * テンプレートのチェック状態を切り替える
 * @param {string} templateName - 対象テンプレート名
 */
function toggleTemplateSelection(templateName) {
    if (selectedTemplates.has(templateName)) {
        selectedTemplates.delete(templateName);
    } else {
        selectedTemplates.add(templateName);
    }

    // 状態保存と表示更新
    saveSelectedTemplates();
    renderTemplateList();
    renderSelectedTemplateBoxes();
}

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
        dateButton.textContent = '📅 日付付与';
        dateButton.onclick = () => addDateToTemplateBox(templateName);

        // クリップボードコピーボタン
        const copyButton = document.createElement('button');
        copyButton.className = 'btn btn-primary template-box-btn';
        copyButton.textContent = '📋 コピー';
        copyButton.onclick = () => copyTemplateToClipboard(templateName);

        // 保存ボタン
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-success template-box-btn';
        saveButton.textContent = '💾 保存';
        saveButton.onclick = () => saveIndividualTemplate(templateName);

        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger template-box-btn';
        deleteButton.textContent = '🗑️ 削除';
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
    const dateStr = now.getFullYear() + '/' +
                   String(now.getMonth() + 1).padStart(2, '0') + '/' +
                   String(now.getDate()).padStart(2, '0');
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' +
                   String(now.getMinutes()).padStart(2, '0');

    let currentContent = textArea.value;

    if (!currentContent.trim()) {
        alert('テンプレートの内容がありません');
        return;
    }

    // 既存の日付付与ロジックを流用
    const monthDay = String(now.getMonth() + 1) + '/' + String(now.getDate());
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
            const finalContent = `${dateStr} ${timeStr}\n\n${currentContent}`;
            textArea.value = finalContent;
            alert(`${templateName}の先頭に日付・時刻を追加しました: ${dateStr} ${timeStr}`);
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

    showConfirmDialog(message, () => {
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

function saveTemplate() {
    const name = document.getElementById('templateName').value.trim();
    const content = document.getElementById('memoText').value;
    
    if (!name) {
        alert('テンプレート名を入力してください');
        return;
    }
    
    templates[name] = content;
    saveTemplates();
    selectedTemplate = name;
    renderTemplateList();
    alert('テンプレートを保存しました: ' + name);
}

function deleteTemplate() {
    if (!selectedTemplate) {
        alert('削除するテンプレートを選択してください');
        return;
    }
    
    const templateName = selectedTemplate;
    showSeniorConfirmDialog(
        `テンプレート「${templateName}」を削除しますか？\n\nこの操作は取り消すことができません。`,
        () => {
            // 削除実行
            delete templates[templateName];
            saveTemplates();
            selectedTemplate = null;
            document.getElementById('templateName').value = '';
            document.getElementById('memoText').value = '';
            renderTemplateList();
            alert('テンプレートを削除しました');
        },
        () => {
            // キャンセル時
            alert('削除をキャンセルしました');
        }
    );
}

function addDateToMemo() {
    const now = new Date();
    const dateStr = now.getFullYear() + '/' +
                   String(now.getMonth() + 1).padStart(2, '0') + '/' +
                   String(now.getDate()).padStart(2, '0');
    
    const memoTextArea = document.getElementById('memoText');
    let currentContent = memoTextArea.value;
    
    if (!currentContent.trim()) {
        alert('メモの内容がありません');
        return;
    }
    
    // mm/dd形式の日付を当日の月/日で置換（0埋めなし）
    const monthDay = String(now.getMonth() + 1) + '/' + String(now.getDate());
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

function newMemo() {
    const now = new Date();
    const dateStr = now.getFullYear() + '/' + 
                   String(now.getMonth() + 1).padStart(2, '0') + '/' + 
                   String(now.getDate()).padStart(2, '0');
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + 
                   String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById('memoText').value = `${dateStr} ${timeStr}\n\n`;
    document.getElementById('templateName').value = '';
    selectedTemplate = null;
    renderTemplateList();
}

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

// アクセシビリティ設定
function setupAccessibility() {
    // タブインデックス設定
    const focusableElements = document.querySelectorAll('button, input, textarea');
    focusableElements.forEach((element, index) => {
        element.setAttribute('tabindex', index + 1);
    });
    
    // ARIAラベル設定
    document.getElementById('templateName').setAttribute('aria-label', 'テンプレート名入力');
    document.getElementById('memoText').setAttribute('aria-label', 'メモ内容入力');
    document.getElementById('templateList').setAttribute('aria-label', 'テンプレート一覧');
    
    // ボタンにaria-label追加
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
}

// キーボードナビゲーション設定
function setupKeyboardNavigation() {
    // Enterキーでボタン操作
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'BUTTON' && e.key === 'Enter') {
            e.target.click();
        }
    });
    
    // ショートカットキー
    document.addEventListener('keydown', function(e) {
        // Ctrl+S: テンプレート保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveTemplate();
        }
        
        // Ctrl+N: 新規メモ
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            newMemo();
        }
        
        // Ctrl+D: テンプレート削除
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            deleteTemplate();
        }
        
        // Esc: 選択解除
        if (e.key === 'Escape') {
            selectedTemplate = null;
            document.getElementById('templateName').value = '';
            renderTemplateList();
        }
    });
}

// タッチ操作最適化
function optimizeTouchEvents() {
    // ダブルタップズーム無効化（ボタン領域）
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            // ダブルタップズーム防止
            const now = new Date().getTime();
            const timesince = now - (button.lastClick || 0);
            if (timesince < 600 && timesince > 0) {
                e.preventDefault();
            }
            button.lastClick = now;
        }, { passive: false });
    });
    
    // スクロール領域の慣性スクロール有効化
    const scrollableElements = document.querySelectorAll('.template-list, textarea');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
        element.style.overflowScrolling = 'touch';
    });
}

// シニア向け確認ダイアログ
function showSeniorConfirmDialog(message, onConfirm, onCancel) {
    // 既存のダイアログがあれば削除
    const existingDialog = document.querySelector('.senior-confirm-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    const dialog = document.createElement('div');
    dialog.className = 'senior-confirm-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: white;
        padding: 32px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        max-width: 90%;
        max-height: 90%;
        text-align: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '確認';
    title.style.cssText = `
        margin: 0 0 20px 0;
        font-size: 24px;
        color: #1a1a1a;
        font-weight: 600;
    `;
    
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.cssText = `
        margin: 0 0 30px 0;
        font-size: 18px;
        line-height: 1.6;
        color: #1a1a1a;
        white-space: pre-wrap;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'はい';
    confirmButton.style.cssText = `
        background: #48bb78;
        color: white;
        border: none;
        padding: 16px 32px;
        min-height: 56px;
        min-width: 120px;
        font-size: 18px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'いいえ';
    cancelButton.style.cssText = `
        background: #e53e3e;
        color: white;
        border: none;
        padding: 16px 32px;
        min-height: 56px;
        min-width: 120px;
        font-size: 18px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    
    // ホバー効果
    confirmButton.addEventListener('mouseenter', () => {
        confirmButton.style.background = '#38a169';
        confirmButton.style.transform = 'translateY(-2px)';
    });
    confirmButton.addEventListener('mouseleave', () => {
        confirmButton.style.background = '#48bb78';
        confirmButton.style.transform = 'translateY(0)';
    });
    
    cancelButton.addEventListener('mouseenter', () => {
        cancelButton.style.background = '#c53030';
        cancelButton.style.transform = 'translateY(-2px)';
    });
    cancelButton.addEventListener('mouseleave', () => {
        cancelButton.style.background = '#e53e3e';
        cancelButton.style.transform = 'translateY(0)';
    });
    
    // イベントリスナー
    confirmButton.addEventListener('click', () => {
        dialog.remove();
        if (onConfirm) onConfirm();
    });
    
    cancelButton.addEventListener('click', () => {
        dialog.remove();
        if (onCancel) onCancel();
    });
    
    // ESCキーで閉じる
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            dialog.remove();
            document.removeEventListener('keydown', escHandler);
            if (onCancel) onCancel();
        }
    });
    
    // 組み立て
    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);
    dialogContent.appendChild(title);
    dialogContent.appendChild(messageElement);
    dialogContent.appendChild(buttonContainer);
    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);
    
    // フォーカス設定
    confirmButton.focus();
}

window.onload = init;