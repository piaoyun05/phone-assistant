// ============================================================
// 手机智能记录助手 V1.0 - 主程序
// 功能：记录管理、日程解析、AI 问答、数据统计、多语言、深色模式
// ============================================================

// ===== 数据存储 =====
let records = JSON.parse(localStorage.getItem('records') || '[]');
let schedules = JSON.parse(localStorage.getItem('schedules') || '[]');

// AI 配置（DeepSeek API）
const aiConfig = {
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: 'sk-e4951a174bf04067b398ac1efbc45e7a',
    model: 'deepseek-chat'
};

// ===== 状态标记 =====
let hasAISynced = false;
let isAsking = false;
let editingRecordId = null;
let isProcessingOCR = false;
let isTranslating = false;

// ===== 多语言配置 =====
const i18n = {
    zh: {
        appTitle: ' 记录助手',
        tabRecord: '记录',
        tabSchedule: '日程',
        tabQA: '问答',
        tabStats: '统计',
        tabSettings: '设置',
        recordPlaceholder: '输入你要记录的内容...\n例如：明天下午 3 点开会\n下周一上午 10 点面试',
        cameraBtn: ' 拍照识别文字',
        saveBtn: '保存记录',
        updateBtn: '更新记录',
        recentRecords: '最近记录',
        mySchedules: '我的日程',
        filterAll: '全部',
        filterToday: '今天',
        filterWeek: '本周',
        filterUpcoming: '未来',
        qaPlaceholder: '提问关于你的日程...\n例如：明天有什么安排？',
        askBtn: '提问',
        statsOverview: '数据概览',
        statRecords: '总记录数',
        statSchedules: '总日程数',
        statToday: '今日日程',
        statWeek: '本周日程',
        weeklyChart: '本周记录趋势',
        scheduleDistribution: '日程时间分布',
        monthlyTrend: '月度趋势',
        dataManagement: '数据管理',
        exportData: ' 导出数据',
        importData: ' 导入数据',
        clearData: ' 清除所有数据',
        languageSettings: '语言设置',
        translateRecords: ' AI 翻译所有记录',
        themeSettings: '主题设置',
        themeLight: ' 浅色模式',
        themeDark: ' 深色模式',
        aboutApp: '关于',
        aboutText: '手机智能记录助手 V1.0',
        aboutDesc: '基于 AI 的个人日程管理工具，支持拍照识别、智能问答、数据统计等功能。',
        editBtn: '编辑',
        deleteBtn: '删除',
        noRecords: '还没有记录',
        noSchedules: '暂无日程',
        today: '今天',
        tomorrow: '明天',
        weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        weekDayLabels: ['日', '一', '二', '三', '四', '五', '六'],
        confirmDelete: '确定要删除这条记录吗？',
        confirmDeleteSchedule: '确定要删除这条日程吗？',
        confirmClear: '确定要清除所有数据吗？此操作不可恢复！',
        exportSuccess: '数据已导出',
        importSuccess: '数据导入成功',
        importFail: '导入失败，文件格式错误',
        translateSuccess: '翻译完成',
        translateFail: '翻译失败',
        inputRequired: '请输入内容',
        saved: '记录已保存',
        savedWithSchedules: '已保存，AI 识别到 {count} 个日程',
        syncComplete: '日程同步完成',
        ocrProcessing: '正在识别文字...',
        ocrSuccess: '识别成功，已添加到输入框',
        ocrNoText: '未识别到文字，请重试',
        ocrFail: '识别失败，请重试',
        aiParsing: 'AI 解析中...',
        qaWelcome: '你好！我可以帮你查询和整理日程安排。试试问我："明天有什么安排？"或"帮我整理一下这周的日程"',
        qaThinking: '思考中...',
        chartRecords: '记录数',
        chartSchedules: '日程数',
        chartHour: '小时',
        chartMonth: '月份',
        chartWeekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        statThisMonth: '本月记录',
        statAvgPerDay: '日均记录',
        emptyQA: '暂无对话记录',
        langZh: '中文',
        langEn: 'English'
    },
    en: {
        appTitle: ' Record Assistant',
        tabRecord: 'Records',
        tabSchedule: 'Schedule',
        tabQA: 'Q&A',
        tabStats: 'Stats',
        tabSettings: 'Settings',
        recordPlaceholder: 'Enter your notes here...\nExample: Meeting at 3pm tomorrow\nInterview next Monday at 10am',
        cameraBtn: ' Camera OCR',
        saveBtn: 'Save Record',
        updateBtn: 'Update Record',
        recentRecords: 'Recent Records',
        mySchedules: 'My Schedule',
        filterAll: 'All',
        filterToday: 'Today',
        filterWeek: 'This Week',
        filterUpcoming: 'Upcoming',
        qaPlaceholder: 'Ask about your schedule...\nExample: What\'s tomorrow?',
        askBtn: 'Ask',
        statsOverview: 'Overview',
        statRecords: 'Total Records',
        statSchedules: 'Total Events',
        statToday: 'Today',
        statWeek: 'This Week',
        weeklyChart: 'Weekly Trend',
        scheduleDistribution: 'Hour Distribution',
        monthlyTrend: 'Monthly Trend',
        dataManagement: 'Data Management',
        exportData: ' Export Data',
        importData: ' Import Data',
        clearData: ' Clear All Data',
        languageSettings: 'Language',
        translateRecords: ' AI Translate All Records',
        themeSettings: 'Theme',
        themeLight: ' Light Mode',
        themeDark: ' Dark Mode',
        aboutApp: 'About',
        aboutText: 'Smart Record Assistant V1.0',
        aboutDesc: 'AI-powered personal schedule management tool with OCR, smart Q&A, and statistics.',
        editBtn: 'Edit',
        deleteBtn: 'Delete',
        noRecords: 'No records yet',
        noSchedules: 'No events',
        today: 'Today',
        tomorrow: 'Tomorrow',
        weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekDayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        confirmDelete: 'Are you sure you want to delete this record?',
        confirmDeleteSchedule: 'Are you sure you want to delete this event?',
        confirmClear: 'Are you sure you want to clear all data? This cannot be undone!',
        exportSuccess: 'Data exported successfully',
        importSuccess: 'Data imported successfully',
        importFail: 'Import failed, invalid file format',
        translateSuccess: 'Translation complete',
        translateFail: 'Translation failed',
        inputRequired: 'Please enter content',
        saved: 'Record saved',
        savedWithSchedules: 'Saved, AI found {count} events',
        syncComplete: 'Schedule sync complete',
        ocrProcessing: 'Recognizing text...',
        ocrSuccess: 'Recognition success, added to input',
        ocrNoText: 'No text found, please retry',
        ocrFail: 'Recognition failed, please retry',
        aiParsing: 'AI parsing...',
        qaWelcome: 'Hello! I can help you check and organize your schedule. Try asking: "What\'s tomorrow?" or "Show me this week"',
        qaThinking: 'Thinking...',
        chartRecords: 'Records',
        chartSchedules: 'Events',
        chartHour: 'Hour',
        chartMonth: 'Month',
        chartWeekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        statThisMonth: 'This Month',
        statAvgPerDay: 'Daily Avg',
        emptyQA: 'No conversations yet',
        langZh: '中文',
        langEn: 'English'
    }
};

