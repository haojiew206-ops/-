let mood = '';
const themes = {
    '难受': { bg: '#eef2f7', color: '#2f80ed' },
    '一般': { bg: '#f8f9fa', color: '#6c757d' },
    '压力': { bg: '#fff4f2', color: '#eb5757' },
    '不错': { bg: '#f2faf5', color: '#27ae60' }
};

function showpage(type) {
    const box = document.getElementById('content');
    if (type === 'student') {
        box.innerHTML = `
            <div class="card"><h3>📮 心灵邮筒</h3><textarea id="textin" placeholder="写下你此时此刻真实的感受..."></textarea></div>
            <div class="card"><h3>🌈 情绪状态</h3><div id="moods">${Object.keys(themes).map(m => `<button class="mood-btn" onclick="setmood(event,'${m}')">${m}</button>`).join('')}</div></div>
            <div style="margin-bottom:30px;"><button onclick="send()">发送心事</button><button onclick="clearlog()" style="background:#dee2e6; color:#495057; margin-left:10px;">清空记录</button></div>
            <div id="chatbox"></div>`;
        setTimeout(loadchat, 100);
    } else { render() }
}

function setmood(e, m) {
    mood = m;
    const cfg = themes[m] || themes['一般'];
    document.body.style.background = cfg.bg;
    document.querySelectorAll('.mood-btn').forEach(b => { b.style.background = '#f1f3f5'; b.style.color = '#495057'; });
    e.target.style.background = cfg.color; e.target.style.color = 'white';
}

function send() {
    const el = document.getElementById('textin'), txt = el.value, box = document.getElementById('chatbox');
    if (!txt && !mood) return alert("请先投递你的心情片段...");
    const usertext = txt || `我现在感觉${mood}`;
    addmsg(box, "chat-user", "👤 " + usertext);
    const lv = check(txt, mood), res = getres(lv);
    save(txt, lv);
    el.value = '';
    const loading = addmsg(box, "chat-ai", "🤖 正在感应你的情绪...");
    setTimeout(() => {
        loading.remove();
        const aimsg = addmsg(box, "chat-ai", "");
        print(aimsg, "🤖 " + res);
        if (lv !== '低风险' || mood === '压力') { setTimeout(() => breath(box), 1500); } 
        else { setTimeout(() => { addmsg(box, "chat-tip", "💡 建议：" + gettip(lv)); savechat(); }, 1000); }
    }, 800);
}

function breath(box) {
    const div = document.createElement('div');
    div.className = 'breath-box card';
    div.innerHTML = `<div class="breath-circle"></div><h4 id="btxt" style="color:#2f80ed">跟随圆圈，缓慢深呼吸...</h4><button onclick="this.parentElement.remove()" style="background:#eee; color:#666; margin-top:10px;">我感觉好些了</button>`;
    box.appendChild(div);
    let state = true;
    const t = setInterval(() => {
        const el = document.getElementById('btxt');
        if(!el) return clearInterval(t);
        state = !state;
        el.innerText = state ? "吸气... 感受能量" : "呼气... 释放压力";
    }, 4000);
    scroll();
}

function check(t, m) {
    const h = ['死', '绝望', '自残', '撑不下'], mid = ['累', '焦虑', '失眠', '烦躁', '压力', '难过', '哭'];
    if (h.some(w => t.includes(w))) return '高风险';
    let s = mid.filter(w => t.includes(w)).length;
    if (m === '压力' || m === '难受') s += 2;
    return s >= 3 ? '高风险' : (s >= 1 ? '中风险' : '低风险');
}

function getres(lv) {
    const data = {
        '高风险': ["听到你这么说，我很心疼。请一定要抱抱自己。", "这一刻确实艰难，但我会一直在这里。"],
        '中风险': ["感觉你最近背负了很多，停下来休息一下吧。", "压力总会散去，现在的你已经很棒了。"],
        '低风险': ["能表达情绪是健康的开始。", "很高兴看到你状态不错，继续保持这份觉察！"]
    };
    const list = data[lv];
    return list[Math.floor(Math.random() * list.length)];
}

function gettip(lv) {
    if (lv === '高风险') return "建议联系校内心理咨询中心。";
    if (lv === '中风险') return "尝试听听轻音乐或散散步。";
    return "保持良好作息，你的节奏很棒。";
}

function addmsg(box, cls, txt) {
    const div = document.createElement("div"); div.className = "chat-item " + cls; div.innerText = txt;
    box.appendChild(div); scroll(); return div;
}

function print(el, txt) {
    let i = 0; (function run() { if (i < txt.length) { el.innerHTML += txt[i++]; setTimeout(run, 40); } })();
}

function scroll() {
    const area = document.querySelector('.content-area');
    if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
}

function savechat() {
    const el = document.getElementById('chatbox');
    if (el) localStorage.setItem('history', el.innerHTML);
}
function loadchat() {
    const data = localStorage.getItem('history'), el = document.getElementById('chatbox');
    if (data && el) el.innerHTML = data;
}
function clearlog() {
    localStorage.removeItem('history');
    const el = document.getElementById('chatbox');
    if (el) el.innerHTML = '';
}
function save(t, lv) {
    let logs = JSON.parse(localStorage.getItem('logs') || '[]');
    logs.push({ t, lv, time: new Date().toLocaleString() });
    localStorage.setItem('logs', JSON.stringify(logs));
}

function render() {
    const box = document.getElementById('content'), logs = JSON.parse(localStorage.getItem('logs') || '[]');
    let n = { '高风险':0, '中风险':0, '低风险':0 }; logs.forEach(r => n[r.lv]++);
    const html = logs.slice(-6).reverse().map(r => `<div class="card ${r.lv === '高风险' ? 'high alert' : (r.lv === '中风险' ? 'mid' : 'low')}"><div style="display:flex; justify:space-between;"><strong>状态：${r.lv}</strong><small>${r.time}</small></div><p style="margin-top:10px; color:#666;">内容：${r.t || '未填写'}</p></div>`).join('');
    box.innerHTML = `<h2>📊 教师看板</h2><div style="display:flex; gap:15px; margin-bottom:25px;"><div class="card high" style="flex:1; text-align:center;"><h3>${n['高风险']}</h3>高风险</div><div class="card mid" style="flex:1; text-align:center;"><h3>${n['中风险']}</h3>中风险</div><div class="card low" style="flex:1; text-align:center;"><h3>${n['低风险']}</h3>低风险</div></div><div class="card"><h3>趋势图表</h3><div id="chart" style="height:350px;"></div></div>${html}`;
    setTimeout(() => {
        const el = document.getElementById('chart');
        if (el) {
            const c = echarts.init(el);
            c.setOption({ xAxis: { type: 'category', data: ['高风险', '中风险', '低风险'] }, yAxis: { type: 'value' }, series: [{ data: [{ value: n['高风险'], itemStyle: {color: '#eb5757'} }, { value: n['中风险'], itemStyle: {color: '#f2994a'} }, { value: n['低风险'], itemStyle: {color: '#27ae60'} }], type: 'bar' }] });
        }
    }, 100);
}
showpage('student');
