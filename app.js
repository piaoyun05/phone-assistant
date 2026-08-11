// 数据存储
let records = JSON.parse(localStorage.getItem('records') || '[]');
let schedules = JSON.parse(localStorage.getItem('schedules') || '[]');

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initRecordTab();
    initScheduleTab();
    initQATab();
    renderRecords();
    renderSchedules();
});

// 从记录重新同步日程
function syncSchedulesFromRecords() {
    schedules = [];
    records.forEach(record => {
        const extracted = parseSchedules(record.content);
        extracted.forEach(s => {
            s.recordId = record.id;
        });
        schedules.push(...extracted);
    });
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

// 标签页切换
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');

            // 切换到日程页面时自动同步
            if (targetTab === 'schedule') {
                syncSchedulesFromRecords();
                renderSchedules();
            }
        });
    });
}

// 记录页面初始化
function initRecordTab() {
    const saveBtn = document.getElementById('save-btn');
    const recordInput = document.getElementById('record-input');

    saveBtn.addEventListener('click', () => {
        const content = recordInput.value.trim();
        if (!content) {
            alert('请输入内容');
            return;
        }

        // 保存记录
        const record = {
            id: Date.now(),
            content: content,
            timestamp: new Date().toISOString()
        };
        records.unshift(record);
        localStorage.setItem('records', JSON.stringify(records));

        // 解析日程
        const extractedSchedules = parseSchedules(content);
        if (extractedSchedules.length > 0) {
            extractedSchedules.forEach(s => { s.recordId = record.id; });
            schedules.push(...extractedSchedules);
            localStorage.setItem('schedules', JSON.stringify(schedules));
            renderSchedules();
            alert(`已保存记录，并识别到 ${extractedSchedules.length} 个日程`);
        } else {
            alert('记录已保存');
        }

        recordInput.value = '';
        renderRecords();
    });
}

