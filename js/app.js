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
    
    const now = new Date();
    const dateStr = now.getFullYear() + '/' + 
                   String(now.getMonth() + 1).padStart(2, '0') + '/' + 
                   String(now.getDate()).padStart(2, '0');
    
    const templateContent = templates[selectedTemplate];
    const newContent = `${dateStr}\n\n${templateContent}`;
    
    document.getElementById('memoText').value = newContent;
    // 修正: テンプレート選択状態を維持
    // selectedTemplate と templateName の値はそのまま保持
    alert('テンプレートをコピーしました。同じテンプレートを再利用できます。');
}

function newMemo() {
    const now = new Date();
    const dateStr = now.getFullYear() + '/' + 
                   String(now.getMonth() + 1).padStart(2, '0') + '/' + 
                   String(now.getDate()).padStart(2, '0');
    
    document.getElementById('memoText').value = dateStr + '\n\n';
    document.getElementById('templateName').value = '';
    selectedTemplate = null;
    renderTemplateList();
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