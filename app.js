let selectedMood = '';
const moodThemeMap = {
    '难受': { bg: '#eef2f7', theme: '#2f80ed', note: '沉稳蓝，平复思绪' },
    '一般': { bg: '#f8f9fa', theme: '#6c757d', note: '中性灰，保持客观' },
    '压力': { bg: '#fff4f2', theme: '#eb5757', note: '警示红，提醒减压' },
    '不错': { bg: '#f2faf5', theme: '#27ae60', note: '希望绿，积极共鸣' }
};

function showPage(type) {
    const contentBox = document.getElementById('content');
    if (type === 'student') {
        contentBox.innerHTML = `
            <div class="card">
                <h3>📮 心灵邮筒</h3>
                <textarea id="userInput" placeholder="写下你此时此刻真实的感受..."></textarea>
            </div>
            <div class="card">
                <h3>🌈 情绪状态</h3>
                <div id="moodGroup">
                    ${Object.keys(moodThemeMap).map(m => `<button class="mood-btn" onclick="selectMood(event,'${m}')">${m}</button>`).join('')}
                </div>
            </div>
            <div style="margin-bottom:30px;">
                <button onclick="submitEmotion()" style="width:180px; font-size:1.1rem;">发送心事</button>
                <button onclick="clearChat()" style="background:#dee2e6; color:#495057; margin-left:10px;">清空记录</button>
            </div>
            <div id="resultBox"></div>
        `;
        setTimeout(loadChat, 100);
    } else { renderTeacher(); }
}

function selectMood(e, mood) {
    selectedMood = mood;
    const config = moodThemeMap[mood] || moodThemeMap['一般'];
    document.body.style.background = config.bg; // 氛围干预
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.style.background = '#f1f3f5'; btn.style.color = '#495057';
    });
    e.target.style.background = config.theme; e.target.style.color = 'white';
}

function submitEmotion() {
    const input = document.getElementById('userInput');
    const text = input.value;
    const chatBox = document.getElementById('resultBox');
    if (!text && !selectedMood) return alert("请先投递你的心情片段...");

    const userText = text || `我现在感觉${selectedMood}`;
    appendMsg(chatBox, "chat-user", "👤 " + userText);
    
    const risk = analyzeRisk(text, selectedMood);
    const response = getResponse(risk);
    
    saveRecord(text, risk);
    input.value = '';

    const loading = appendMsg(chatBox, "chat-ai", "🤖 正在感应你的情绪...");
    setTimeout(() => {
        loading.remove();
        const aiMsg = appendMsg(chatBox, "chat-ai", "");
        typeWriter(aiMsg, "🤖 " + response);

        if (risk !== '低风险' || selectedMood === '压力') {
            setTimeout(() => addBreathExercise(chatBox), 1500);
        } else {
            setTimeout(() => {
                appendMsg(chatBox, "chat-tip", "💡 建议：" + getSuggestion(risk));
                saveChat();
            }, 1000);
        }
    }, 800);
}

function addBreathExercise(box) {
    const wrap = document.createElement('div');
    wrap.className = 'breath-box card';
    wrap.innerHTML = `
        <div class="breath-circle"></div>
        <h4 id="breathTxt" style="color:#2f80ed">跟随圆圈，缓慢深呼吸...</h4>
        <p style="font-size:0.9rem; color:#888;">专注这一刻的呼吸，能有效缓解焦虑</p>
        <button onclick="this.parentElement.remove()" style="background:#eee; color:#666; margin-top:10px;">我感觉好些了</button>
    `;
    box.appendChild(wrap);
    let isIn = true;
    const interval = setInterval(() => {
        if(!document.contains(wrap)) return clearInterval(interval);
        isIn = !isIn;
        document.getElementById('breathTxt').innerText = isIn ? "吸气... 感受能量" : "呼气... 释放压力";
    }, 4000);
    scrollToBottom();
}

function analyzeRisk(text, mood) {
    const highWeight = ['死', '绝望', '离开世界', '自残', '撑不下'];
    const midWeight = ['累', '焦虑', '失眠', '烦躁', '压力', '难过', '哭'];
    if (highWeight.some(w => text.includes(w))) return '高风险';
    let score = midWeight.filter(w => text.includes(w)).length;
    if (mood === '压力' || mood === '难受') score += 2;
    return score >= 3 ? '高风险' : (score >= 1 ? '中风险' : '低风险');
}

