let templates = {};
let selectedTemplate = null;

function init() {
    loadTemplates();
    updateDateInfo();
    renderTemplateList();
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
    
    if (confirm('テンプレート "' + selectedTemplate + '" を削除しますか？')) {
        delete templates[selectedTemplate];
        saveTemplates();
        selectedTemplate = null;
        document.getElementById('templateName').value = '';
        document.getElementById('memoText').value = '';
        renderTemplateList();
        alert('テンプレートを削除しました');
    }
}

function copyFromTemplate() {
    if (!selectedTemplate) {
        alert('コピーするテンプレートを選択してください');
        return;
    }
    
    const templateContent = templates[selectedTemplate];
    document.getElementById('memoText').value = templateContent;
    alert('テンプレートをコピーしました');
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
    
    // メモ内容のyyyy/mm/dd形式を当日日付で置換
    const updatedContent = currentContent.replace(/yyyy\/mm\/dd/g, dateStr);
    
    if (updatedContent === currentContent) {
        // yyyy/mm/ddが見つからない場合は、先頭に日付・時刻を付加
        const finalContent = `${dateStr} ${timeStr}\n\n${currentContent}`;
        memoTextArea.value = finalContent;
        alert('先頭に日付・時刻を追加しました: ' + dateStr + ' ' + timeStr);
    } else {
        // yyyy/mm/ddが見つかった場合は置換のみ
        memoTextArea.value = updatedContent;
        alert('yyyy/mm/dd を日付に置換しました: ' + dateStr);
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
    if (confirm('メモの内容をクリアしますか？')) {
        document.getElementById('memoText').value = '';
        document.getElementById('templateName').value = '';
        selectedTemplate = null;
        renderTemplateList();
    }
}

window.onload = init;