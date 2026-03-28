let selectedMood = '';
const themes = {
    '难受': { bg: '#ebf3ff', color: '#2f80ed' },
    '一般': { bg: '#f5f7fa', color: '#607d8b' },
    '压力': { bg: '#fff5f5', color: '#e74c3c' },
    '不错': { bg: '#f0fff4', color: '#2ecc71' }
};

function showPage(type) {
    const contentBox = document.getElementById('content');
    if (type === 'student') {
        contentBox.innerHTML = `
            <h2>心事投递箱</h2>
            <div class="card"><strong>今天想说点什么？</strong><br><br>
                <textarea id="userInput" placeholder="写下一句话，或者只选择心情..."></textarea>
            </div>
            <div class="card"><strong>目前状态：</strong><br><br>
                <button class="mood-btn" onclick="selectMood(event,'难受')">😔 有点难受</button>
                <button class="mood-btn" onclick="selectMood(event,'一般')">😐 情绪平稳</button>
                <button class="mood-btn" onclick="selectMood(event,'压力')">😫 压力较大</button>
                <button class="mood-btn" onclick="selectMood(event,'不错')">🙂 状态不错</button>
            </div>
            <div class="card">
                <button onclick="submitEmotion()">📮 投进邮筒</button>
                <button onclick="clearChat()" style="background:#aaa">🧹 清空聊天</button>
            </div>
            <div id="resultBox"></div>
        `;
        setTimeout(loadChat, 100);
    } else { renderTeacher(); }
}

function selectMood(e, mood) {
    selectedMood = mood;
    const cfg = themes[mood] || themes['一般'];
    document.body.style.background = cfg.bg;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.style.background = '#f0f3f8'; btn.style.color = '#333';
    });
    e.target.style.background = cfg.color; e.target.style.color = 'white';
}

function submitEmotion() {
    const input = document.getElementById('userInput');
    const text = input.value;
    const chatBox = document.getElementById('resultBox');
    if (!text && !selectedMood) return alert("写点什么或选个心情吧~");

    const userMsg = text || `我现在心情${selectedMood}`;
    appendMsg(chatBox, "chat-user", "👤 " + userMsg);
    
    const risk = generateRisk(text, selectedMood);
    const response = generateResponse(text, selectedMood);
    saveRecord(text, risk);
    input.value = '';

    const loading = appendMsg(chatBox, "chat-ai", "🤖 正在回信...");
    setTimeout(() => {
        loading.remove();
        const aiMsg = appendMsg(chatBox, "chat-ai", "");
        typeWriter(aiMsg, "🤖 " + response);
        
        // 触发呼吸练习
        if (risk !== '低风险' || selectedMood === '压力') {
            setTimeout(() => triggerBreath(chatBox), 1500);
        } else {
            setTimeout(() => {
                const tip = appendMsg(chatBox, "chat-tip", "💡 " + getSuggestion(risk));
                saveChat();
            }, 1000);
        }
    }, 800);
}

function triggerBreath(box) {
    const div = document.createElement('div');
    div.className = 'breath-wrap';
    div.innerHTML = `<div class="breath-circle"></div><div id="bTxt">跟随圆圈，深吸气...</div>`;
    box.appendChild(div);
    let inBreath = true;
    const t = setInterval(() => {
        if(!document.contains(div)) return clearInterval(t);
        inBreath = !inBreath;
        document.getElementById('bTxt').innerText = inBreath ? "跟随圆圈，深吸气..." : "呼气，吐出压力...";
    }, 4000);
    setTimeout(saveChat, 1000);
    box.parentElement.scrollTo(0, box.parentElement.scrollHeight);
}

function generateRisk(text, mood) {
    const weights = {'死':10, '崩溃':5, '压力':3, '累':2, '难过':3, '哭':3};
    let s = 0;
    Object.keys(weights).forEach(w => { if(text.includes(w)) s += weights[w]; });
    if(mood==='压力' || mood==='难受') s += 3;
    return s > 6 ? '高风险' : (s > 2 ? '中风险' : '低风险');
}

function generateResponse(text, mood) {
    const r = generateRisk(text, mood);
    const replies = {
        '高风险': ["我很担心你，请一定要对自己温柔一点。", "听起来你正在经历一段艰难的时间，我一直在这里。"],
        '中风险': ["压力像乌云，总会散去的。试着给自己放个小假？", "你已经很努力了，偶尔停下来没关系的。"],
        '低风险': ["保持现在的节奏就很好，你是个懂得照顾情绪的人。", "生活虽然忙碌，但你处理得很棒。"]
    };
    const list = replies[r];
    return list[Math.floor(Math.random()*list.length)];
}

function getSuggestion(level) {
    if (level === '高风险') return "现在的状态建议找专业老师聊聊，或者拨打校内心理热线。";
    if (level === '中风险') return "可以听听轻音乐，或者去操场散散步放松一下。";
    return "状态不错，继续保持这份好心情。";
}

function appendMsg(box, cls, text) {
    const div = document.createElement("div");
    div.className = "chat-item " + cls;
    div.innerText = text;
    box.appendChild(div);
    box.parentElement.scrollTo(0, box.parentElement.scrollHeight);
    return div;
}

function typeWriter(el, text) {
    let i = 0;
    (function run() { if (i < text.length) { el.innerHTML += text[i++]; setTimeout(run, 40); } })();
}

function saveChat() { 
    const box = document.getElementById('resultBox');
    if(box) localStorage.setItem('chatHistory', box.innerHTML); 
}
function loadChat() { 
    const data = localStorage.getItem('chatHistory');
    if (data) document.getElementById('resultBox').innerHTML = data; 
}
function clearChat() { localStorage.removeItem('chatHistory'); document.getElementById('resultBox').innerHTML = ''; }
function saveRecord(text, risk) {
    let records = JSON.parse(localStorage.getItem('records') || '[]');
    records.push({ text, risk, time: new Date().toLocaleString() });
    localStorage.setItem('records', JSON.stringify(records));
}

function renderTeacher() {
    const contentBox = document.getElementById('content');
    const records = JSON.parse(localStorage.getItem('records') || '[]');
    let high = 0, mid = 0, low = 0;
    records.forEach(r => { if(r.risk==='高风险') high++; else if(r.risk==='中风险') mid++; else low++; });

    const list = records.slice(-5).reverse().map(r => `
        <div class="card ${r.risk==='高风险'?'high alert':'mid'}">
            ⏰ ${r.time} | 风险：${r.risk}<br>内容：${r.text || '（无文字）'}
        </div>`).join('');

    contentBox.innerHTML = `
        <h2>教师端 · 风险监测</h2>
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <div class="card high" style="flex:1">高风险：${high}</div>
            <div class="card mid" style="flex:1">中风险：${mid}</div>
            <div class="card low" style="flex:1">低风险：${low}</div>
        </div>
        <div class="card"><h3>风险分布统计</h3><div id="riskChart" style="height:300px;"></div></div>
        <h3>最近记录</h3>${list || '<p>暂无数据</p>'}
    `;
    setTimeout(() => {
        const chart = echarts.init(document.getElementById('riskChart'));
        chart.setOption({
            xAxis: { type: 'category', data: ['高风险', '中风险', '低风险'] },
            yAxis: { type: 'value' },
            series: [{ type: 'bar', data: [high, mid, low], itemStyle: { color: (params) => ['#e74c3c','#f39c12','#2ecc71'][params.dataIndex] } }]
        });
    }, 100);
}

showPage('student');
