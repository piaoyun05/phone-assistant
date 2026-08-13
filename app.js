// ============================================================
// 手机智能记录助手 V2.0
// 功能：AI纠错整理、多轮对话问答、时间线回溯、标签体系、数据统计
// ============================================================

// ===== 数据存储 =====
let records = JSON.parse(localStorage.getItem('records') || '[]');
let schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
let qaHistory = JSON.parse(localStorage.getItem('qaHistory') || '[]');

// AI 配置
const aiConfig = {
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: 'sk-e4951a174bf04067b398ac1efbc45e7a',
    model: 'deepseek-chat'
};

// ===== 状态标记 =====
let hasAISynced = false;
let isAsking = false;
let isProcessingOCR = false;
let isTranslating = false;
let isAICorrecting = false;
let currentFilterTag = 'all';
let compareRecordId = null;
let editingRecordId = null;

// 时间线状态
let timelineView = 'day';
let timelineDate = new Date();

// ===== 多语言配置 =====
const i18n = {
    zh: {
        appTitle: '📱 智能记录助手',
        tabRecord: '记录', tabSchedule: '日程', tabTimeline: '时间线',
        tabQA: '问答', tabStats: '统计', tabSettings: '设置',
        recordPlaceholder: '输入你要记录的内容...\n例如：明天下午 3 点开会\n下周一上午 10 点面试',
        cameraBtn: '📷 拍照识别文字',
        polishStyle: '润色风格：',
        styleOriginal: '原汁原味（轻微优化）',
        styleFormal: '正式办公风',
        styleConcise: '简洁精炼风',
        styleDetailed: '详细拓展风',
        saveBtn: '保存记录', aiCorrectBtn: '✨ AI 纠错整理',
        tagAll: '全部', tagWork: '工作', tagLife: '生活', tagStudy: '学习', tagTask: '待办',
        recentRecords: '最近记录', mySchedules: '我的日程',
        filterAll: '全部', filterToday: '今天', filterWeek: '本周', filterUpcoming: '未来',
        timelineView: '时间线视图', viewDay: '日', viewWeek: '周', viewMonth: '月',
        qaPlaceholder: '提问关于你的记录...\n例如：我上周的工作重点是什么？',
        askBtn: '提问', statsOverview: '数据概览',
        statRecords: '总记录数', statSchedules: '总日程数', statToday: '今日日程', statWeek: '本周日程',
        weeklyChart: '本周记录趋势', scheduleDistribution: '日程时间分布', monthlyTrend: '月度趋势',
        dataManagement: '数据管理', exportData: '📤 导出数据', importData: ' 导入数据',
        clearData: '🗑️ 清除所有数据', languageSettings: '语言设置',
        translateRecords: ' AI 翻译所有记录', themeSettings: '主题设置',
        themeLight: '☀️ 浅色模式', themeDark: '🌙 深色模式',
        aboutApp: '关于', aboutText: '手机智能记录助手 V2.0',
        aboutDesc: '基于 AI 的智能记录与日程管理工具，支持 AI 纠错、多轮对话问答、时间线回溯等功能。',
        editBtn: '编辑', deleteBtn: '删除', compareBtn: '对比', revertBtn: '还原',
        noRecords: '还没有记录', noSchedules: '暂无日程',
        today: '今天', tomorrow: '明天',
        weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        confirmDelete: '确定要删除这条记录吗？', confirmDeleteSchedule: '确定要删除这条日程吗？',
        confirmClear: '确定要清除所有数据吗？此操作不可恢复！',
        exportSuccess: '数据已导出', importSuccess: '数据导入成功', importFail: '导入失败，文件格式错误',
        translateSuccess: '翻译完成', translateFail: '翻译失败',
        inputRequired: '请输入内容', saved: '记录已保存',
        savedWithSchedules: '已保存，AI 识别到 {count} 个日程',
        syncComplete: '日程同步完成',
        ocrProcessing: '正在识别文字...', ocrSuccess: '识别成功，已添加到输入框',
        ocrNoText: '未识别到文字，请重试', ocrFail: '识别失败，请重试',
        aiParsing: 'AI 解析中...', aiCorrecting: 'AI 纠错整理中...',
        aiCorrectSuccess: 'AI 纠错完成', aiCorrectFail: 'AI 纠错失败',
        qaWelcome: '你好！我是你的智能助手，可以帮你查询记录、整理日程、总结内容。试试问我："我上周的工作重点是什么？"',
        qaThinking: '思考中...',
        chartRecords: '记录数', chartSchedules: '日程数', chartHour: '小时', chartMonth: '月份',
        chartWeekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        compareTitle: '原始内容 vs AI 优化后', originalContent: '原始内容',
        optimizedContent: 'AI 优化后', revertOriginal: '还原为原始内容', closeBtn: '关闭',
        editRecord: '编辑记录', addTags: '添加标签：', tagsPlaceholder: '用逗号分隔多个标签',
        updateBtn: '更新记录', noTimeline: '暂无记录',
        autoTags: 'AI 标签', manualTags: '自定义标签',
        statThisMonth: '本月记录', statAvgPerDay: '日均记录',
        emptyQA: '暂无对话记录', langZh: '中文', langEn: 'English',
        styleLabel: '风格', originalLabel: '原始',
        viewAll: '查看全部', noRecordsInPeriod: '该时段暂无记录',
        saveSuccess: '保存成功', updateSuccess: '更新成功',
        saving: '保存中...', updating: '更新中...',
        qaSaveBtn: '保存为记录', qaCopyBtn: '复制',
        revertSuccess: '已还原为原始内容',
        recordCount: '条记录', scheduleCount: '条日程',
        createdTime: '创建时间', updatedTime: '更新时间'
    },
    en: {
        appTitle: '📱 Smart Record Assistant',
        tabRecord: 'Records', tabSchedule: 'Schedule', tabTimeline: 'Timeline',
        tabQA: 'Q&A', tabStats: 'Stats', tabSettings: 'Settings',
        recordPlaceholder: 'Enter your notes here...\nExample: Meeting at 3pm tomorrow',
        cameraBtn: '📷 Camera OCR',
        polishStyle: 'Style:',
        styleOriginal: 'Original (minor polish)',
        styleFormal: 'Formal business',
        styleConcise: 'Concise',
        styleDetailed: 'Detailed',
        saveBtn: 'Save', aiCorrectBtn: '✨ AI Correct',
        tagAll: 'All', tagWork: 'Work', tagLife: 'Life', tagStudy: 'Study', tagTask: 'Task',
        recentRecords: 'Recent Records', mySchedules: 'My Schedule',
        filterAll: 'All', filterToday: 'Today', filterWeek: 'This Week', filterUpcoming: 'Upcoming',
        timelineView: 'Timeline', viewDay: 'Day', viewWeek: 'Week', viewMonth: 'Month',
        qaPlaceholder: 'Ask about your records...\nExample: What were my work highlights last week?',
        askBtn: 'Ask', statsOverview: 'Overview',
        statRecords: 'Total Records', statSchedules: 'Total Events', statToday: 'Today', statWeek: 'This Week',
        weeklyChart: 'Weekly Trend', scheduleDistribution: 'Hour Distribution', monthlyTrend: 'Monthly Trend',
        dataManagement: 'Data', exportData: '📤 Export', importData: '📥 Import',
        clearData: '🗑️ Clear All', languageSettings: 'Language',
        translateRecords: ' AI Translate All', themeSettings: 'Theme',
        themeLight: '☀️ Light', themeDark: '🌙 Dark',
        aboutApp: 'About', aboutText: 'Smart Record Assistant V2.0',
        aboutDesc: 'AI-powered smart record & schedule management with AI correction, multi-turn Q&A, and timeline.',
        editBtn: 'Edit', deleteBtn: 'Delete', compareBtn: 'Compare', revertBtn: 'Revert',
        noRecords: 'No records yet', noSchedules: 'No events',
        today: 'Today', tomorrow: 'Tomorrow',
        weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        confirmDelete: 'Delete this record?', confirmDeleteSchedule: 'Delete this event?',
        confirmClear: 'Clear all data? This cannot be undone!',
        exportSuccess: 'Data exported', importSuccess: 'Data imported', importFail: 'Import failed',
        translateSuccess: 'Translation complete', translateFail: 'Translation failed',
        inputRequired: 'Please enter content', saved: 'Record saved',
        savedWithSchedules: 'Saved, AI found {count} events',
        syncComplete: 'Schedule sync complete',
        ocrProcessing: 'Recognizing...', ocrSuccess: 'Recognition success',
        ocrNoText: 'No text found', ocrFail: 'Recognition failed',
        aiParsing: 'AI parsing...', aiCorrecting: 'AI correcting...',
        aiCorrectSuccess: 'AI correction complete', aiCorrectFail: 'AI correction failed',
        qaWelcome: 'Hello! I\'m your smart assistant. Try asking: "What were my work highlights last week?"',
        qaThinking: 'Thinking...',
        chartRecords: 'Records', chartSchedules: 'Events', chartHour: 'Hour', chartMonth: 'Month',
        chartWeekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        compareTitle: 'Original vs AI Optimized', originalContent: 'Original',
        optimizedContent: 'AI Optimized', revertOriginal: 'Revert to Original', closeBtn: 'Close',
        editRecord: 'Edit Record', addTags: 'Tags:', tagsPlaceholder: 'Comma-separated tags',
        updateBtn: 'Update', noTimeline: 'No records',
        autoTags: 'AI Tags', manualTags: 'Custom Tags',
        statThisMonth: 'This Month', statAvgPerDay: 'Daily Avg',
        emptyQA: 'No conversations', langZh: '中文', langEn: 'English',
        styleLabel: 'Style', originalLabel: 'Original',
        viewAll: 'View All', noRecordsInPeriod: 'No records in this period',
        saveSuccess: 'Saved', updateSuccess: 'Updated',
        saving: 'Saving...', updating: 'Updating...',
        qaSaveBtn: 'Save as Record', qaCopyBtn: 'Copy',
        revertSuccess: 'Reverted to original',
        recordCount: 'records', scheduleCount: 'events',
        createdTime: 'Created', updatedTime: 'Updated'
    }
};

