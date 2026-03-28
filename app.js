let mood = '';
const themes = {
    '难受': { bg: '#eef2f7', theme: '#2f80ed' },
    '一般': { bg: '#f8f9fa', theme: '#6c757d' },
    '压力': { bg: '#fff4f2', theme: '#eb5757' },
    '不错': { bg: '#f2faf5', theme: '#27ae60' }
};

function page(type) {
    const box = document.getElementById('content');
    if (type === 'student') {
        box.innerHTML = `
            <div class="card"><h3>📮 心灵邮筒</h3><textarea id="textin" placeholder="写下感受..."></textarea></div>
            <div class="card"><h3>🌈 情绪状态</h3><div id="moods">${Object.keys(themes).map(m => `<button class="m-btn" onclick="set(event,'${m}')">${m}</button>`).join('')}</div></div>
            <div style="margin-bottom:30px;"><button onclick="send()">发送心事</button><button onclick="del()" style="background:#dee2e6; color:#495057; margin-left:10px;">清空记录</button></div>
            <div id="chat"></div>`;
        setTimeout(load, 100);
    } else { render(); }
}

function set(e, m) {
    mood = m;
    const cfg = themes[m] || themes['一般'];
    document.body.style.background = cfg.bg;
    document.querySelectorAll('.m-btn').forEach(b => { b.style.background = '#f1f3f5'; b.style.color = '#495057'; });
    e.target.style.background = cfg.theme; e.target.style.color = 'white';
}

function send() {
    const input = document.getElementById('textin'), txt = input.value, box = document.getElementById('chat');
    if (!txt && !mood) return alert("请先投递心情...");
    const usertxt = txt || `我现在感觉${mood}`;
    add(box, "user", "👤 " + usertxt);
    const lv = check(txt, mood), res = reply(lv);
    save(txt, lv);
    input.value = '';
    const loading = add(box, "ai", "🤖 正在感应...");
    setTimeout(() => {
        loading.remove();
        const aimsg = add(box, "ai", "");
        print(aimsg, "🤖 " + res);
        if (lv !== '低风险' || mood === '压力') { setTimeout(() => breath(box), 1500); } 
        else { setTimeout(() => { add(box, "tip", "💡 建议：" + tip(lv)); log(); }, 1000); }
    }, 800);
}

function breath(box) {
    const wrap = document.createElement('div');
    wrap.className = 'breath card';
    wrap.innerHTML = `<div class="ball"></div><h4 id="btxt" style="color:#2f80ed">跟随圆圈，缓慢深呼吸...</h4><p style="font-size:0.9rem; color:#888;">专注这一刻的呼吸</p><button onclick="this.parentElement.remove()" style="background:#eee; color:#666; margin-top:10px;">我感觉好些了</button>`;
    box.appendChild(wrap);
    let state = true;
    const t = setInterval(() => {
        const el = document.getElementById('btxt');
        if(!el) return clearInterval(t);
        state = !state;
        el.innerText = state ? "吸气... 感受能量" : "呼气... 释放压力";
    }, 4000);
    move();
}

function check(t, m) {
    const h = ['死', '绝望', '自残', '撑不下'], mid = ['累', '焦虑', '失眠', '烦躁', '压力', '难过', '哭'];
    if (h.some(w => t.includes(w))) return '高风险';
    let s = mid.filter(w => t.includes(w)).length;
    if (m === '压力' || m === '难受') s += 2;
    return s >= 3 ? '高风险' : (s >= 1 ? '中风险' : '低风险');
}

function reply(lv) {
    const db = {
        '高风险': ["听到你这么说，我很心疼。请拥抱一下自己。", "这一刻很艰难，但我会一直听你说。"],
        '中风险': ["感觉最近背负了很多，停下来歇一歇吧。", "生活不需要一直满分，你已经很棒了。"],
        '低风险': ["觉察情绪是健康的开始。", "很高兴看到你状态不错。"]
    };
    return db[lv][Math.floor(Math.random() * db[lv].length)];
}

function tip(lv) {
    if (lv === '高风险') return "建议寻找专业老师的支持。";
    if (lv === '中风险') return "试着散散步或听听白噪音。";
    return "保持作息，你的节奏很棒。";
}

function add(box, cls, txt) {
    const div = document.createElement("div"); div.className = "msg " + cls; div.innerText = txt;
    box.appendChild(div); move(); return div;
}

function print(el, txt) {
    let i = 0; (function run() { if (i < txt.length) { el.innerHTML += txt[i++]; setTimeout(run, 40); } })();
}

function move() {
    const area = document.querySelector('.box');
    if (area) area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
}

function log() { localStorage.setItem('data', document.getElementById('chat').innerHTML); }
function load() { const d = localStorage.getItem('data'); if (d) document.getElementById('chat').innerHTML = d; }
function del() { localStorage.removeItem('data'); document.getElementById('chat').innerHTML = ''; }

function save(t, lv) {
    let db = JSON.parse(localStorage.getItem('db') || '[]');
    db.push({ t, lv, time: new Date().toLocaleString() });
    localStorage.setItem('db', JSON.stringify(db));
}

function render() {
    const box = document.getElementById('content'), db = JSON.parse(localStorage.getItem('db') || '[]');
    let s = { '高风险':0, '中风险':0, '低风险':0 }; db.forEach(r => s[r.lv]++);
    const html = db.slice(-6).reverse().map(r => `<div class="card ${r.lv === '高风险' ? 'high alert' : (r.lv === '中风险' ? 'mid' : 'low')}"><strong>${r.lv}</strong><small>${r.time}</small><p>内容：${r.t || '未填文字'}</p></div>`).join('');
    box.innerHTML = `<h2>📊 教师端看板</h2><div style="display:flex; gap:15px; margin-bottom:25px;"><div class="card high" style="flex:1"><h3>${s['高风险']}</h3>高风险</div><div class="card mid" style="flex:1"><h3>${s['中风险']}</h3>中风险</div><div class="card low" style="flex:1"><h3>${s['低风险']}</h3>低风险</div></div><div class="card"><h3>趋势图</h3><div id="chart" style="height:300px;"></div></div>${html}`;
    setTimeout(() => {
        const c = echarts.init(document.getElementById('chart'));
        c.setOption({ xAxis: { type: 'category', data: ['高风险', '中风险', '低风险'] }, yAxis: { type: 'value' }, series: [{ data: [{value:s['高风险'],itemStyle:{color:'#eb5757'}}, {value:s['中风险'],itemStyle:{color:'#f2994a'}}, {value:s['低风险'],itemStyle:{color:'#27ae60'}}], type: 'bar' }] });
    }, 100);
}
page('student');