// 当前语言和主题
let currentLang = localStorage.getItem('appLang') || 'zh';
let currentTheme = localStorage.getItem('appTheme') || 'light';

// ===== 页面加载初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    applyTheme(currentTheme);
    applyLanguage(currentLang);
    initTabs();
    initRecordTab();
    initScheduleTab();
    initQATab();
    initStatsTab();
    initSettingsTab();
    renderRecords();
    renderSchedules();
});

// ===== 多语言系统 =====
function t(key) {
    return i18n[currentLang][key] || key;
}

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // 更新所有 data-i18n 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key] !== undefined) {
            el.textContent = i18n[lang][key];
        }
    });

    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18n[lang][key] !== undefined) {
            el.placeholder = i18n[lang][key];
        }
    });

    // 更新语言按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // 更新语言切换按钮文字
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.textContent = lang === 'zh' ? 'EN' : '中';
    }

    // 重新渲染动态内容
    renderRecords();
    renderSchedules();
    renderStats();
}

// ===== 深色模式系统 =====
function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('appTheme', theme);
    document.body.classList.toggle('dark-mode', theme === 'dark');

    // 更新主题按钮状态
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    // 更新主题切换按钮图标
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // 重新绘制图表（颜色变化）
    if (document.getElementById('stats-tab').classList.contains('active')) {
        renderStats();
    }
}

// ===== 安全解析 AI JSON =====
function parseAIJSON(text) {
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    return JSON.parse(cleaned);
}

// ===== AI API 调用 =====
async function callAI(prompt, timeoutMs = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(aiConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: aiConfig.model,
                messages: [
                    { role: 'system', content: '你是一个智能助手，帮助用户解析和整理日程安排。只返回JSON，不要其他说明。' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('AI request timeout, please check network');
        }
        throw error;
    }
}

// ===== 生成唯一 ID =====
function generateId() {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}

// ===== HTML 转义 =====
const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, ch => escapeMap[ch]);
}

// ===== 标签页切换 =====
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            if (targetTab === 'schedule' && !hasAISynced) {
                await syncSchedulesFromRecords();
                hasAISynced = true;
                renderSchedules();
            }

            if (targetTab === 'stats') {
                renderStats();
            }
        });
    });
}