let currentLang = localStorage.getItem('appLang') || 'zh';
let currentTheme = localStorage.getItem('appTheme') || 'light';

// ===== 工具函数 =====
function generateId() { return Date.now() + Math.floor(Math.random() * 1000); }

function t(key) {
    const val = i18n[currentLang][key];
    return val !== undefined ? val : key;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function parseAIJSON(text) {
    if (!text) return null;
    let cleaned = text.trim();
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) cleaned = jsonMatch[1].trim();
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) cleaned = arrayMatch[0];
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) cleaned = objMatch[0];
    try { return JSON.parse(cleaned); } catch { return null; }
}

function callAI(prompt, messages = null) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const body = messages
        ? { model: aiConfig.model, messages, max_tokens: 1000 }
        : { model: aiConfig.model, messages: [{ role: 'user', content: prompt }], max_tokens: 1000 };
    return fetch(aiConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${aiConfig.apiKey}` },
        body: JSON.stringify(body), signal: controller.signal
    }).then(r => { clearTimeout(timeoutId); if (!r.ok) throw new Error(`API ${r.status}`); return r.json(); })
      .then(data => { clearTimeout(timeoutId); return data.choices[0].message.content; })
      .catch(e => { clearTimeout(timeoutId); if (e.name === 'AbortError') throw new Error('Timeout'); throw e; });
}

function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (dateOnly.getTime() === today.getTime()) return t('today');
    if (dateOnly.getTime() === tomorrow.getTime()) return t('tomorrow');
    const m = date.getMonth() + 1, d = date.getDate();
    return currentLang === 'zh' ? `${m}月${d}日 ${t('weekDays')[date.getDay()]}` : `${m}/${d} ${t('weekDays')[date.getDay()]}`;
}

function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatDateTime(date) {
    const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0'), h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
}

// ===== 图像预处理 + OCR =====
function compressImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                let { width, height } = img;
                if (width > maxSize || height > maxSize) {
                    if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
                    else { width = Math.round(width * maxSize / height); height = maxSize; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject; img.src = e.target.result;
        };
        reader.onerror = reject; reader.readAsDataURL(file);
    });
}

function preprocessImage(imageBase64) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.max(2, Math.ceil(1600 / Math.max(img.width, img.height)));
            const w = img.width * scale, h = img.height * scale;
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                data[i] = data[i + 1] = data[i + 2] = gray;
            }
            const histogram = new Array(256).fill(0);
            for (let i = 0; i < data.length; i += 4) histogram[data[i]]++;
            const totalPixels = data.length / 4;
            let sum = 0;
            for (let i = 0; i < 256; i++) sum += i * histogram[i];
            let sumB = 0, wB = 0, maxVariance = 0, threshold = 128;
            for (let t = 0; t < 256; t++) {
                wB += histogram[t]; if (wB === 0) continue;
                const wF = totalPixels - wB; if (wF === 0) break;
                sumB += t * histogram[t];
                const meanB = sumB / wB, meanF = (sum - sumB) / wF;
                const variance = wB * wF * (meanB - meanF) * (meanB - meanF);
                if (variance > maxVariance) { maxVariance = variance; threshold = t; }
            }
            const adjustedThreshold = Math.max(0, threshold - 10);
            for (let i = 0; i < data.length; i += 4) {
                const val = data[i] < adjustedThreshold ? 0 : 255;
                data[i] = data[i + 1] = data[i + 2] = val;
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = imageBase64;
    });
}

async function recognizeText(imageBase64) {
    try {
        const processedImage = await preprocessImage(imageBase64);
        const result = await Tesseract.recognize(processedImage, 'chi_sim+eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const el = document.getElementById('ocr-status');
                    if (el) el.textContent = `${t('ocrProcessing')} ${Math.round(m.progress * 100)}%...`;
                }
            }
        });
        let text = result.data.text;
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');
        text = text.replace(/[|¦┃│┋]/g, '');
        return text.trim();
    } catch (error) { console.error('OCR failed:', error); throw error; }
}

// ===== 主题与语言 =====
function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('appTheme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
}

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (i18n[lang][key] !== undefined) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (i18n[lang][key] !== undefined) el.placeholder = i18n[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.getElementById('lang-toggle').textContent = lang === 'zh' ? 'EN' : '中文';
    renderRecords(); renderSchedules(); renderTimeline(); renderQAHistory();
}

// ===== Tab 切换 =====
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
            if (btn.dataset.tab === 'schedule' && !hasAISynced) {
                hasAISynced = true;
                syncSchedulesFromRecords().then(renderSchedules);
            }
            if (btn.dataset.tab === 'timeline') renderTimeline();
            if (btn.dataset.tab === 'stats') renderStats();
        });
    });
}

// ===== 记录页面 =====
function initRecordTab() {
    // 保存按钮
    document.getElementById('save-btn').addEventListener('click', saveRecord);
    // AI 纠错按钮
    document.getElementById('ai-correct-btn').addEventListener('click', aiCorrectContent);
    // 拍照识别
    document.getElementById('camera-input').addEventListener('change', handleCameraInput);
    // 标签筛选
    document.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilterTag = btn.dataset.tag;
            renderRecords();
        });
    });
}

async function saveRecord() {
    const input = document.getElementById('record-input');
    const content = input.value.trim();
    if (!content) { alert(t('inputRequired')); return; }

    const btn = document.getElementById('save-btn');
    btn.disabled = true; btn.textContent = t('saving');

    try {
        const style = document.getElementById('polish-style').value;
        const record = {
            id: generateId(),
            originalContent: content,
            content: content,
            correctedContent: null,
            style: style,
            tags: [],
            autoTags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            viewCount: 0
        };

        // AI 纠错整理（如果选择了非原汁原味风格）
        if (style !== 'original') {
            try {
                const corrected = await aiCorrectText(content, style);
                if (corrected) {
                    record.correctedContent = corrected.text;
                    record.content = corrected.text;
                    record.autoTags = corrected.tags || [];
                }
            } catch (e) { console.warn('AI correction failed, using original:', e); }
        } else {
            // 即使是原汁原味，也做基础纠错
            try {
                const corrected = await aiCorrectText(content, 'original');
                if (corrected) {
                    record.correctedContent = corrected.text;
                    record.content = corrected.text;
                    record.autoTags = corrected.tags || [];
                }
            } catch (e) { console.warn('AI correction failed:', e); }
        }

        records.unshift(record);
        localStorage.setItem('records', JSON.stringify(records));
        input.value = '';
        renderRecords();

        // 自动 AI 解析日程
        try {
            const scheduleResult = await extractSchedulesFromText(content, record.id);
            if (scheduleResult && scheduleResult.length > 0) {
                schedules.push(...scheduleResult);
                localStorage.setItem('schedules', JSON.stringify(schedules));
                alert(t('savedWithSchedules').replace('{count}', scheduleResult.length));
            } else {
                alert(t('saveSuccess'));
            }
        } catch { alert(t('saveSuccess')); }
    } finally {
        btn.disabled = false; btn.textContent = t('saveBtn');
    }
}

async function aiCorrectContent() {
    const input = document.getElementById('record-input');
    const content = input.value.trim();
    if (!content) { alert(t('inputRequired')); return; }
    if (isAICorrecting) return;

    isAICorrecting = true;
    const btn = document.getElementById('ai-correct-btn');
    btn.disabled = true; btn.textContent = t('aiCorrecting');

    try {
        const style = document.getElementById('polish-style').value;
        const result = await aiCorrectText(content, style);
        if (result && result.text) {
            input.value = result.text;
            if (result.tags && result.tags.length > 0) {
                alert(`${t('aiCorrectSuccess')}\n${t('autoTags')}: ${result.tags.join(', ')}`);
            } else {
                alert(t('aiCorrectSuccess'));
            }
        } else {
            alert(t('aiCorrectFail'));
        }
    } catch (e) {
        console.error('AI correct failed:', e);
        alert(t('aiCorrectFail'));
    } finally {
        isAICorrecting = false;
        btn.disabled = false; btn.textContent = t('aiCorrectBtn');
    }
}

async function aiCorrectText(text, style) {
    const stylePrompts = {
        original: '请对以下文本进行基础纠错：修正错别字、标点符号错误、语法语病，统一标点格式，清理冗余空格和重复语句。保持原意不变，只做必要的文字修正。同时识别内容场景，给出合适的标签（从"工作、生活、学习、待办"中选择，最多3个）。',
        formal: '请将以下文本转化为正式办公风格：修正所有错误，将口语化表达转为正式书面语，结构化排版（添加小标题、列表），提炼重点。适合工作总结、会议纪要等场景。同时给出合适的标签（从"工作、生活、学习、待办"中选择，最多3个）。',
        concise: '请将以下文本简洁精炼化：删除冗余内容，浓缩核心要点，保留关键信息，用简练的语言重新组织。同时给出合适的标签（从"工作、生活、学习、待办"中选择，最多3个）。',
        detailed: '请将以下文本详细拓展：补充逻辑连接，完善内容细节，添加必要的背景说明，使内容更加完整和有条理。同时给出合适的标签（从"工作、生活、学习、待办"中选择，最多3个）。'
    };

    const prompt = `${stylePrompts[style] || stylePrompts.original}

请返回 JSON 格式：
{"text": "优化后的文本", "tags": ["标签1", "标签2"]}

只返回 JSON，不要其他内容。

待处理文本：
${text}`;

    const response = await callAI(prompt);
    const result = parseAIJSON(response);
    if (result && result.text) return result;
    return null;
}

async function extractSchedulesFromText(text, recordId) {
    const prompt = `请分析以下文本，提取其中所有的日程安排信息。返回 JSON 数组，每个元素包含：
- title: 事项标题（简短）
- datetime: ISO 格式日期时间（使用 2026 年作为年份）

如果没有日程信息，返回空数组 []。只返回 JSON。

文本：${text}`;

    try {
        const response = await callAI(prompt);
        const data = parseAIJSON(response);
        if (Array.isArray(data)) {
            return data.filter(s => s.title && s.datetime).map(s => ({
                id: generateId(), title: s.title, datetime: s.datetime,
                recordId: recordId, timestamp: new Date().toISOString()
            }));
        }
    } catch (e) { console.warn('Schedule extraction failed:', e); }
    return [];
}

function renderRecords() {
    const container = document.getElementById('records-container');
    let filtered = records;

    if (currentFilterTag !== 'all') {
        filtered = records.filter(r => {
            const allTags = [...(r.tags || []), ...(r.autoTags || [])];
            return allTags.includes(currentFilterTag);
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><p>${t('noRecords')}</p></div>`;
        return;
    }

    let html = '';
    filtered.forEach(record => {
        const date = new Date(record.createdAt);
        const allTags = [...new Set([...(record.autoTags || []), ...(record.tags || [])])];
        const hasCorrection = record.correctedContent && record.correctedContent !== record.content;

        html += `<div class="record-item ${editingRecordId === record.id ? 'editing' : ''}">`;
        html += `<div class="record-header">`;
        html += `<span class="record-time">${formatDateTime(date)}</span>`;
        if (record.style && record.style !== 'original') {
            html += `<span class="record-style">${t('styleLabel')}: ${t('style' + record.style.charAt(0).toUpperCase() + record.style.slice(1))}</span>`;
        }
        html += `</div>`;

        // 标签
        if (allTags.length > 0) {
            html += `<div class="record-tags">`;
            allTags.forEach(tag => {
                html += `<span class="tag-badge ${tag}">${t('tag' + tag.charAt(0).toUpperCase() + tag.slice(1))}</span>`;
            });
            html += `</div>`;
        }

        html += `<div class="record-content">${escapeHtml(record.content)}</div>`;

        // 操作按钮
        html += `<div class="record-actions">`;
        if (hasCorrection) {
            html += `<button class="action-btn compare" onclick="showCompareModal(${record.id})">${t('compareBtn')}</button>`;
        }
        html += `<button class="action-btn edit" onclick="openEditModal(${record.id})">${t('editBtn')}</button>`;
        html += `<button class="action-btn delete" onclick="deleteRecord(${record.id})">${t('deleteBtn')}</button>`;
        html += `</div></div>`;
    });
    container.innerHTML = html;
}

