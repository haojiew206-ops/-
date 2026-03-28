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
            <div class="card"><h3>📮 心灵邮筒</h3><textarea id="in" placeholder="写下你此时此刻真实的感受..."></textarea></div>
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
    const el = document.getElementById('in'), txt = el.value, box = document.getElementById('chat');
    if (!txt && !mood) return alert("请先投递你的心情片段...");
    const usertext = txt || `我现在感觉${mood}`;
    addmsg(box, "user", "👤 " + usertext);
    const lv = check(txt, mood), res = reply(lv);
    save(txt, lv);
    el.value = '';
    const loading = addmsg(box, "ai", "🤖 正在感应你的情绪...");
    setTimeout(() => {
        loading.remove();
        const aimsg = addmsg(box, "ai", "");
        print(aimsg, "🤖 " + res);
        if (lv !== '低风险' || mood === '压力') { setTimeout(() => breath(box), 1500); } 
        else { setTimeout(() => { addmsg(box, "tip", "💡 建议：" + tip(lv)); log(); }, 1000); }
    }, 800);
}

function breath(box) {
    const div = document.createElement('div');
    div.className = 'breath card';
    div.innerHTML = `<div class="ball"></div><h4 id="btxt" style="color:#2f80ed">跟随圆圈，缓慢深呼吸...</h4><button onclick="this.parentElement.remove()" style="background:#eee; color:#666; margin-top:10px;">我感觉好些了</button>`;
    box.appendChild(div);
    let s = true;
    const t = setInterval(() => {
        const el = document.getElementById('btxt');
        if(!el) return clearInterval(t);
        s = !s; el.innerText = s ? "吸气... 感受能量" : "呼气... 释放压力";
    }, 4000);
    scroll();
}

function check(t, m) {
    const h = ['死', '绝望', '离开世界', '自残', '撑不下'], mid = ['累', '焦虑', '失眠', '烦躁', '压力', '难过', '哭'];
    if (h.some(w => t.includes(w))) return '高风险';
    let s = mid.filter(w => t.includes(w)).length;
    if (m === '压力' || m === '难受') s += 2;
    return s >= 3 ? '高风险' : (s >= 1 ? '中风险' : '低风险');
}

function reply(lv) {
    const db = {
        '高风险': ["听到你这么说，我很心疼。请一定要抱抱自己，你的存在本身就很有意义。", "这一刻确实很艰难，但请相信，我一直在这里听你说。"],
        '中风险': ["感觉你最近背负了很多，偶尔给自己按个暂停键吧。", "生活不需要一直保持100分，现在的你已经很棒了。"],
        '低风险': ["能觉察并表达自己的情绪，是心灵健康的开始。", "很高兴看到你状态不错，继续保持这份觉察吧。"]
    };
    return db[lv][Math.floor(Math.random() * db[lv].length)];
}

function tip(lv) {
    if (lv === '高风险') return "你需要更专业的支持，建议拨打校内心理中心电话或寻找信任的老师。";
    if (lv === '中风险') return "可以试着听听白噪音，或者去户外走走，给心灵充个电。";
    return "保持良好的作息，你现在的节奏非常棒！";
}

function addmsg(box, cls, txt) {
    const div = document.createElement("div"); div.className = "msg " + cls; div.innerText = txt;
    box.appendChild(div); scroll(); return div;
}

function print(el, txt) {
    let i = 0; (function run() { if (i < txt.length) { el.innerHTML += txt[i++]; setTimeout(run, 40); } })();
}

function scroll() {
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
    let n = { '高风险':0, '中风险':0, '低风险':0 }; db.forEach(r => n[r.lv]++);
    const list = db.slice(-6).reverse().map(r => `
        <div class="card ${r.lv === '高风险' ? 'high alert' : (r.lv === '中风险' ? 'mid' : 'low')}">
            <strong>状态：${r.lv}</strong> <small>${r.time}</small>
            <p>内容：${r.t || '未填写文字'}</p>
        </div>`).join('');
    box.innerHTML = `
        <h2>📊 教师端看板</h2>
        <div style="display:flex; gap:15px; margin-bottom:25px;">
            <div class="card high" style="flex:1; text-align:center;"><h3>${n['高风险']}</h3>高风险</div>
            <div class="card mid" style="flex:1; text-align:center;"><h3>${n['中风险']}</h3>中风险</div>
            <div class="card low" style="flex:1; text-align:center;"><h3>${n['低风险']}</h3>低风险</div>
        </div>
        <div class="card">
            <h3>趋势统计</h3>
            <div id="chart" style="width:100%; height:300px; min-height:300px;"></div>
        </div>
        <h3>最近记录</h3>
        ${list || '<p>暂无记录</p>'}`;
    
    // 修复：图表渲染确保容器存在
    setTimeout(() => {
        const el = document.getElementById('chart');
        if (el && typeof echarts !== 'undefined') {
            const c = echarts.init(el);
            c.setOption({
                xAxis: { type: 'category', data: ['高风险', '中风险', '低风险'] },
                yAxis: { type: 'value' },
                series: [{
                    data: [
                        { value: n['高风险'], itemStyle: { color: '#eb5757' } },
                        { value: n['中风险'], itemStyle: { color: '#f2994a' } },
                        { value: n['低风险'], itemStyle: { color: '#27ae60' } }
                    ],
                    type: 'bar', barWidth: '40%'
                }]
            });
        }
    }, 300);
}
page('student');