// ============================================================
// 记录页面
// ============================================================
function initRecordTab() {
    const saveBtn = document.getElementById('save-btn');
    const recordInput = document.getElementById('record-input');
    const cameraInput = document.getElementById('camera-input');
    const cameraPreview = document.getElementById('camera-preview');
    const ocrStatus = document.getElementById('ocr-status');

    // 拍照识别文字
    cameraInput.addEventListener('change', async (e) => {
        if (isProcessingOCR) return;
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        isProcessingOCR = true;
        ocrStatus.className = 'ocr-status processing';
        ocrStatus.textContent = t('ocrProcessing');

        const reader = new FileReader();
        reader.onload = (event) => {
            cameraPreview.innerHTML = `<img src="${event.target.result}" alt="preview">`;
        };
        reader.readAsDataURL(file);

        try {
            const compressedBase64 = await compressImage(file, 1280);
            const ocrText = await recognizeText(compressedBase64);

            if (ocrText.trim()) {
                const currentText = recordInput.value.trim();
                recordInput.value = currentText ? currentText + '\n' + ocrText.trim() : ocrText.trim();
                ocrStatus.className = 'ocr-status success';
                ocrStatus.textContent = t('ocrSuccess');
            } else {
                ocrStatus.className = 'ocr-status error';
                ocrStatus.textContent = t('ocrNoText');
            }
        } catch (error) {
            console.error('OCR failed:', error);
            ocrStatus.className = 'ocr-status error';
            ocrStatus.textContent = t('ocrFail');
        } finally {
            isProcessingOCR = false;
            cameraInput.value = '';
            setTimeout(() => {
                cameraPreview.innerHTML = '';
                ocrStatus.textContent = '';
                ocrStatus.className = 'ocr-status';
            }, 3000);
        }
    });

    saveBtn.addEventListener('click', async () => {
        const content = recordInput.value.trim();
        if (!content) {
            alert(t('inputRequired'));
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = t('aiParsing');

        let result;
        if (editingRecordId) {
            const record = records.find(r => r.id === editingRecordId);
            if (record) {
                record.content = content;
                record.timestamp = new Date().toISOString();
                localStorage.setItem('records', JSON.stringify(records));
                result = await parseSchedulesWithAI(content, editingRecordId);
            }
            exitEditMode();
        } else {
            const record = {
                id: Date.now(),
                content: content,
                timestamp: new Date().toISOString()
            };
            records.unshift(record);
            localStorage.setItem('records', JSON.stringify(records));
            result = await parseSchedulesWithAI(content, record.id);
        }

        recordInput.value = '';
        renderRecords();
        renderSchedules();

        saveBtn.disabled = false;
        saveBtn.textContent = t('saveBtn');

        if (result) {
            if (result.count > 0) {
                alert(t('savedWithSchedules').replace('{count}', result.count));
            } else {
                alert(t('saved'));
            }
        }
    });
}

// 压缩图片
function compressImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.onload = () => {
                let { width, height } = img;
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = Math.round(height * maxSize / width);
                        width = maxSize;
                    } else {
                        width = Math.round(width * maxSize / height);
                        height = maxSize;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Tesseract.js 本地 OCR 识别图片文字（无需 AI API）
async function recognizeText(imageBase64) {
    try {
        const result = await Tesseract.recognize(imageBase64, 'chi_sim+eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const ocrStatus = document.getElementById('ocr-status');
                    if (ocrStatus) {
                        ocrStatus.textContent = `识别中 ${Math.round(m.progress * 100)}%...`;
                    }
                }
            }
        });
        return result.data.text.trim();
    } catch (error) {
        console.error('Tesseract OCR failed:', error);
        throw error;
    }
}

// AI 解析日程
async function parseSchedulesWithAI(text, recordId) {
    const prompt = `你是一个日程解析助手。请从以下文本中提取所有日程安排，返回 JSON 数组。

每个日程对象必须包含：
- title: 事项标题（简短，如"开会"、"面试"）
- datetime: ISO 8601 格式日期时间（如 "2026-01-15T15:00:00"）

规则：
1. 每个独立的时间点创建一个日程对象
2. 如果文本中有多个时间，拆分成多个对象
3. 日期使用当前年份（2026 年）
4. 没有日程信息时返回空数组 []

示例：
输入："明天下午3点开会，下周一上午10点面试"
输出：[{"title":"开会","datetime":"2026-01-16T15:00:00"},{"title":"面试","datetime":"2026-01-20T10:00:00"}]

文本：${text}

只返回 JSON 数组，不要其他说明。`;

    try {
        const response = await callAI(prompt);
        const schedulesData = parseAIJSON(response);

        if (Array.isArray(schedulesData) && schedulesData.length > 0) {
            schedules = schedules.filter(s => s.recordId !== recordId);
            schedulesData.forEach(s => {
                if (s.datetime) {
                    schedules.push({
                        id: generateId(),
                        title: s.title || '',
                        datetime: s.datetime,
                        recordId: recordId,
                        timestamp: new Date().toISOString()
                    });
                }
            });
            localStorage.setItem('schedules', JSON.stringify(schedules));
            hasAISynced = true;
            return { success: true, count: schedulesData.length };
        } else {
            return { success: true, count: 0 };
        }
    } catch (error) {
        console.error('AI parse failed:', error);
        const extractedSchedules = parseSchedules(text);
        if (extractedSchedules.length > 0) {
            schedules = schedules.filter(s => s.recordId !== recordId);
            extractedSchedules.forEach(s => { s.recordId = recordId; });
            schedules.push(...extractedSchedules);
            localStorage.setItem('schedules', JSON.stringify(schedules));
        }
        return { success: false, count: extractedSchedules.length };
    }
}