// ===== 对比弹窗 =====
function showCompareModal(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) return;
    compareRecordId = recordId;
    document.getElementById('compare-original').textContent = record.originalContent;
    document.getElementById('compare-optimized').textContent = record.content;
    document.getElementById('compare-modal').style.display = 'flex';
}

function closeCompareModal() {
    document.getElementById('compare-modal').style.display = 'none';
    compareRecordId = null;
}

// revert-btn listener is registered in DOMContentLoaded

// ===== 编辑弹窗 =====
function openEditModal(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) return;
    editingRecordId = recordId;
    document.getElementById('edit-input').value = record.content;
    document.getElementById('edit-tags-input').value = (record.tags || []).join(', ');
    document.getElementById('edit-modal').style.display = 'flex';
    renderRecords();
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    editingRecordId = null;
    renderRecords();
}

// update-record-btn listener is registered in DOMContentLoaded

function deleteRecord(id) {
    if (!confirm(t('confirmDelete'))) return;
    records = records.filter(r => r.id !== id);
    schedules = schedules.filter(s => s.recordId !== id);
    localStorage.setItem('records', JSON.stringify(records));
    localStorage.setItem('schedules', JSON.stringify(schedules));
    renderRecords(); renderSchedules();
}

// ===== 拍照识别 =====
async function handleCameraInput(e) {
    const file = e.target.files[0];
    if (!file || isProcessingOCR) return;
    isProcessingOCR = true;

    const statusEl = document.getElementById('ocr-status');
    const previewEl = document.getElementById('camera-preview');
    statusEl.textContent = t('ocrProcessing');
    statusEl.className = 'ocr-status processing';

    try {
        const compressed = await compressImage(file, 1280);
        previewEl.innerHTML = `<img src="${compressed}" alt="preview">`;
        const text = await recognizeText(compressed);
        if (text) {
            const input = document.getElementById('record-input');
            input.value = input.value ? input.value + '\n' + text : text;
            statusEl.textContent = t('ocrSuccess');
            statusEl.className = 'ocr-status success';
        } else {
            statusEl.textContent = t('ocrNoText');
            statusEl.className = 'ocr-status error';
        }
    } catch {
        statusEl.textContent = t('ocrFail');
        statusEl.className = 'ocr-status error';
    }

    setTimeout(() => { statusEl.textContent = ''; previewEl.innerHTML = ''; }, 3000);
    isProcessingOCR = false;
    e.target.value = '';
}