function getResponse(risk) {
    const data = {
        '高风险': ["听到你这么说，我很心疼。请一定要抱抱自己，你的存在本身就很有意义。", "这一刻确实很艰难，但请相信，我一直在这里听你说。"],
        '中风险': ["感觉你最近背负了很多，偶尔给自己按个暂停键吧。", "生活不需要一直保持100分，现在的你已经很棒了。"],
        '低风险': ["能觉察并表达自己的情绪，是心灵健康的开始。", "很高兴看到你状态不错，继续保持这份觉察吧。"]
    };
    const list = data[risk];
    return list[Math.floor(Math.random() * list.length)];
}

function getSuggestion(risk) {
    if (risk === '高风险') return "你需要更专业的支持，建议拨打校内心理中心电话或寻找信任的老师。";
    if (risk === '中风险') return "可以试着听听白噪音，或者去户外走走，给心灵充个电。";
    return "保持良好的作息，你现在的节奏非常棒！";
}

function appendMsg(box, cls, text) {
    const div = document.createElement("div");
    div.className = "chat-item " + cls;
    div.innerText = text;
    box.appendChild(div);
    scrollToBottom();
    return div;
}

function typeWriter(el, text) {
    let i = 0;
    (function run() { if (i < text.length) { el.innerHTML += text[i++]; setTimeout(run, 40); } })();
}

function scrollToBottom() {
    const area = document.querySelector('.content-area');
    area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
}

function saveChat() { localStorage.setItem('v2_history', document.getElementById('resultBox').innerHTML); }
function loadChat() { 
    const data = localStorage.getItem('v2_history');
    if (data) document.getElementById('resultBox').innerHTML = data; 
}
function clearChat() { localStorage.removeItem('v2_history'); document.getElementById('resultBox').innerHTML = ''; }
function saveRecord(text, risk) {
    let records = JSON.parse(localStorage.getItem('records') || '[]');
    records.push({ text, risk, time: new Date().toLocaleString() });
    localStorage.setItem('records', JSON.stringify(records));
}

function renderTeacher() {
    const contentBox = document.getElementById('content');
    const records = JSON.parse(localStorage.getItem('records') || '[]');
    let stats = { '高风险':0, '中风险':0, '低风险':0 };
    records.forEach(r => stats[r.risk]++);

    const listHtml = records.slice(-6).reverse().map(r => `
        <div class="card ${r.risk === '高风险' ? 'high alert' : (r.risk === '中风险' ? 'mid' : 'low')}">
            <div style="display:flex; justify:space-between;">
                <strong>状态：${r.risk}</strong>
                <small>${r.time}</small>
            </div>
            <p style="margin-top:10px; color:#666;">内容：${r.text || '未填写文字'}</p>
        </div>
    `).join('');

    contentBox.innerHTML = `
        <h2>📊 教师端 · 危机预警看板</h2>
        <div style="display:flex; gap:15px; margin-bottom:25px;">
            <div class="card high" style="flex:1; text-align:center;"><h3>${stats['高风险']}</h3>高风险</div>
            <div class="card mid" style="flex:1; text-align:center;"><h3>${stats['中风险']}</h3>中风险</div>
            <div class="card low" style="flex:1; text-align:center;"><h3>${stats['低风险']}</h3>低风险</div>
        </div>
        <div class="card">
            <h3>趋势统计</h3>
            <div id="mainChart" style="height:350px;"></div>
        </div>
        <h3>最近预警动态</h3>
        ${listHtml || '<p>暂无异常记录</p>'}
    `;

    setTimeout(() => {
        const chart = echarts.init(document.getElementById('mainChart'));
        chart.setOption({
            tooltip: {},
            xAxis: { type: 'category', data: ['高风险', '中风险', '低风险'] },
            yAxis: { type: 'value' },
            series: [{
                data: [
                    { value: stats['高风险'], itemStyle: {color: '#eb5757'} },
                    { value: stats['中风险'], itemStyle: {color: '#f2994a'} },
                    { value: stats['低风险'], itemStyle: {color: '#27ae60'} }
                ],
                type: 'bar', barWidth: '40%'
            }]
        });
    }, 100);
}

showPage('student');