// 本地日程解析（降级备用）
function parseSchedules(text) {
    const result = [];
    const now = new Date();

    function extractTitle(text, timePattern) {
        let title = text.replace(timePattern, '').trim();
        title = title.replace(/^[,，、\s]+/, '').trim();
        return title || text;
    }

    function pushSchedule(title, date) {
        result.push({
            id: generateId(),
            title: title,
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    let match;
    if (match = text.match(/今天(?:下午|晚上|上午|早上)?(\d{1,2})[点:：](\d{0,2})/)) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const adjustedHour = (text.includes('下午') || text.includes('晚上')) ? hour + 12 : hour;
        const date = new Date(now);
        date.setHours(adjustedHour, minute, 0, 0);
        pushSchedule(extractTitle(text, /今天.*?\d{1,2}[点:：]\d{0,2}/), date);
    }

    if (match = text.match(/明天(?:下午|晚上|上午|早上)?(\d{1,2})[点:：](\d{0,2})/)) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const adjustedHour = (text.includes('下午') || text.includes('晚上')) ? hour + 12 : hour;
        const date = new Date(now);
        date.setDate(date.getDate() + 1);
        date.setHours(adjustedHour, minute, 0, 0);
        pushSchedule(extractTitle(text, /明天.*?\d{1,2}[点:：]\d{0,2}/), date);
    }

    if (match = text.match(/后天(?:下午|晚上|上午|早上)?(\d{1,2})[点:：](\d{0,2})/)) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const adjustedHour = (text.includes('下午') || text.includes('晚上')) ? hour + 12 : hour;
        const date = new Date(now);
        date.setDate(date.getDate() + 2);
        date.setHours(adjustedHour, minute, 0, 0);
        pushSchedule(extractTitle(text, /后天.*?\d{1,2}[点:：]\d{0,2}/), date);
    }

    if (match = text.match(/下周([一二三四五六日天])(?:下午|晚上|上午|早上)?(\d{1,2})[点:：](\d{0,2})/)) {
        const dayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
        const targetDay = dayMap[match[1]];
        const hour = parseInt(match[2]);
        const minute = match[3] ? parseInt(match[3]) : 0;
        const adjustedHour = (text.includes('下午') || text.includes('晚上')) ? hour + 12 : hour;
        const date = new Date(now);
        const currentDay = date.getDay();
        const daysUntilNext = (targetDay - currentDay + 7) % 7 + 7;
        date.setDate(date.getDate() + daysUntilNext);
        date.setHours(adjustedHour, minute, 0, 0);
        pushSchedule(extractTitle(text, /下周[一二三四五六日天].*?\d{1,2}[点:：]\d{0,2}/), date);
    }

    if (match = text.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:.*?)(\d{1,2})[点:：](\d{0,2})/)) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        const hour = parseInt(match[4]);
        const minute = match[5] ? parseInt(match[5]) : 0;
        const date = new Date(year, month, day, hour, minute, 0, 0);
        pushSchedule(extractTitle(text, /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}.*?\d{1,2}[点:：]\d{0,2}/), date);
    }

    return result;
}