// ===== 日程页面 =====
function initScheduleTab() {
    document.getElementById('sync-schedule-btn').addEventListener('click', async () => {
        const btn = document.getElementById('sync-schedule-btn');
        btn.textContent = '⏳'; btn.disabled = true;
        await syncSchedulesFromRecords();
        hasAISynced = true;
        renderSchedules();
        btn.textContent = '🔗'; btn.disabled = false;
        alert(t('syncComplete'));
    });
    document.getElementById('refresh-schedule-btn').addEventListener('click', () => {
        hasAISynced = false;
        renderSchedules();
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSchedules(btn.dataset.filter);
        });
    });
}

async function syncSchedulesFromRecords() {
    schedules = [];
    if (aiConfig.apiKey && aiConfig.endpoint) {
        await syncSchedulesWithAI();
    } else {
        records.forEach(record => {
            const extracted = parseSchedules(record.content);
            extracted.forEach(s => { s.recordId = record.id; });
            schedules.push(...extracted);
        });
    }
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

async function syncSchedulesWithAI() {
    if (records.length === 0) return;
    const allTexts = records.map(r => ({ id: r.id, content: r.content }));
    const prompt = `请分析以下记录列表，提取其中所有的日程安排信息。返回 JSON 数组，每个元素包含：
- recordId: 对应记录的 id
- title: 事项标题
- datetime: ISO 格式日期时间

没有日程返回空数组 []。只返回 JSON。

记录列表：${JSON.stringify(allTexts)}`;

    try {
        const response = await callAI(prompt);
        const data = parseAIJSON(response);
        if (Array.isArray(data)) {
            data.forEach(s => {
                if (s.recordId && s.datetime) {
                    schedules.push({
                        id: generateId(), title: s.title || '', datetime: s.datetime,
                        recordId: s.recordId, timestamp: new Date().toISOString()
                    });
                }
            });
        }
    } catch (error) {
        console.error('AI sync failed:', error);
        records.forEach(record => {
            const extracted = parseSchedules(record.content);
            extracted.forEach(s => { s.recordId = record.id; });
            schedules.push(...extracted);
        });
    }
}

function parseSchedules(text) {
    const results = [];
    const patterns = [
        /(\d{1,2}[月/]\d{1,2}[日号]?)\s*(?:上午|下午|晚上|早上|中午)?\s*(\d{1,2}[点:：]\d{0,2})?\s*(.+?)(?:。|！|！|\n|$)/g,
        /(明天|后天|下[周一二三四五六日天])\s*(?:上午|下午|晚上|早上|中午)?\s*(\d{1,2}[点:：]\d{0,2})?\s*(.+?)(?:。|！|！|\n|$)/g,
        /(\d{4}-\d{2}-\d{2})\s*(\d{2}:\d{2})?\s*(.+?)(?:。|！|！|\n|$)/g
    ];
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            results.push({ id: generateId(), title: (match[3] || match[2] || '').trim(), datetime: new Date().toISOString() });
        }
    });
    return results;
}

