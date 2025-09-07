let templates = {};
let selectedTemplate = null;

function init() {
    loadTemplates();
    updateDateInfo();
    renderTemplateList();
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
    const saved = localStorage.getItem('memoAppTemplates');
    if (saved) {
        try {
            templates = JSON.parse(saved);
        } catch (error) {
            console.error('テンプレートデータの読み込みに失敗:', error);
            templates = {};
        }
    }
}

function saveTemplates() {
    try {
        localStorage.setItem('memoAppTemplates', JSON.stringify(templates));
    } catch (error) {
        console.error('テンプレート保存エラー:', error);
        alert('データの保存に失敗しました: ' + error.message);
    }
}

function renderTemplateList() {
    const list = document.getElementById('templateList');
    list.innerHTML = '';
    
    Object.keys(templates).forEach(name => {
        const item = document.createElement('div');
        item.className = 'template-item';
        item.onclick = () => selectTemplate(name);
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'template-name';
        nameDiv.textContent = name;
        
        const previewDiv = document.createElement('div');
        previewDiv.className = 'template-preview';
        const preview = templates[name].length > 50 ? 
                       templates[name].substring(0, 50) + '...' : 
                       templates[name];
        previewDiv.textContent = preview;
        
        item.appendChild(nameDiv);
        item.appendChild(previewDiv);
        
        if (selectedTemplate === name) {
            item.classList.add('selected');
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
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + 
                   String(now.getMinutes()).padStart(2, '0');
    
    const memoTextArea = document.getElementById('memoText');
    let currentContent = memoTextArea.value;
    
    if (!currentContent.trim()) {
        alert('メモの内容がありません');
        return;
    }
    
    // mm/dd形式の日付を当日の月/日で置換（0埋めなし）
    const monthDay = String(now.getMonth() + 1) + '/' + String(now.getDate());
    const mmddReplaced = currentContent.replace(/\b\d{1,2}\/\d{1,2}\b/g, monthDay);
    
    // メモ内容のyyyy/mm/dd形式を当日日付で置換
    let updatedContent = mmddReplaced.replace(/yyyy\/mm\/dd/g, dateStr);
    
    if (mmddReplaced !== currentContent) {
        // mm/dd形式が見つかった場合
        memoTextArea.value = updatedContent;
        alert('mm/dd を日付に置換しました: ' + monthDay);
    } else if (updatedContent !== mmddReplaced) {
        // yyyy/mm/ddのみが見つかった場合
        memoTextArea.value = updatedContent;
        alert('yyyy/mm/dd を日付に置換しました: ' + dateStr);
    } else {
        // どちらも見つからない場合は、先頭に日付・時刻を付加
        const finalContent = `${dateStr} ${timeStr}\n\n${currentContent}`;
        memoTextArea.value = finalContent;
        alert('先頭に日付・時刻を追加しました: ' + dateStr + ' ' + timeStr);
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