// 渲染记录列表
function renderRecords() {
    const container = document.getElementById('records-container');

    if (records.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><p>${t('noRecords')}</p></div>`;
        return;
    }

    const scheduleRecordIds = new Set(schedules.map(s => s.recordId));

    container.innerHTML = records.slice(0, 20).map(record => {
        const time = new Date(record.timestamp);
        const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
        const scheduleIcon = scheduleRecordIds.has(record.id) ? ' 📅' : '';
        const isEditing = record.id === editingRecordId;

        return `<div class="record-item${isEditing ? ' editing' : ''}">
            <div class="record-content">${escapeHtml(record.content)}${scheduleIcon}</div>
            <div class="record-meta">
                <div class="record-time">${timeStr}</div>
                <div class="record-actions">
                    <button class="edit-btn" onclick="editRecord(${record.id})">${t('editBtn')}</button>
                    <button class="delete-btn" onclick="deleteRecord(${record.id})">${t('deleteBtn')}</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// 编辑记录
function editRecord(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;

    editingRecordId = id;
    document.getElementById('record-input').value = record.content;
    document.getElementById('record-input').focus();
    document.getElementById('save-btn').textContent = t('updateBtn');

    renderRecords();
    document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
}

// 退出编辑模式
function exitEditMode() {
    editingRecordId = null;
    document.getElementById('save-btn').textContent = t('saveBtn');
}

// 删除记录
function deleteRecord(id) {
    if (!confirm(t('confirmDelete'))) return;

    records = records.filter(r => r.id !== id);
    schedules = schedules.filter(s => s.recordId !== id);
    localStorage.setItem('records', JSON.stringify(records));
    localStorage.setItem('schedules', JSON.stringify(schedules));

    renderRecords();
    renderSchedules();
}

// ============================================================
// 日程页面
// ============================================================
function initScheduleTab() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const refreshBtn = document.getElementById('refresh-schedule-btn');
    const syncBtn = document.getElementById('sync-schedule-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSchedules(btn.dataset.filter);
        });
    });

    refreshBtn.addEventListener('click', () => renderSchedules());

    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            syncBtn.textContent = '⏳';
            await syncSchedulesFromRecords();
            hasAISynced = true;
            renderSchedules();
            syncBtn.textContent = '🔗';
            alert(t('syncComplete'));
        });
    }
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

没有日程返回空数组 []。

记录列表：
${JSON.stringify(allTexts)}

只返回 JSON。`;

    try {
        const response = await callAI(prompt);
        const schedulesData = parseAIJSON(response);

        if (Array.isArray(schedulesData)) {
            schedulesData.forEach(s => {
                if (s.recordId && s.datetime) {
                    schedules.push({
                        id: generateId(),
                        title: s.title || '',
                        datetime: s.datetime,
                        recordId: s.recordId,
                        timestamp: new Date().toISOString()
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

function renderSchedules(filter = 'all') {
    const container = document.getElementById('schedule-container');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let filteredSchedules = schedules;

    if (filter === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filteredSchedules = schedules.filter(s => {
            const d = new Date(s.datetime);
            return d >= today && d < tomorrow;
        });
    } else if (filter === 'week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        filteredSchedules = schedules.filter(s => {
            const d = new Date(s.datetime);
            return d >= today && d < weekEnd;
        });
    } else if (filter === 'upcoming') {
        filteredSchedules = schedules.filter(s => new Date(s.datetime) > now);
    }

    filteredSchedules.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (filteredSchedules.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><p>${t('noSchedules')}</p></div>`;
        return;
    }

    const groups = {};
    filteredSchedules.forEach(schedule => {
        const date = new Date(schedule.datetime);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!groups[dateKey]) {
            groups[dateKey] = { label: getDateLabel(date), items: [] };
        }
        groups[dateKey].items.push(schedule);
    });

    let html = '';
    Object.keys(groups).forEach(key => {
        const group = groups[key];
        html += `<div class="schedule-group"><div class="schedule-group-header">${group.label}</div>`;
        group.items.forEach(schedule => {
            const date = new Date(schedule.datetime);
            const timeStr = formatTime(date);
            const title = schedule.title || schedule.content || '';
            html += `<div class="schedule-item">
                <div class="schedule-time">${timeStr}</div>
                <div class="schedule-content">${escapeHtml(title)}</div>
                <button class="delete-btn" onclick="deleteSchedule(${schedule.id})">${t('deleteBtn')}</button>
            </div>`;
        });
        html += '</div>';
    });

    container.innerHTML = html;
}

function deleteSchedule(id) {
    if (!confirm(t('confirmDeleteSchedule'))) return;
    schedules = schedules.filter(s => s.id !== id);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    renderSchedules();
    renderRecords();
}

function getDateLabel(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateOnly.getTime() === today.getTime()) return t('today');
    if (dateOnly.getTime() === tomorrow.getTime()) return t('tomorrow');

    return `${date.getMonth() + 1}${currentLang === 'zh' ? '月' : '/'}${date.getDate()}${currentLang === 'zh' ? '日' : ''} ${t('weekDays')[date.getDay()]}`;
}

// ============================================================
// 问答页面
// ============================================================
function initQATab() {
    const askBtn = document.getElementById('ask-btn');
    const qaInput = document.getElementById('qa-input');

    askBtn.addEventListener('click', handleQuestion);
    qaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleQuestion();
    });

    addQAMessage('assistant', t('qaWelcome'));
}