function renderSchedules(filter = 'all') {
    const container = document.getElementById('schedule-container');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let filtered = schedules;
    if (filter === 'today') {
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = schedules.filter(s => { const d = new Date(s.datetime); return d >= today && d < tomorrow; });
    } else if (filter === 'week') {
        const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
        filtered = schedules.filter(s => { const d = new Date(s.datetime); return d >= today && d < weekEnd; });
    } else if (filter === 'upcoming') {
        filtered = schedules.filter(s => new Date(s.datetime) > now);
    }

    filtered.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><p>${t('noSchedules')}</p></div>`;
        return;
    }

    const groups = {};
    filtered.forEach(schedule => {
        const date = new Date(schedule.datetime);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (!groups[dateKey]) groups[dateKey] = { label: getDateLabel(date), items: [] };
        groups[dateKey].items.push(schedule);
    });

    let html = '';
    Object.keys(groups).sort().forEach(key => {
        const group = groups[key];
        html += `<div class="schedule-group"><div class="schedule-group-header">${group.label}</div>`;
        group.items.forEach(schedule => {
            const date = new Date(schedule.datetime);
            html += `<div class="schedule-item">
                <div class="schedule-time">${formatTime(date)}</div>
                <div class="schedule-content">${escapeHtml(schedule.title)}</div>
                <button class="delete-btn" onclick="deleteSchedule(${schedule.id})">${t('deleteBtn')}</button>
            </div>`;
        });
        html += '</div>';
    });
    container.innerHTML = html;
}

function getDateLabel(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (dateOnly.getTime() === today.getTime()) return t('today');
    if (dateOnly.getTime() === tomorrow.getTime()) return t('tomorrow');
    const m = date.getMonth() + 1, d = date.getDate();
    return currentLang === 'zh' ? `${m}月${d}日 ${t('weekDays')[date.getDay()]}` : `${m}/${d} ${t('weekDays')[date.getDay()]}`;
}

function deleteSchedule(id) {
    if (!confirm(t('confirmDeleteSchedule'))) return;
    schedules = schedules.filter(s => s.id !== id);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    renderSchedules();
}

// ===== 时间线页面 =====
function initTimelineTab() {
    document.querySelectorAll('.timeline-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.timeline-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            timelineView = btn.dataset.view;
            renderTimeline();
        });
    });
    document.getElementById('timeline-prev').addEventListener('click', () => {
        navigateTimeline(-1);
    });
    document.getElementById('timeline-next').addEventListener('click', () => {
        navigateTimeline(1);
    });
}

function navigateTimeline(direction) {
    if (timelineView === 'day') {
        timelineDate.setDate(timelineDate.getDate() + direction);
    } else if (timelineView === 'week') {
        timelineDate.setDate(timelineDate.getDate() + direction * 7);
    } else {
        timelineDate.setMonth(timelineDate.getMonth() + direction);
    }
    renderTimeline();
}

function renderTimeline() {
    const container = document.getElementById('timeline-container');
    const labelEl = document.getElementById('timeline-label');
    const now = new Date();

    let startDate, endDate, labelText;

    if (timelineView === 'day') {
        startDate = new Date(timelineDate.getFullYear(), timelineDate.getMonth(), timelineDate.getDate());
        endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 1);
        labelText = formatDate(startDate);
    } else if (timelineView === 'week') {
        const dayOfWeek = timelineDate.getDay();
        startDate = new Date(timelineDate);
        startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 7);
        labelText = `${formatDate(startDate)} - ${formatDate(new Date(endDate.getTime() - 86400000))}`;
    } else {
        startDate = new Date(timelineDate.getFullYear(), timelineDate.getMonth(), 1);
        endDate = new Date(timelineDate.getFullYear(), timelineDate.getMonth() + 1, 1);
        labelText = `${timelineDate.getFullYear()}年${timelineDate.getMonth() + 1}月`;
    }

    labelEl.textContent = labelText;

    // 获取该时段的记录和日程
    const periodRecords = records.filter(r => {
        const d = new Date(r.createdAt);
        return d >= startDate && d < endDate;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const periodSchedules = schedules.filter(s => {
        const d = new Date(s.datetime);
        return d >= startDate && d < endDate;
    }).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (periodRecords.length === 0 && periodSchedules.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon"></div><p>${t('noRecordsInPeriod')}</p></div>`;
        return;
    }

    let html = '';

    // 日程部分
    if (periodSchedules.length > 0) {
        html += `<div class="timeline-section"><h4 class="timeline-section-title">📅 ${t('mySchedules')} (${periodSchedules.length})</h4>`;
        periodSchedules.forEach(s => {
            const d = new Date(s.datetime);
            html += `<div class="timeline-item schedule">
                <div class="timeline-time">${formatTime(d)}</div>
                <div class="timeline-content">${escapeHtml(s.title)}</div>
            </div>`;
        });
        html += `</div>`;
    }

    // 记录部分
    if (periodRecords.length > 0) {
        html += `<div class="timeline-section"><h4 class="timeline-section-title">📝 ${t('recentRecords')} (${periodRecords.length})</h4>`;
        periodRecords.forEach(r => {
            const d = new Date(r.createdAt);
            const allTags = [...new Set([...(r.autoTags || []), ...(r.tags || [])])];
            html += `<div class="timeline-item record">
                <div class="timeline-time">${formatTime(d)}</div>
                <div class="timeline-content">
                    <div class="timeline-text">${escapeHtml(r.content.substring(0, 100))}${r.content.length > 100 ? '...' : ''}</div>
                    ${allTags.length > 0 ? `<div class="timeline-tags">${allTags.map(tag => `<span class="tag-badge ${tag}">${t('tag' + tag.charAt(0).toUpperCase() + tag.slice(1))}</span>`).join('')}</div>` : ''}
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    container.innerHTML = html;
}

// ===== 问答页面（多轮对话 + 语义匹配）=====
function initQATab() {
    document.getElementById('ask-btn').addEventListener('click', askQuestion);
    document.getElementById('qa-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isAsking) askQuestion();
    });
    renderQAHistory();
}

async function askQuestion() {
    const input = document.getElementById('qa-input');
    const question = input.value.trim();
    if (!question || isAsking) return;

    isAsking = true;
    const btn = document.getElementById('ask-btn');
    btn.disabled = true;

    // 添加用户问题到历史
    qaHistory.push({ role: 'user', content: question, timestamp: new Date().toISOString() });
    input.value = '';
    renderQAHistory();

    // 显示思考中
    const thinkingId = generateId();
    qaHistory.push({ role: 'assistant', content: t('qaThinking'), timestamp: new Date().toISOString(), id: thinkingId, isThinking: true });
    renderQAHistory();

    try {
        // 构建上下文：最近 10 条对话 + 相关记录
        const recentQA = qaHistory.slice(-10).filter(q => !q.isThinking);
        const relevantRecords = findRelevantRecords(question);

        let contextText = '';
        if (relevantRecords.length > 0) {
            contextText = '以下是用户的历史记录，请基于这些记录回答问题：\n\n';
            relevantRecords.forEach((r, i) => {
                const d = new Date(r.createdAt);
                contextText += `[${i + 1}] ${formatDateTime(d)}: ${r.content}\n`;
            });
        }

        const systemPrompt = `你是一个智能个人助手，帮助用户管理记录和日程。请基于用户的历史记录回答问题。
${contextText}
如果问题与历史记录无关，请友好地告知用户。回答要简洁、有条理。`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentQA.map(q => ({ role: q.role, content: q.content }))
        ];

        const response = await callAI('', messages);

        // 替换思考中的消息
        const thinkingIdx = qaHistory.findIndex(q => q.id === thinkingId);
        if (thinkingIdx >= 0) {
            qaHistory[thinkingIdx] = { role: 'assistant', content: response, timestamp: new Date().toISOString() };
        }
    } catch (e) {
        const thinkingIdx = qaHistory.findIndex(q => q.id === thinkingId);
        if (thinkingIdx >= 0) {
            qaHistory[thinkingIdx] = { role: 'assistant', content: `抱歉，出错了：${e.message}`, timestamp: new Date().toISOString() };
        }
    }

    localStorage.setItem('qaHistory', JSON.stringify(qaHistory));
    isAsking = false;
    btn.disabled = false;
    renderQAHistory();
}

function findRelevantRecords(question) {
    // 简单语义匹配：关键词 + 时间相关词
    const questionLower = question.toLowerCase();
    const timeKeywords = ['今天', '明天', '后天', '本周', '上周', '这个月', '上个月', '最近', '今天', 'tomorrow', 'today', 'week', 'month'];
    const hasTimeRef = timeKeywords.some(k => questionLower.includes(k));

    let relevant = records.slice();

    // 如果有时间引用，按时间排序
    if (hasTimeRef) {
        relevant.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // 关键词匹配加分
    const questionWords = questionLower.replace(/[？?！!。，、]/g, '').split(/\s+/);
    relevant.forEach(r => {
        const contentLower = r.content.toLowerCase();
        let score = 0;
        questionWords.forEach(word => {
            if (word.length > 1 && contentLower.includes(word)) score += 10;
        });
        // 时间近的加分
        const daysDiff = (Date.now() - new Date(r.createdAt).getTime()) / 86400000;
        if (daysDiff < 7) score += 5;
        else if (daysDiff < 30) score += 3;
        r._score = score;
    });

    relevant.sort((a, b) => (b._score || 0) - (a._score || 0));
    return relevant.slice(0, 8); // 最多返回 8 条相关记录
}

function renderQAHistory() {
    const container = document.getElementById('qa-history');
    if (qaHistory.length === 0) {
        container.innerHTML = `<div class="qa-welcome">${t('qaWelcome')}</div>`;
        return;
    }

    let html = '';
    qaHistory.forEach(msg => {
        const isUser = msg.role === 'user';
        html += `<div class="qa-message ${isUser ? 'user' : 'assistant'}">`;
        html += `<div class="qa-bubble">${escapeHtml(msg.content)}</div>`;
        if (!isUser && !msg.isThinking) {
            html += `<div class="qa-actions">
                <button class="qa-action-btn" onclick="copyQAContent(this)">${t('qaCopyBtn')}</button>
                <button class="qa-action-btn" onclick="saveQAAsRecord(this)">${t('qaSaveBtn')}</button>
            </div>`;
        }
        html += `</div>`;
    });
    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

function copyQAContent(btn) {
    const bubble = btn.closest('.qa-message').querySelector('.qa-bubble');
    navigator.clipboard.writeText(bubble.textContent).then(() => {
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = t('qaCopyBtn'); }, 1500);
    });
}

function saveQAAsRecord(btn) {
    const bubble = btn.closest('.qa-message').querySelector('.qa-bubble');
    const content = bubble.textContent;
    records.unshift({
        id: generateId(), originalContent: content, content: content,
        correctedContent: null, style: 'original', tags: [], autoTags: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), viewCount: 0
    });
    localStorage.setItem('records', JSON.stringify(records));
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = t('qaSaveBtn'); }, 1500);
}

// ===== 统计页面 =====
function initStatsTab() {}

function renderStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);

    document.getElementById('stat-records').textContent = records.length;
    document.getElementById('stat-schedules').textContent = schedules.length;
    document.getElementById('stat-today').textContent = schedules.filter(s => {
        const d = new Date(s.datetime); return d >= today && d < new Date(today.getTime() + 86400000);
    }).length;
    document.getElementById('stat-week').textContent = schedules.filter(s => {
        const d = new Date(s.datetime); return d >= today && d < weekEnd;
    }).length;

    drawWeeklyChart();
    drawHourChart();
    drawMonthlyChart();
}

function drawWeeklyChart() {
    const canvas = document.getElementById('weekly-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const count = records.filter(r => {
            const rd = new Date(r.createdAt);
            return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth() && rd.getDate() === d.getDate();
        }).length;
        days.push({ label: t('chartWeekDays')[(d.getDay() + 6) % 7], count });
    }

    const maxCount = Math.max(...days.map(d => d.count), 1);
    const barWidth = (w - 60) / days.length;
    const chartHeight = h - 40;

    const isDark = currentTheme === 'dark';
    ctx.fillStyle = isDark ? '#ffffff' : '#333333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    days.forEach((day, i) => {
        const barHeight = (day.count / maxCount) * (chartHeight - 20);
        const x = 30 + i * barWidth + barWidth * 0.15;
        const barW = barWidth * 0.7;
        const y = chartHeight - barHeight;

        ctx.fillStyle = isDark ? '#4a9eff' : '#667eea';
        ctx.fillRect(x, y, barW, barHeight);

        ctx.fillStyle = isDark ? '#cccccc' : '#666666';
        ctx.fillText(day.label, x + barW / 2, h - 5);

        if (day.count > 0) {
            ctx.fillStyle = isDark ? '#ffffff' : '#333333';
            ctx.fillText(day.count, x + barW / 2, y - 5);
        }
    });
}

function drawHourChart() {
    const canvas = document.getElementById('hour-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const hours = new Array(24).fill(0);
    schedules.forEach(s => { hours[new Date(s.datetime).getHours()]++; });

    const maxCount = Math.max(...hours, 1);
    const barWidth = (w - 40) / 24;
    const chartHeight = h - 30;
    const isDark = currentTheme === 'dark';

    hours.forEach((count, i) => {
        const barHeight = (count / maxCount) * (chartHeight - 10);
        const x = 20 + i * barWidth + 1;
        const barW = barWidth - 2;
        const y = chartHeight - barHeight;

        ctx.fillStyle = isDark ? '#4a9eff' : '#667eea';
        ctx.fillRect(x, y, barW, barHeight);

        if (i % 4 === 0) {
            ctx.fillStyle = isDark ? '#cccccc' : '#666666';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${i}:00`, x + barW / 2, h - 5);
        }
    });
}

