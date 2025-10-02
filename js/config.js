/**
 * アプリケーション設定・定数定義
 * メモ帳アプリで使用する設定値と定数を一元管理
 */

// ローカルストレージキー定数
const STORAGE_KEYS = {
    TEMPLATES: 'memoAppTemplates',
    SELECTED_TEMPLATES: 'memoAppSelectedTemplates'
};

// UI設定
const UI_CONFIG = {
    TEMPLATE_PREVIEW_LENGTH: 50,
    MEMO_HEIGHT: 400,
    SELECTED_BOX_MIN_HEIGHT: 220
};

// 日付フォーマット設定
const DATE_CONFIG = {
    WEEKDAYS: ['日', '月', '火', '水', '木', '金', '土'],
    DATE_SEPARATOR: '/',
    DATE_PLACEHOLDER_YYYY_MM_DD: 'yyyy/mm/dd',
    DATE_PLACEHOLDER_MM_DD: 'mm/dd'
};

// アクセシビリティ設定
const ACCESSIBILITY_CONFIG = {
    DOUBLE_TAP_THRESHOLD: 600,
    FOCUS_OUTLINE_COLOR: '#f59e0b',
    FOCUS_OUTLINE_WIDTH: '3px'
};