async function handleQuestion() {
    if (isAsking) return;

    const input = document.getElementById('qa-input');
    const askBtn = document.getElementById('ask-btn');
    const question = input.value.trim();
    if (!question) return;

    isAsking = true;
    askBtn.disabled = true;
    askBtn.textContent = '...';

    addQAMessage('user', question);
    input.value = '';

    const loadingId = Date.now();
    addQAMessage('assistant', t('qaThinking'), loadingId);

    try {
        const schedulesSummary = schedules.map(s => {
            const date = new Date(s.datetime);
            return `- ${formatDate(date)} ${formatTime(date)}: ${s.title || s.content}`;
        }).join('\n');

        const recordsSummary = records.slice(0, 20).map(r => {
            const time = new Date(r.timestamp);
            return `- [${time.getMonth()+1}/${time.getDate()}] ${r.content}`;
        }).join('\n');

        const prompt = `你是一个日程管理助手。以下是用户的记录和日程数据：

【记录列表】
${recordsSummary || (currentLang === 'zh' ? '暂无记录' : 'No records')}

【日程列表】
${schedulesSummary || (currentLang === 'zh' ? '暂无日程' : 'No events')}

用户的问题：${question}

请根据以上数据回答用户的问题。如果没有相关数据，给出友好的提示。回答要简洁明了。`;

        const answer = await callAI(prompt);
        const loadingEl = document.querySelector(`[data-msg-id="${loadingId}"]`);
        if (loadingEl) {
            loadingEl.querySelector('.qa-bubble').textContent = answer;
        }
    } catch (error) {
        console.error('AI answer failed:', error);
        const loadingEl = document.querySelector(`[data-msg-id="${loadingId}"]`);
        if (loadingEl) {
            loadingEl.querySelector('.qa-bubble').textContent = generateAnswer(question);
        }
    } finally {
        isAsking = false;
        askBtn.disabled = false;
        askBtn.textContent = t('askBtn');
        const history = document.getElementById('qa-history');
        history.scrollTop = history.scrollHeight;
    }
}

function generateAnswer(question) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (question.includes('今天') || question.includes('今日') || question.toLowerCase().includes('today')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todaySchedules = schedules.filter(s => {
            const d = new Date(s.datetime);
            return d >= today && d < tomorrow;
        });
        if (todaySchedules.length === 0) return currentLang === 'zh' ? '今天没有安排日程。' : 'No events today.';
        return (currentLang === 'zh' ? `今天有 ${todaySchedules.length} 个日程：\n` : `${todaySchedules.length} events today:\n`) +
            todaySchedules.map(s => `• ${formatTime(new Date(s.datetime))} - ${s.title || s.content}`).join('\n');
    }

    if (question.includes('明天') || question.toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        const tomorrowSchedules = schedules.filter(s => {
            const d = new Date(s.datetime);
            return d >= tomorrow && d < dayAfter;
        });
        if (tomorrowSchedules.length === 0) return currentLang === 'zh' ? '明天没有安排日程。' : 'No events tomorrow.';
        return (currentLang === 'zh' ? `明天有 ${tomorrowSchedules.length} 个日程：\n` : `${tomorrowSchedules.length} events tomorrow:\n`) +
            tomorrowSchedules.map(s => `• ${formatTime(new Date(s.datetime))} - ${s.title || s.content}`).join('\n');
    }

    if (question.includes('这周') || question.includes('本周') || question.includes('星期') || question.toLowerCase().includes('week')) {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekSchedules = schedules.filter(s => {
            const d = new Date(s.datetime);
            return d >= today && d < weekEnd;
        });
        if (weekSchedules.length === 0) return currentLang === 'zh' ? '这周没有安排日程。' : 'No events this week.';
        return (currentLang === 'zh' ? `这周有 ${weekSchedules.length} 个日程：\n` : `${weekSchedules.length} events this week:\n`) +
            weekSchedules.map(s => `• ${formatDate(new Date(s.datetime))} - ${s.title || s.content}`).join('\n');
    }

    if (question.includes('所有') || question.includes('全部') || question.includes('日程') || question.toLowerCase().includes('all') || question.toLowerCase().includes('schedule')) {
        const upcoming = schedules.filter(s => new Date(s.datetime) > now);
        if (upcoming.length === 0) return currentLang === 'zh' ? '目前没有未来的日程安排。' : 'No upcoming events.';
        return (currentLang === 'zh' ? `共有 ${upcoming.length} 个未来日程：\n` : `${upcoming.length} upcoming events:\n`) +
            upcoming.map(s => `• ${formatDate(new Date(s.datetime))} - ${s.title || s.content}`).join('\n');
    }

    return currentLang === 'zh'
        ? '我可以帮你查询日程。试试问我：\n• "今天有什么安排？"\n• "明天有哪些事？"\n• "这周的日程"\n• "所有日程"'
        : 'I can help you check your schedule. Try asking:\n• "What\'s today?"\n• "What\'s tomorrow?"\n• "This week"\n• "All events"';
}