function drawMonthlyChart() {
    const canvas = document.getElementById('monthly-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const count = records.filter(r => {
            const rd = new Date(r.createdAt);
            return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
        }).length;
        months.push({ label: t('months')[d.getMonth()], count });
    }

    const maxCount = Math.max(...months.map(m => m.count), 1);
    const isDark = currentTheme === 'dark';
    const chartHeight = h - 40;
    const padding = 40;
    const stepX = (w - padding * 2) / (months.length - 1 || 1);

    // 绘制折线
    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#4a9eff' : '#667eea';
    ctx.lineWidth = 2;

    months.forEach((month, i) => {
        const x = padding + i * stepX;
        const y = chartHeight - (month.count / maxCount) * (chartHeight - 20);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 绘制点和标签
    months.forEach((month, i) => {
        const x = padding + i * stepX;
        const y = chartHeight - (month.count / maxCount) * (chartHeight - 20);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#4a9eff' : '#667eea';
        ctx.fill();

        ctx.fillStyle = isDark ? '#cccccc' : '#666666';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(month.label, x, h - 10);

        if (month.count > 0) {
            ctx.fillStyle = isDark ? '#ffffff' : '#333333';
            ctx.fillText(month.count, x, y - 10);
        }
    });
}

// ===== 设置页面 =====
function initSettingsTab() {
    // 主题切换
    document.getElementById('theme-toggle').addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    // 语言切换
    document.getElementById('lang-toggle').addEventListener('click', () => {
        applyLanguage(currentLang === 'zh' ? 'en' : 'zh');
    });
    // 语言按钮
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });
    // 主题按钮
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });
    // 导出
    document.getElementById('export-btn').addEventListener('click', exportData);
    // 导入
    document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-input').click());
    document.getElementById('import-input').addEventListener('change', importData);
    // 清除
    document.getElementById('clear-btn').addEventListener('click', () => {
        if (confirm(t('confirmClear'))) {
            records = []; schedules = []; qaHistory = [];
            localStorage.removeItem('records');
            localStorage.removeItem('schedules');
            localStorage.removeItem('qaHistory');
            renderRecords(); renderSchedules(); renderQAHistory();
        }
    });
    // AI 翻译
    document.getElementById('translate-btn').addEventListener('click', translateAllRecords);
}

