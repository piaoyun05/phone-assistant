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

// 解析日程
function parseSchedules(text) {
    const schedules = [];
    const now = new Date();

    // 匹配日期时间模式
    const patterns = [
        // 明天下午3点
        { regex: /明天(?:下午|晚上)?(\d{1,2})点/, offset: 1, hour: null },
        // 后天上午10点
        { regex: /后天(?:上午|早上)?(\d{1,2})点/, offset: 2, hour: null },
        // 下周一上午10点
        { regex: /下周([一二三四五六日天])(?:上午|早上)?(\d{1,2})点/, offset: null, hour: null },
        // 今天/今晚
        { regex: /今天(?:下午|晚上)?(\d{1,2})点/, offset: 0, hour: null },
        // 具体日期 2024-01-15
        { regex: /(\d{4})-(\d{1,2})-(\d{1,2})(?:.*?)(\d{1,2})点/, offset: null, hour: null }
    ];

    // 简单的日程提取
    let match;

    // 明天
    if (match = text.match(/明天(?:下午|晚上)?(\d{1,2})点/)) {
        const hour = parseInt(match[1]);
        const adjustedHour = text.includes('下午') || text.includes('晚上') ? hour + 12 : hour;
        const date = new Date(now);
        date.setDate(date.getDate() + 1);
        date.setHours(adjustedHour, 0, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            content: text,
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    // 后天
    if (match = text.match(/后天(?:上午|早上)?(\d{1,2})点/)) {
        const hour = parseInt(match[1]);
        const date = new Date(now);
        date.setDate(date.getDate() + 2);
        date.setHours(hour, 0, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            content: text,
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    // 今天
    if (match = text.match(/今天(?:下午|晚上)?(\d{1,2})点/)) {
        const hour = parseInt(match[1]);
        const adjustedHour = text.includes('下午') || text.includes('晚上') ? hour + 12 : hour;
        const date = new Date(now);
        date.setHours(adjustedHour, 0, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            content: text,
            datetime: date.toISOString(),
            timestamp: new Date().toISOString()
        });
    }

    // 下周一到周日
    if (match = text.match(/下周([一二三四五六日天])(?:上午|早上|下午|晚上)?(\d{1,2})点/)) {
        const dayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 0, '天': 0 };
        const targetDay = dayMap[match[1]];
        const hour = parseInt(match[2]);
        const adjustedHour = text.includes('下午') || text.includes('晚上') ? hour + 12 : hour;

        const date = new Date(now);
        const currentDay = date.getDay();
        const daysUntilNext = (targetDay - currentDay + 7) % 7 + 7;
        date.setDate(date.getDate() + daysUntilNext);
        date.setHours(adjustedHour, 0, 0, 0);

        schedules.push({
            id: Date.now() + Math.random(),
            content: text,
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

        return `
            <div class="record-item">
                <div class="record-content">${escapeHtml(record.content)}</div>
                <div class="record-time">${timeStr}</div>
            </div>
        `;
    }).join('');
}

// 日程页面初始化
function initScheduleTab() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const refreshBtn = document.getElementById('refresh-schedule-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSchedules(btn.dataset.filter);
        });
    });

    refreshBtn.addEventListener('click', () => {
        renderSchedules();
    });
}

// 渲染日程列表
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

    container.innerHTML = filteredSchedules.map(schedule => {
        const date = new Date(schedule.datetime);
        const dateStr = formatDate(date);

        return `
            <div class="schedule-item">
                <div class="schedule-date">${dateStr}</div>
                <div class="schedule-content">${escapeHtml(schedule.content)}</div>
            </div>
        `;
    }).join('');
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
            todaySchedules.map(s => `• ${formatTime(new Date(s.datetime))} - ${s.content}`).join('\n');
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