function addQAMessage(role, content, msgId = null) {
    const history = document.getElementById('qa-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `qa-message ${role}`;
    if (msgId) messageDiv.setAttribute('data-msg-id', msgId);

    const bubble = document.createElement('div');
    bubble.className = 'qa-bubble';
    bubble.textContent = content;

    messageDiv.appendChild(bubble);
    history.appendChild(messageDiv);
    history.scrollTop = history.scrollHeight;
}

// ============================================================
// 统计页面
// ============================================================
function initStatsTab() {
    // 统计页面在切换时自动渲染
}

function renderStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 统计数据
    const todayCount = schedules.filter(s => {
        const d = new Date(s.datetime);
        return d >= today && d < new Date(today.getTime() + 86400000);
    }).length;

    const weekCount = schedules.filter(s => {
        const d = new Date(s.datetime);
        return d >= today && d < weekEnd;
    }).length;

    const monthRecords = records.filter(r => new Date(r.timestamp) >= monthStart).length;
    const avgPerDay = records.length > 0 ? (records.length / Math.max(1, getDaysSinceFirstRecord())).toFixed(1) : '0';

    document.getElementById('stat-records').textContent = records.length;
    document.getElementById('stat-schedules').textContent = schedules.length;
    document.getElementById('stat-today').textContent = todayCount;
    document.getElementById('stat-week').textContent = weekCount;

    // 绘制图表
    drawWeeklyChart();
    drawHourChart();
    drawMonthlyChart();
}

function getDaysSinceFirstRecord() {
    if (records.length === 0) return 1;
    const oldest = new Date(records[records.length - 1].timestamp);
    const now = new Date();
    const diff = Math.ceil((now - oldest) / 86400000);
    return Math.max(1, diff);
}

// 本周记录趋势（柱状图）
function drawWeeklyChart() {
    const canvas = document.getElementById('weekly-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width - 32;
    const height = 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const isDark = currentTheme === 'dark';
    const gridColor = isDark ? '#2a2a4a' : '#e0e0e0';
    const textColor = isDark ? '#aaaaaa' : '#666666';
    const barColor = '#667eea';
    const barHoverColor = '#5a6fd6';

    // 获取最近7天的数据
    const days = [];
    const counts = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        const count = records.filter(r => {
            const rd = new Date(r.timestamp);
            return rd >= dayStart && rd < dayEnd;
        }).length;
        days.push(t('chartWeekDays')[(d.getDay() + 6) % 7]);
        counts.push(count);
    }

    const maxCount = Math.max(...counts, 1);
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / 7 * 0.6;
    const barGap = chartWidth / 7;

    // 网格线
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxCount - (maxCount / 4) * i), padding.left - 8, y + 4);
    }

    // 柱状图
    counts.forEach((count, i) => {
        const x = padding.left + barGap * i + (barGap - barWidth) / 2;
        const barHeight = (count / maxCount) * chartHeight;
        const y = padding.top + chartHeight - barHeight;

        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(1, barHoverColor);
        ctx.fillStyle = gradient;

        // 圆角矩形
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.lineTo(x, y + barHeight);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // X 轴标签
        ctx.fillStyle = textColor;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(days[i], x + barWidth / 2, height - 8);

        // 数值标签
        if (count > 0) {
            ctx.fillStyle = barColor;
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(count, x + barWidth / 2, y - 6);
        }
    });
}