function exportData() {
    const data = { records, schedules, qaHistory, exportDate: new Date().toISOString(), version: '2.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `record-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    alert(t('exportSuccess'));
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.records) { records = data.records; localStorage.setItem('records', JSON.stringify(records)); }
            if (data.schedules) { schedules = data.schedules; localStorage.setItem('schedules', JSON.stringify(schedules)); }
            if (data.qaHistory) { qaHistory = data.qaHistory; localStorage.setItem('qaHistory', JSON.stringify(qaHistory)); }
            renderRecords(); renderSchedules(); renderQAHistory();
            alert(t('importSuccess'));
        } catch { alert(t('importFail')); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

async function translateAllRecords() {
    if (isTranslating) return;
    isTranslating = true;
    const btn = document.getElementById('translate-btn');
    const statusEl = document.getElementById('translate-status');
    btn.disabled = true;
    const targetLang = currentLang === 'zh' ? 'en' : 'zh';

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        statusEl.textContent = `翻译中 ${i + 1}/${records.length}...`;
        try {
            const prompt = `请将以下文本翻译为${targetLang === 'zh' ? '中文' : 'English'}，保持原意不变，只返回翻译结果：\n\n${record.content}`;
            const response = await callAI(prompt);
            record.content = response.trim();
            record.updatedAt = new Date().toISOString();
            localStorage.setItem('records', JSON.stringify(records));
            renderRecords();
        } catch (e) { console.warn(`Translation failed for record ${i}:`, e); }
    }

    statusEl.textContent = t('translateSuccess');
    btn.disabled = false;
    isTranslating = false;
    setTimeout(() => { statusEl.textContent = ''; }, 3000);
}