// 解析日程 - 增强版
function parseSchedules(text) {
    const schedules = [];
    const now = new Date();
    let match;

    // 提取事项标题（去掉时间部分）
    function extractTitle(text, timePattern) {
        let title = text.replace(timePattern, '').trim();
        title = title.replace(/^[,，、\s]+/, '').trim();
        return title || text;
    }

    // 今天
    if (match = text.match(/今天(?:下午|晚上|上午|早上)?(\d{1,2})[点:：](\d{0,2})/)) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const adjustedHour = text.includes('下午') || text.includes('晚上') ? hour + 12 : hour;
        const date = new Date(now);
        date.setHours(adjustedHour, minute, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            title: extractTitle(text, /今天.*?\d{1,2}[点:：]\d{0,2}/),
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    // 明天
    if (match = text.match(/明天(?:下午|晚上|上午|早上)?(\d{1,2})[点:：](\d{0,2})/)) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const adjustedHour = text.includes('下午') || text.includes('晚上') ? hour + 12 : hour;
        const date = new Date(now);
        date.setDate(date.getDate() + 1);
        date.setHours(adjustedHour, minute, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            title: extractTitle(text, /明天.*?\d{1,2}[点:：]\d{0,2}/),
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    // 后天
    if (match = text.match(/后天(?:下午|晚上|上午|早上)?(\d{1,2})[点:：](\d{0,2})/)) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const adjustedHour = text.includes('下午') || text.includes('晚上') ? hour + 12 : hour;
        const date = new Date(now);
        date.setDate(date.getDate() + 2);
        date.setHours(adjustedHour, minute, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            title: extractTitle(text, /后天.*?\d{1,2}[点:：]\d{0,2}/),
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    // 下周一到周日
    if (match = text.match(/下周([一二三四五六日天])(?:下午|晚上|上午|早上)?(\d{1,2})[点:：](\d{0,2})/)) {
        const dayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
        const targetDay = dayMap[match[1]];
        const hour = parseInt(match[2]);
        const minute = match[3] ? parseInt(match[3]) : 0;
        const adjustedHour = text.includes('下午') || text.includes('晚上') ? hour + 12 : hour;

        const date = new Date(now);
        const currentDay = date.getDay();
        const daysUntilNext = (targetDay - currentDay + 7) % 7 + 7;
        date.setDate(date.getDate() + daysUntilNext);
        date.setHours(adjustedHour, minute, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            title: extractTitle(text, /下周[一二三四五六日天].*?\d{1,2}[点:：]\d{0,2}/),
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    // 具体日期 2024-01-15 或 2024/01/15
    if (match = text.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:.*?)(\d{1,2})[点:：](\d{0,2})/)) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        const hour = parseInt(match[4]);
        const minute = match[5] ? parseInt(match[5]) : 0;

        const date = new Date(year, month, day, hour, minute, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            title: extractTitle(text, /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}.*?\d{1,2}[点:：]\d{0,2}/),
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    return schedules;
}

// 渲染记录列表
function renderRecords() {
    const container = document.getElementById('records-container');

    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>还没有记录</p>
            </div>
        `;
        return;
    }

    container.innerHTML = records.slice(0, 20).map(record => {
        const time = new Date(record.timestamp);
        const timeStr = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;

        // 检查是否有对应的日程
        const hasSchedule = schedules.some(s => s.recordId === record.id);
        const scheduleIcon = hasSchedule ? ' 📅' : '';

        return `
            <div class="record-item">
                <div class="record-content">${escapeHtml(record.content)}${scheduleIcon}</div>
                <div class="record-time">${timeStr}</div>
            </div>
        `;
    }).join('');
}

// 日程页面初始化
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

    refreshBtn.addEventListener('click', () => {
        syncSchedulesFromRecords();
        renderSchedules();
    });

    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            syncSchedulesFromRecords();
            renderSchedules();
            alert('日程同步完成');
        });
    }
}

// 渲染日程列表 - 按日期分组
function renderSchedules(filter = 'all') {
    const container = document.getElementById('schedule-container');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let filteredSchedules = [...schedules];

    // 过滤日程
    if (filter === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filteredSchedules = schedules.filter(s => {
            const date = new Date(s.datetime);
            return date >= today && date < tomorrow;
        });
    } else if (filter === 'week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        filteredSchedules = schedules.filter(s => {
            const date = new Date(s.datetime);
            return date >= today && date < weekEnd;
        });
    } else if (filter === 'upcoming') {
        filteredSchedules = schedules.filter(s => new Date(s.datetime) > now);
    }

    // 按时间排序
    filteredSchedules.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    if (filteredSchedules.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <p>暂无日程</p>
            </div>
        `;
        return;
    }

    // 按日期分组
    const groups = {};
    filteredSchedules.forEach(schedule => {
        const date = new Date(schedule.datetime);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!groups[dateKey]) {
            groups[dateKey] = {
                label: getDateLabel(date),
                items: []
            };
        }
        groups[dateKey].items.push(schedule);
    });

    // 渲染分组
    let html = '';
    Object.keys(groups).forEach(key => {
        const group = groups[key];
        html += `<div class="schedule-group">`;
        html += `<div class="schedule-group-header">${group.label}</div>`;
        group.items.forEach(schedule => {
            const date = new Date(schedule.datetime);
            const timeStr = formatTime(date);
            const title = schedule.title || schedule.content;
            html += `
                <div class="schedule-item">
                    <div class="schedule-time">${timeStr}</div>
                    <div class="schedule-content">${escapeHtml(title)}</div>
                </div>
            `;
        });
        html += `</div>`;
    });

    container.innerHTML = html;
}

// 获取日期标签
function getDateLabel(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dateOnly.getTime() === today.getTime()) {
        return '今天';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return '明天';
    } else {
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`;
    }
}

// 问答页面初始化
function initQATab() {
    const askBtn = document.getElementById('ask-btn');
    const qaInput = document.getElementById('qa-input');

    askBtn.addEventListener('click', handleQuestion);
    qaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleQuestion();
        }
    });

    // 显示欢迎消息
    addQAMessage('assistant', '你好！我可以帮你查询日程安排。试试问我："明天有什么安排？"或"这周有哪些事情？"');
}

// 处理问题
function handleQuestion() {
    const input = document.getElementById('qa-input');
    const question = input.value.trim();

    if (!question) return;

    addQAMessage('user', question);
    input.value = '';

    // 延迟回答，模拟思考
    setTimeout(() => {
        const answer = generateAnswer(question);
        addQAMessage('assistant', answer);
    }, 500);
}

// 生成回答
function generateAnswer(question) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 解析问题
    if (question.includes('今天') || question.includes('今日')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todaySchedules = schedules.filter(s => {
            const date = new Date(s.datetime);
            return date >= today && date < tomorrow;
        });

        if (todaySchedules.length === 0) {
            return '今天没有安排日程。';
        }

        return `今天有 ${todaySchedules.length} 个日程：\n` +
            todaySchedules.map(s => `• ${formatTime(new Date(s.datetime))} - ${s.title || s.content}`).join('\n');
    }

    if (question.includes('明天')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const tomorrowSchedules = schedules.filter(s => {
            const date = new Date(s.datetime);
            return date >= tomorrow && date < dayAfter;
        });

        if (tomorrowSchedules.length === 0) {
            return '明天没有安排日程。';
        }

        return `明天有 ${tomorrowSchedules.length} 个日程：\n` +
            tomorrowSchedules.map(s => `• ${formatTime(new Date(s.datetime))} - ${s.content}`).join('\n');
    }

    if (question.includes('这周') || question.includes('本周') || question.includes('星期')) {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const weekSchedules = schedules.filter(s => {
            const date = new Date(s.datetime);
            return date >= today && date < weekEnd;
        });

        if (weekSchedules.length === 0) {
            return '这周没有安排日程。';
        }

        return `这周有 ${weekSchedules.length} 个日程：\n` +
            weekSchedules.map(s => {
                const date = new Date(s.datetime);
                return `• ${formatDate(date)} - ${s.content}`;
            }).join('\n');
    }

    if (question.includes('所有') || question.includes('全部') || question.includes('日程')) {
        const upcomingSchedules = schedules.filter(s => new Date(s.datetime) > now);

        if (upcomingSchedules.length === 0) {
            return '目前没有未来的日程安排。';
        }

        return `共有 ${upcomingSchedules.length} 个未来日程：\n` +
            upcomingSchedules.map(s => {
                const date = new Date(s.datetime);
                return `• ${formatDate(date)} - ${s.content}`;
            }).join('\n');
    }

    // 默认回答
    return '我可以帮你查询日程。试试问我：\n• "今天有什么安排？"\n• "明天有哪些事？"\n• "这周的日程"\n• "所有日程"';
}

// 添加问答消息
function addQAMessage(role, content) {
    const history = document.getElementById('qa-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `qa-message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'qa-bubble';
    bubble.textContent = content;

    messageDiv.appendChild(bubble);
    history.appendChild(messageDiv);

    // 滚动到底部
    history.scrollTop = history.scrollHeight;
}

// 工具函数
function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let dayStr;
    if (dateOnly.getTime() === today.getTime()) {
        dayStr = '今天';
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
        dayStr = '明天';
    } else {
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        dayStr = `${date.getMonth() + 1}月${date.getDate()}日 ${weekDays[date.getDay()]}`;
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${dayStr} ${hours}:${minutes}`;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
