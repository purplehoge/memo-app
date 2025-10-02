/**
 * テンプレート管理機能
 * テンプレートの表示、選択、保存、削除機能を提供
 */

/**
 * テンプレート一覧を描画する
 */
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
        const preview = templates[name].length > UI_CONFIG.TEMPLATE_PREVIEW_LENGTH ?
                       templates[name].substring(0, UI_CONFIG.TEMPLATE_PREVIEW_LENGTH) + '...' :
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

/**
 * テンプレートを選択してメモエリアに表示する
 * @param {string} name - 選択するテンプレート名
 */
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
 * 全テンプレートを一括チェック
 */
function selectAllTemplates() {
    const templateNames = Object.keys(templates);

    if (templateNames.length === 0) {
        alert('チェックするテンプレートがありません');
        return;
    }

    // 全テンプレートをselectedTemplatesに追加
    templateNames.forEach(name => {
        selectedTemplates.add(name);
    });

    // 状態保存と表示更新
    saveSelectedTemplates();
    renderTemplateList();
    renderSelectedTemplateBoxes();

    alert(`☑️ ${templateNames.length}個のテンプレートを一括チェックしました`);
}

/**
 * 全テンプレートのチェックを一括解除
 */
function clearAllTemplates() {
    if (selectedTemplates.size === 0) {
        alert('チェックを解除するテンプレートがありません');
        return;
    }

    const previousCount = selectedTemplates.size;

    // 全選択状態をクリア
    selectedTemplates.clear();

    // 状態保存と表示更新
    saveSelectedTemplates();
    renderTemplateList();
    renderSelectedTemplateBoxes();

    alert(`☐ ${previousCount}個のテンプレートのチェックを一括解除しました`);
}

/**
 * テンプレートを保存する
 */
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

    // 選択済みテンプレートボックスも更新する
    renderSelectedTemplateBoxes();

    alert('テンプレートを保存しました: ' + name);
}

/**
 * 選択中のテンプレートを削除する
 */
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

            // 選択状態からも削除
            selectedTemplates.delete(templateName);

            saveTemplates();
            saveSelectedTemplates();
            selectedTemplate = null;
            document.getElementById('templateName').value = '';
            document.getElementById('memoText').value = '';
            renderTemplateList();

            // 選択済みテンプレートボックスも更新する
            renderSelectedTemplateBoxes();

            alert('テンプレートを削除しました');
        },
        () => {
            // キャンセル時
            alert('削除をキャンセルしました');
        }
    );
}