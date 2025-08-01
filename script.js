class JSONFormatter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.jsonInput = document.getElementById('jsonInput');
        this.jsonOutput = document.getElementById('jsonOutput');
        this.formatBtn = document.getElementById('formatBtn');
        this.unescapeBtn = document.getElementById('unescapeBtn');
        this.compressBtn = document.getElementById('compressBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
    }

    bindEvents() {
        this.formatBtn.addEventListener('click', () => this.formatJSON());
        this.unescapeBtn.addEventListener('click', () => this.unescapeJSON());
        this.compressBtn.addEventListener('click', () => this.compressJSON());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyBtn.addEventListener('click', () => this.copyResult());
        
    }

    formatJSON() {
        const input = this.jsonInput.value.trim();
        if (!input) {
            this.showError('请输入JSON数据');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const formatted = this.createFormattedHTML(parsed, 0, null, false);
            this.displayResult(formatted);
        } catch (error) {
            this.showError(`JSON格式错误: ${error.message}`);
        }
    }

    createFormattedHTML(obj, level = 0, key = null, parentHandlesToggle = false) {
        const indent = '    '.repeat(level);
        const nextIndent = '    '.repeat(level + 1);
        
        if (obj === null) {
            return `<span class="json-null">null</span>`;
        }
        
        if (typeof obj === 'string') {
            return `<span class="json-string">"${this.escapeHTML(obj)}"</span>`;
        }
        
        if (typeof obj === 'number') {
            return `<span class="json-number">${obj}</span>`;
        }
        
        if (typeof obj === 'boolean') {
            return `<span class="json-boolean">${obj}</span>`;
        }
        
        if (Array.isArray(obj)) {
            if (obj.length === 0) {
                return '<span class="json-bracket">[]</span>';
            }
            
            // Don't add toggle button for nested values, let parent handle it
            if (parentHandlesToggle || level === 0) {
                const id = this.generateId();
                let html = `<span class="json-line">`;
                if (!parentHandlesToggle) {
                    html += `<button class="json-toggle expanded" data-target="${id}"></button>`;
                }
                html += `<span class="json-bracket">[</span>`;
                html += `<div class="json-children" id="${id}">`;
                
                obj.forEach((item, index) => {
                    html += `\n${nextIndent}<div class="json-array-item">`;
                    html += this.createFormattedHTML(item, level + 1, null, false);
                    if (index < obj.length - 1) {
                        html += ',';
                    }
                    html += '</div>';
                });
                
                html += `\n${indent}</div><span class="json-bracket">]</span></span>`;
                return html;
            } else {
                const id = this.generateId();
                let html = `<span class="json-bracket">[</span>`;
                html += `<div class="json-children" id="${id}">`;
                obj.forEach((item, index) => {
                    html += `\n${nextIndent}<div class="json-array-item">`;
                    html += this.createFormattedHTML(item, level + 1, null, true);
                    if (index < obj.length - 1) {
                        html += ',';
                    }
                    html += '</div>';
                });
                html += `\n${indent}</div><span class="json-bracket">]</span>`;
                return html;
            }
        }
        
        if (typeof obj === 'object') {
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return '<span class="json-bracket">{}</span>';
            }
            
            // Don't add toggle button for nested values, let parent handle it
            if (parentHandlesToggle || level === 0) {
                const id = this.generateId();
                let html = `<span class="json-line">`;
                if (!parentHandlesToggle) {
                    html += `<button class="json-toggle expanded" data-target="${id}"></button>`;
                }
                html += `<span class="json-bracket">{</span>`;
                html += `<div class="json-children" id="${id}">`;
                
                keys.forEach((k, index) => {
                    const value = obj[k];
                    const isComplexValue = (Array.isArray(value) && value.length > 0) ||
                                         (typeof value === 'object' && value !== null && Object.keys(value).length > 0);

                    console.log(`Processing key: ${k}, isComplexValue: ${isComplexValue}, value:`, value);

                    html += `\n${nextIndent}<div class="json-property">`;

                    if (isComplexValue) {
                        const childId = this.generateId();
                        console.log(`Creating toggle for ${k} with id: ${childId}`);
                        html += `<button class="json-toggle expanded" data-target="${childId}"></button>`;
                        html += `<span class="json-key">"${this.escapeHTML(k)}"</span>: `;

                        if (Array.isArray(value)) {
                            html += `<span class="json-bracket">[</span>`;
                            html += `<div class="json-children" id="${childId}">`;
                            value.forEach((item, itemIndex) => {
                                html += `\n${nextIndent}  <div class="json-array-item">`;
                                html += this.createFormattedHTML(item, level + 2, null, true);
                                if (itemIndex < value.length - 1) {
                                    html += ',';
                                }
                                html += '</div>';
                            });
                            html += `\n${nextIndent}</div><span class="json-bracket">]</span>`;
                        } else {
                            html += `<span class="json-bracket">{</span>`;
                            html += `<div class="json-children" id="${childId}">`;
                            const objKeys = Object.keys(value);
                            objKeys.forEach((objKey, objIndex) => {
                                const objValue = value[objKey];
                                const isNestedComplex = (Array.isArray(objValue) && objValue.length > 0) ||
                                                     (typeof objValue === 'object' && objValue !== null && Object.keys(objValue).length > 0);

                                html += `\n${nextIndent}  <div class="json-property">`;

                                if (isNestedComplex) {
                                    const nestedId = this.generateId();
                                    console.log(`Creating nested toggle for ${objKey} with id: ${nestedId}`);
                                    html += `<button class="json-toggle expanded" data-target="${nestedId}"></button>`;
                                    html += `<span class="json-key">"${this.escapeHTML(objKey)}"</span>: `;

                                    if (Array.isArray(objValue)) {
                                        html += `<span class="json-bracket">[</span>`;
                                        html += `<div class="json-children" id="${nestedId}">`;
                                        objValue.forEach((item, itemIndex) => {
                                            html += `\n${nextIndent}    <div class="json-array-item">`;
                                            html += this.createFormattedHTML(item, level + 3, null, true);
                                            if (itemIndex < objValue.length - 1) {
                                                html += ',';
                                            }
                                            html += '</div>';
                                        });
                                        html += `\n${nextIndent}  </div><span class="json-bracket">]</span>`;
                                    } else {
                                        html += `<span class="json-bracket">{</span>`;
                                        html += `<div class="json-children" id="${nestedId}">`;
                                        const nestedObjKeys = Object.keys(objValue);
                                        nestedObjKeys.forEach((nestedKey, nestedIndex) => {
                                            const nestedValue = objValue[nestedKey];
                                            html += `\n${nextIndent}    <div class="json-property">`;
                                            html += `<span class="json-key">"${this.escapeHTML(nestedKey)}"</span>: `;
                                            html += this.createFormattedHTML(nestedValue, level + 3, nestedKey, true);
                                            if (nestedIndex < nestedObjKeys.length - 1) {
                                                html += ',';
                                            }
                                            html += '</div>';
                                        });
                                        html += `\n${nextIndent}  </div><span class="json-bracket">}</span>`;
                                    }
                                } else {
                                    html += `<span class="json-key">"${this.escapeHTML(objKey)}"</span>: `;
                                    html += this.createFormattedHTML(objValue, level + 2, objKey, true);
                                }

                                if (objIndex < objKeys.length - 1) {
                                    html += ',';
                                }
                                html += '</div>';
                            });
                            html += `\n${nextIndent}</div><span class="json-bracket">}</span>`;
                        }
                    } else {
                        html += `<span class="json-key">"${this.escapeHTML(k)}"</span>: `;
                        html += this.createFormattedHTML(value, level + 1, k, true);
                    }

                    if (index < keys.length - 1) {
                        html += ',';
                    }
                    html += '</div>';
                });
                
                html += `\n${indent}</div><span class="json-bracket">}</span></span>`;
                return html;
            } else {
                let html = `<span class="json-bracket">{</span>`;
                keys.forEach((k, index) => {
                    const value = obj[k];
                    const isComplexValue = (Array.isArray(value) && value.length > 0) ||
                                         (typeof value === 'object' && value !== null && Object.keys(value).length > 0);

                    html += `\n${nextIndent}<div class="json-property">`;

                    if (isComplexValue) {
                        const childId = this.generateId();
                        html += `<button class="json-toggle expanded" data-target="${childId}"></button>`;
                        html += `<span class="json-key">"${this.escapeHTML(k)}"</span>: `;

                        if (Array.isArray(value)) {
                            html += `<span class="json-bracket">[</span>`;
                            html += `<div class="json-children" id="${childId}">`;
                            value.forEach((item, itemIndex) => {
                                html += `\n${nextIndent}  <div class="json-array-item">`;
                                html += this.createFormattedHTML(item, level + 2, null, true);
                                if (itemIndex < value.length - 1) {
                                    html += ',';
                                }
                                html += '</div>';
                            });
                            html += `\n${nextIndent}</div><span class="json-bracket">]</span>`;
                        } else {
                            html += `<span class="json-bracket">{</span>`;
                            html += `<div class="json-children" id="${childId}">`;
                            const objKeys = Object.keys(value);
                            objKeys.forEach((objKey, objIndex) => {
                                const objValue = value[objKey];
                                const isNestedComplex = (Array.isArray(objValue) && objValue.length > 0) ||
                                                     (typeof objValue === 'object' && objValue !== null && Object.keys(objValue).length > 0);

                                html += `\n${nextIndent}  <div class="json-property">`;

                                if (isNestedComplex) {
                                    const nestedId = this.generateId();
                                    console.log(`Creating nested toggle for ${objKey} with id: ${nestedId}`);
                                    html += `<button class="json-toggle expanded" data-target="${nestedId}"></button>`;
                                    html += `<span class="json-key">"${this.escapeHTML(objKey)}"</span>: `;

                                    if (Array.isArray(objValue)) {
                                        html += `<span class="json-bracket">[</span>`;
                                        html += `<div class="json-children" id="${nestedId}">`;
                                        objValue.forEach((item, itemIndex) => {
                                            html += `\n${nextIndent}    <div class="json-array-item">`;
                                            html += this.createFormattedHTML(item, level + 3, null, true);
                                            if (itemIndex < objValue.length - 1) {
                                                html += ',';
                                            }
                                            html += '</div>';
                                        });
                                        html += `\n${nextIndent}  </div><span class="json-bracket">]</span>`;
                                    } else {
                                        html += `<span class="json-bracket">{</span>`;
                                        html += `<div class="json-children" id="${nestedId}">`;
                                        const nestedObjKeys = Object.keys(objValue);
                                        nestedObjKeys.forEach((nestedKey, nestedIndex) => {
                                            const nestedValue = objValue[nestedKey];
                                            html += `\n${nextIndent}    <div class="json-property">`;
                                            html += `<span class="json-key">"${this.escapeHTML(nestedKey)}"</span>: `;
                                            html += this.createFormattedHTML(nestedValue, level + 3, nestedKey, true);
                                            if (nestedIndex < nestedObjKeys.length - 1) {
                                                html += ',';
                                            }
                                            html += '</div>';
                                        });
                                        html += `\n${nextIndent}  </div><span class="json-bracket">}</span>`;
                                    }
                                } else {
                                    html += `<span class="json-key">"${this.escapeHTML(objKey)}"</span>: `;
                                    html += this.createFormattedHTML(objValue, level + 2, objKey, true);
                                }

                                if (objIndex < objKeys.length - 1) {
                                    html += ',';
                                }
                                html += '</div>';
                            });
                            html += `\n${nextIndent}</div><span class="json-bracket">}</span>`;
                        }
                    } else {
                        html += `<span class="json-key">"${this.escapeHTML(k)}"</span>: `;
                        html += this.createFormattedHTML(value, level + 1, k, true);
                    }

                    if (index < keys.length - 1) {
                        html += ',';
                    }
                    html += '</div>';
                });
                html += `\n${indent}<span class="json-bracket">}</span>`;
                return html;
            }
        }
        
        return String(obj);
    }

    toggleCollapse(id) {
        console.log('toggleCollapse called with id:', id);
        const element = document.getElementById(id);
        if (!element) {
            console.log('Element not found for id:', id);
            return;
        }
        console.log('Found element:', element);

        // 更精确地查找对应的toggle按钮
        // 查找具有匹配data-target属性的按钮
        const toggle = document.querySelector(`.json-toggle[data-target="${id}"]`);
        if (!toggle) {
            console.log('Toggle button not found for id:', id);
            console.log('Available toggles:', document.querySelectorAll('.json-toggle'));
            return;
        }
        console.log('Found toggle:', toggle);

        if (element.classList.contains('collapsed')) {
            element.classList.remove('collapsed');
            toggle.classList.remove('collapsed');
            toggle.classList.add('expanded');
            console.log('Expanded');
        } else {
            element.classList.add('collapsed');
            toggle.classList.remove('expanded');
            toggle.classList.add('collapsed');
            console.log('Collapsed');
        }
    }

    unescapeJSON() {
        const input = this.jsonInput.value.trim();
        if (!input) {
            this.showError('请输入需要去除转义的JSON字符串');
            return;
        }

        try {
            let unescaped = input;
            
            unescaped = unescaped.replace(/\\"/g, '"');
            unescaped = unescaped.replace(/\\\\/g, '\\');
            unescaped = unescaped.replace(/\\n/g, '\n');
            unescaped = unescaped.replace(/\\r/g, '\r');
            unescaped = unescaped.replace(/\\t/g, '\t');
            unescaped = unescaped.replace(/\\f/g, '\f');
            unescaped = unescaped.replace(/\\b/g, '\b');
            
            this.jsonInput.value = unescaped;
            this.showSuccess('转义字符已成功去除');
            
        } catch (error) {
            this.showError(`去除转义失败: ${error.message}`);
        }
    }

    compressJSON() {
        const input = this.jsonInput.value.trim();
        if (!input) {
            this.showError('请输入JSON数据');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const compressed = JSON.stringify(parsed);
            this.displayPlainResult(compressed);
            this.showSuccess('JSON已成功压缩');
        } catch (error) {
            this.showError(`JSON格式错误: ${error.message}`);
        }
    }


    displayResult(html) {
        this.jsonOutput.innerHTML = `<div class="json-tree fade-in">${html}</div>`;
        this.bindToggleEvents();
    }

    bindToggleEvents() {
        const toggles = this.jsonOutput.querySelectorAll('.json-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetId = toggle.getAttribute('data-target');
                this.toggleCollapse(targetId);
            });
        });
    }

    displayPlainResult(text) {
        this.jsonOutput.innerHTML = `<div class="json-content fade-in">${this.escapeHTML(text)}</div>`;
    }

    showError(message) {
        this.jsonOutput.innerHTML = `<div class="error-message fade-in">${this.escapeHTML(message)}</div>`;
    }

    showSuccess(message) {
        const existingSuccess = this.jsonOutput.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message fade-in';
        successDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            ${this.escapeHTML(message)}
        `;
        
        this.jsonOutput.insertBefore(successDiv, this.jsonOutput.firstChild);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    clearAll() {
        this.jsonInput.value = '';
        this.clearOutput();
    }

    clearOutput() {
        this.jsonOutput.innerHTML = `
            <div class="placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" opacity="0.3">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p>格式化后的JSON将在这里显示</p>
            </div>
        `;
    }

    async copyResult() {
        const content = this.jsonOutput.querySelector('.json-tree, .json-content');
        if (!content) {
            this.showError('没有可复制的内容');
            return;
        }

        let textToCopy;
        
        if (content.classList.contains('json-tree')) {
            textToCopy = this.extractTextFromHTML(content);
        } else {
            textToCopy = content.textContent;
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.classList.add('copy-success');
            this.copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                已复制
            `;
            
            setTimeout(() => {
                this.copyBtn.classList.remove('copy-success');
                this.copyBtn.innerHTML = originalText;
            }, 2000);
            
        } catch (error) {
            this.showError('复制失败，请手动选择复制');
        }
    }

    extractTextFromHTML(element) {
        const clone = element.cloneNode(true);
        
        clone.querySelectorAll('.json-toggle').forEach(btn => btn.remove());
        
        clone.querySelectorAll('.json-children.collapsed').forEach(child => {
            child.style.display = 'block';
        });
        
        return clone.textContent.replace(/\n\s*\n/g, '\n').trim();
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    generateId() {
        return 'json_' + Math.random().toString(36).substr(2, 9);
    }
}

window.jsonFormatter = new JSONFormatter();

document.addEventListener('DOMContentLoaded', () => {
    const sampleJSON = {
        "name": "JSON格式化工具",
        "version": "1.0.0",
        "features": [
            "格式化JSON",
            "去除转义字符",
            "压缩JSON",
            "折叠展开"
        ],
        "config": {
            "theme": "light",
            "autoFormat": true,
            "showLineNumbers": false
        },
        "metadata": {
            "created": "2024-01-01",
            "author": "Claude",
            "tags": ["json", "formatter", "tool"]
        }
    };
    
    setTimeout(() => {
        if (!window.jsonFormatter.jsonInput.value.trim()) {
            window.jsonFormatter.jsonInput.value = JSON.stringify(sampleJSON, null, 2);
        }
    }, 500);
});