// ===== 页面加载初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    applyTheme(currentTheme);
    applyLanguage(currentLang);
    initTabs();
    initRecordTab();
    initScheduleTab();
    initTimelineTab();
    initQATab();
    initStatsTab();
    initSettingsTab();

    // 对比弹窗 - 还原按钮
    document.getElementById('revert-btn').addEventListener('click', () => {
        if (compareRecordId === null) return;
        const record = records.find(r => r.id === compareRecordId);
        if (record) {
            record.content = record.originalContent;
            record.updatedAt = new Date().toISOString();
            localStorage.setItem('records', JSON.stringify(records));
            renderRecords();
            closeCompareModal();
            alert(t('revertSuccess'));
        }
    });

    // 编辑弹窗 - 更新按钮
    document.getElementById('update-record-btn').addEventListener('click', async () => {
        if (editingRecordId === null) return;
        const record = records.find(r => r.id === editingRecordId);
        if (!record) return;

        const newContent = document.getElementById('edit-input').value.trim();
        if (!newContent) { alert(t('inputRequired')); return; }

        const btn = document.getElementById('update-record-btn');
        btn.disabled = true; btn.textContent = t('updating');

        try {
            const tagsStr = document.getElementById('edit-tags-input').value.trim();
            record.tags = tagsStr ? tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t) : [];

            if (!record.originalContent || record.originalContent === record.content) {
                record.originalContent = record.content;
            }

            record.content = newContent;
            record.updatedAt = new Date().toISOString();

            const style = record.style || 'original';
            try {
                const corrected = await aiCorrectText(newContent, style);
                if (corrected) {
                    record.correctedContent = corrected.text;
                    record.content = corrected.text;
                    if (corrected.tags) record.autoTags = corrected.tags;
                }
            } catch (e) { console.warn('AI re-correction failed:', e); }

            try {
                schedules = schedules.filter(s => s.recordId !== record.id);
                const newSchedules = await extractSchedulesFromText(newContent, record.id);
                schedules.push(...newSchedules);
                localStorage.setItem('schedules', JSON.stringify(schedules));
            } catch (e) { console.warn('Schedule re-extraction failed:', e); }

            localStorage.setItem('records', JSON.stringify(records));
            closeEditModal();
            renderRecords();
            alert(t('updateSuccess'));
        } finally {
            btn.disabled = false; btn.textContent = t('updateBtn');
        }
    });

    renderRecords();
    renderSchedules();
});
