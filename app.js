let mood = '';
const theme = {
    '难受': '#eef2f7', '一般': '#f5f7fa', '压力': '#fff4f2', '不错': '#f2faf5'
};

function page(type) {
    const box = document.getElementById('content');
    if (type === 'student') {
        box.innerHTML = `
            <div class="card"><h3>写下心情</h3><textarea id="in" style="width:100%;height:80px;"></textarea></div>
            <div class="card"><h3>选择状态</h3><div id="m-list">
                <button class="btn-m" onclick="set(event,'难受')">😔 难受</button>
                <button class="btn-m" onclick="set(event,'一般')">😐 一般</button>
                <button class="btn-m" onclick="set(event,'压力')">😫 压力</button>
                <button class="btn-m" onclick="set(event,'不错')">🙂 不错</button>
            </div></div>
            <div class="card"><button onclick="send()">发送</button><button onclick="del()" style="background:#999">清空</button></div>
            <div id="chats"></div>`;
        load();
    } else { render(); }
}

function set(e, m) {
    mood = m;
    document.body.style.background = theme[m] || '#f5f7fa';
    document.querySelectorAll('.btn-m').forEach(b => { b.style.background = '#f0f3f8'; b.style.color = '#333'; });
    e.target.style.background = '#2f80ed'; e.target.style.color = '#fff';
}

function send() {
    const el = document.getElementById('in'), txt = el.value, box = document.getElementById('chats');
    if (!txt && !mood) return alert("写点什么吧");
    
    add(box, "user", "👤 " + (txt || mood));
    const lv = check(txt, mood);
    const res = reply(lv);
    const tip = hint(lv);
    
    save(txt, lv);
    el.value = '';

    const div = add(box, "ai", "🤖 分析中...");
    setTimeout(() => {
        div.remove();
        const aimsg = add(box, "ai", "");
        type(aimsg, "🤖 " + res);
        if (lv !== '低风险') {
            setTimeout(() => breath(box), 1000);
        } else {
            setTimeout(() => { add(box, "tip", "💡 " + tip); scroll(); store(); }, 1000);
        }
    }, 800);
}

function check(t, m) {
    if (t.includes('死') || t.includes('绝望')) return '高风险';
    if (t.includes('累') || m === '压力') return '中风险';
    if (t.includes('难过') || m === '难受') return '高风险';
    return '低风险';
}

function reply(lv) {
    const words = {
        '高风险': ["抱抱你，我会一直陪着你。", "此刻很难，但你并不孤单。"],
        '中风险': ["感觉累了就歇会吧。", "压力总会过去，给自己一点时间。"],
        '低风险': ["觉察情绪是好事。", "保持这个状态，很棒！"]
    };
    const list = words[lv];
    return list[Math.floor(Math.random() * list.length)];
}

function hint(lv) {
    if (lv === '高风险') return "建议找老师聊聊。";
    if (lv === '中风险') return "试试深呼吸。";
    return "继续保持。";
}

function breath(box) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<div class="circle"></div><p id="bt" style="text-align:center;">吸气...</p>`;
    box.appendChild(div);
    let s = true;
    const t = setInterval(() => {
        const el = document.getElementById('bt');
        if(!el) return clearInterval(t);
        s = !s; el.innerText = s ? "吸气..." : "呼气...";
    }, 4000);
    scroll(); store();
}

function add(box, cls, txt) {
    const div = document.createElement("div");
    div.className = "msg " + cls; div.innerText = txt;
    box.appendChild(div); scroll(); return div;
}

function type(el, txt) {
    let i = 0; (function run() { if (i < txt.length) { el.innerHTML += txt[i++]; setTimeout(run, 40); } })();
}

function scroll() {
    const area = document.getElementById('content');
    if (area) area.scrollTop = area.scrollHeight;
}

function store() { localStorage.setItem('log', document.getElementById('chats').innerHTML); }
function load() { 
    const data = localStorage.getItem('log'), box = document.getElementById('chats');
    if (data && box) box.innerHTML = data; 
}
function del() { localStorage.removeItem('log'); document.getElementById('chats').innerHTML = ''; }

function save(t, lv) {
    let list = JSON.parse(localStorage.getItem('db') || '[]');
    list.push({ t, lv, time: new Date().toLocaleString() });
    localStorage.setItem('db', JSON.stringify(list));
}

function render() {
    const box = document.getElementById('content'), list = JSON.parse(localStorage.getItem('db') || '[]');
    let n = { '高风险':0, '中风险':0, '低风险':0 }; list.forEach(r => n[r.lv]++);
    const html = list.slice(-5).reverse().map(r => `<div class="card ${r.lv==='高风险'?'high':(r.lv==='中风险'?'mid':'low')}">⏰ ${r.time}<br>内容：${r.t || '心情投递'}</div>`).join('');
    box.innerHTML = `<h2>教师端</h2><div id="chart" style="height:200px;"></div>${html}`;
    setTimeout(() => {
        const c = echarts.init(document.getElementById('chart'));
        c.setOption({ xAxis: {type:'category', data:['高','中','低']}, yAxis: {type:'value'}, series: [{data:[n['高风险'],n['中风险'],n['低风险']], type:'bar'}] });
    }, 100);
}
page('student');