// 日程时间分布（24小时柱状图）
function drawHourChart() {
    const canvas = document.getElementById('hour-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width - 32;
    const height = 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const isDark = currentTheme === 'dark';
    const gridColor = isDark ? '#2a2a4a' : '#e0e0e0';
    const textColor = isDark ? '#aaaaaa' : '#666666';
    const barColor = '#764ba2';

    const hourCounts = new Array(24).fill(0);
    schedules.forEach(s => {
        const hour = new Date(s.datetime).getHours();
        hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts, 1);
    const padding = { top: 20, right: 10, bottom: 30, left: 35 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / 24 * 0.7;
    const barGap = chartWidth / 24;

    // 网格线
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxCount - (maxCount / 4) * i), padding.left - 6, y + 4);
    }

    // 柱状图（每3小时显示一个标签）
    hourCounts.forEach((count, i) => {
        const x = padding.left + barGap * i + (barGap - barWidth) / 2;
        const barHeight = (count / maxCount) * chartHeight;
        const y = padding.top + chartHeight - barHeight;

        ctx.fillStyle = barColor;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.globalAlpha = 1;

        if (i % 3 === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${String(i).padStart(2, '0')}:00`, x + barWidth / 2, height - 8);
        }
    });
}

// 月度趋势（折线图）
function drawMonthlyChart() {
    const canvas = document.getElementById('monthly-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    const width = rect.width - 32;
    const height = 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const isDark = currentTheme === 'dark';
    const gridColor = isDark ? '#2a2a4a' : '#e0e0e0';
    const textColor = isDark ? '#aaaaaa' : '#666666';
    const lineColor = '#764ba2';
    const dotColor = '#667eea';

    // 获取最近6个月的数据
    const months = [];
    const counts = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const count = records.filter(r => {
            const rd = new Date(r.timestamp);
            return rd >= monthStart && rd < monthEnd;
        }).length;
        months.push(t('months')[d.getMonth()]);
        counts.push(count);
    }

    const maxCount = Math.max(...counts, 1);
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 网格线
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxCount - (maxCount / 4) * i), padding.left - 8, y + 4);
    }

    // 折线
    const points = counts.map((count, i) => ({
        x: padding.left + (chartWidth / (counts.length - 1 || 1)) * i,
        y: padding.top + chartHeight - (count / maxCount) * chartHeight
    }));

    if (points.length > 1) {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        // 填充区域
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(points[0].x, padding.top + chartHeight);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // 数据点和标签
    points.forEach((p, i) => {
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(months[i], p.x, height - 8);

        if (counts[i] > 0) {
            ctx.fillStyle = dotColor;
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(counts[i], p.x, p.y - 10);
        }
    });
}

// ============================================================
// 设置页面
// ============================================================
function initSettingsTab() {
    // 导出
    document.getElementById('export-btn').addEventListener('click', exportData);

    // 导入
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-input').click();
    });
    document.getElementById('import-input').addEventListener('change', importData);

    // 清除
    document.getElementById('clear-btn').addEventListener('click', clearAllData);

    // 语言切换
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });

    // AI 翻译
    document.getElementById('translate-btn').addEventListener('click', translateAllRecords);

    // 主题切换
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });

    // 头部工具按钮
    document.getElementById('theme-toggle').addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    document.getElementById('lang-toggle').addEventListener('click', () => {
        applyLanguage(currentLang === 'zh' ? 'en' : 'zh');
    });
}

// 导出数据
function exportData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        records: records,
        schedules: schedules
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `record-assistant-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(t('exportSuccess'));
}

// 导入数据
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);

            if (data.records && Array.isArray(data.records)) {
                records = data.records;
                localStorage.setItem('records', JSON.stringify(records));
            }

            if (data.schedules && Array.isArray(data.schedules)) {
                schedules = data.schedules;
                localStorage.setItem('schedules', JSON.stringify(schedules));
            }

            renderRecords();
            renderSchedules();
            renderStats();
            alert(t('importSuccess'));
        } catch (error) {
            console.error('Import failed:', error);
            alert(t('importFail'));
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// 清除所有数据
function clearAllData() {
    if (!confirm(t('confirmClear'))) return;

    records = [];
    schedules = [];
    localStorage.removeItem('records');
    localStorage.removeItem('schedules');

    renderRecords();
    renderSchedules();
    renderStats();
}

// AI 翻译所有记录
async function translateAllRecords() {
    if (isTranslating) return;
    if (records.length === 0) return;

    isTranslating = true;
    const translateBtn = document.getElementById('translate-btn');
    const translateStatus = document.getElementById('translate-status');
    const targetLang = currentLang === 'zh' ? 'English' : '中文';

    translateBtn.disabled = true;
    translateStatus.className = 'translate-status processing';
    translateStatus.textContent = currentLang === 'zh' ? `正在翻译为 ${targetLang}...` : `Translating to ${targetLang}...`;

    try {
        const allContent = records.map((r, i) => `[${i + 1}] ${r.content}`).join('\n');
        const prompt = `请将以下记录翻译为${targetLang}。保持编号不变，每行一条翻译结果，只返回翻译后的文本，不要其他说明。

${allContent}`;

        const response = await callAI(prompt, 30000);
        const lines = response.trim().split('\n');

        lines.forEach((line, i) => {
            if (records[i]) {
                // 去除编号前缀
                const translated = line.replace(/^\[\d+\]\s*/, '');
                records[i].content = translated;
            }
        });

        localStorage.setItem('records', JSON.stringify(records));
        renderRecords();

        translateStatus.className = 'translate-status success';
        translateStatus.textContent = t('translateSuccess');
    } catch (error) {
        console.error('Translation failed:', error);
        translateStatus.className = 'translate-status error';
        translateStatus.textContent = t('translateFail');
    } finally {
        isTranslating = false;
        translateBtn.disabled = false;
        setTimeout(() => {
            translateStatus.textContent = '';
            translateStatus.className = 'translate-status';
        }, 3000);
    }
}

// ============================================================
// 工具函数
// ============================================================
function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let dayStr;
    if (dateOnly.getTime() === today.getTime()) dayStr = t('today');
    else if (dateOnly.getTime() === tomorrow.getTime()) dayStr = t('tomorrow');
    else {
        dayStr = `${date.getMonth() + 1}${currentLang === 'zh' ? '月' : '/'}${date.getDate()}${currentLang === 'zh' ? '日' : ''} ${t('weekDays')[date.getDay()]}`;
    }

    return `${dayStr} ${formatTime(date)}`;
}

function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
