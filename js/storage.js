/**
 * データ管理機能
 * ローカルストレージへのテンプレートと選択状態の保存・読み込み
 */

// グローバル変数（他のファイルでも使用）
let templates = {};
let selectedTemplate = null;
let selectedTemplates = new Set();

/**
 * テンプレートデータをローカルストレージから読み込む
 */
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
 * テンプレートデータをローカルストレージに保存する
 */
function saveTemplates() {
    try {
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch (error) {
        console.error('テンプレート保存エラー:', error);
        alert('データの保存に失敗しました: ' + error.message);
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