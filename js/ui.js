/**
 * UI・アクセシビリティ機能
 * 初期化、アクセシビリティ設定、キーボードナビゲーション、ダイアログ表示機能を提供
 */

/**
 * アプリケーション初期化
 */
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

/**
 * 日付情報を更新して表示する
 */
function updateDateInfo() {
    const now = new Date();
    const dateStr = now.getFullYear() + '年' +
                   String(now.getMonth() + 1).padStart(2, '0') + '月' +
                   String(now.getDate()).padStart(2, '0') + '日 (' +
                   DATE_CONFIG.WEEKDAYS[now.getDay()] + ')';
    document.getElementById('dateInfo').textContent = '今日の日付: ' + dateStr;
}

/**
 * アクセシビリティ設定
 */
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

/**
 * キーボードナビゲーション設定
 */
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

/**
 * タッチ操作最適化
 */
function optimizeTouchEvents() {
    // ダブルタップズーム無効化（ボタン領域）
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            // ダブルタップズーム防止
            const now = new Date().getTime();
            const timesince = now - (button.lastClick || 0);
            if (timesince < ACCESSIBILITY_CONFIG.DOUBLE_TAP_THRESHOLD && timesince > 0) {
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

/**
 * シニア向け確認ダイアログ
 * @param {string} message - 表示するメッセージ
 * @param {Function} onConfirm - 確認時のコールバック
 * @param {Function} onCancel - キャンセル時のコールバック
 */
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

// ページ読み込み時の初期化
window.onload = init;