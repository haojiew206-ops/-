function showPage(type) {
  const contentBox = document.getElementById('content')

  if (type === 'student') {
    contentBox.innerHTML = `
      <h2>心事投递箱</h2>

      <div class="card">
        <strong>今天有什么想说的？</strong><br><br>
        <textarea id="userInput" placeholder="可以写一句话，也可以不写..."></textarea>
      </div>

      <div class="card">
        <strong>现在更接近哪种状态？</strong><br><br>
        <button class="mood-btn" onclick="selectMood(event,'难受')">😔 有点难受</button>
        <button class="mood-btn" onclick="selectMood(event,'一般')">😐 情绪平稳</button>
        <button class="mood-btn" onclick="selectMood(event,'压力')">😫 压力较大</button>
        <button class="mood-btn" onclick="selectMood(event,'不错')">🙂 状态不错</button>
      </div>

      <div class="card">
        <button onclick="submitEmotion()">📮 投进邮筒</button>
        <button onclick="clearChat()">🧹 清空聊天</button>
      </div>

      <div id="resultBox"></div>
    `
    setTimeout(loadChat, 100)
  }

  if (type === 'teacher') {
    renderTeacher()
  }
}


let selectedMood = ''

function selectMood(e, mood) {
  selectedMood = mood

  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.style.background = '#f0f3f8'
    btn.style.color = '#333'
  })

  e.target.style.background = '#2f80ed'
  e.target.style.color = 'white'
}


function submitEmotion() {
  const text = document.getElementById('userInput').value
  const chatBox = document.getElementById('resultBox')

  if (!text && !selectedMood) {
    alert("可以写一句话或者选一个状态哦～")
    return
  }

  const userText = text || selectedMood

  appendMsg(chatBox, "chat-user", "👤 " + userText)

  const response = generateResponse(text, selectedMood)
  const risk = generateRisk(text, selectedMood)

  saveRecord(text, risk)
  document.getElementById('userInput').value = ''
  scrollToBottom()
  saveChat()

  const loading = appendMsg(chatBox, "chat-ai typing", "🤖 正在分析你的情绪...")

  setTimeout(() => {
    loading.remove()

    const aiMsg = appendMsg(chatBox, "chat-ai", "")
    typeWriter(aiMsg, "🤖 我理解你刚刚说的“" + userText + "”。" + response)

    scrollToBottom()
    setTimeout(saveChat, 1000)
  }, 600)

  setTimeout(() => {
    const tip = appendMsg(chatBox, "chat-tip", "")
    typeWriter(tip, "💡 " + getSuggestion(risk), 20)

    scrollToBottom()
    setTimeout(saveChat, 1500)
  }, 1600)
}


function appendMsg(box, cls, text) {
  const div = document.createElement("div")
  div.className = "chat-item " + cls
  div.innerText = text
  box.appendChild(div)
  return div
}


function generateRisk(text, mood) {
  if (text.includes('累') || text.includes('压力') || mood === '压力') return '中风险'
  if (text.includes('难过') || text.includes('想哭') || mood === '难受') return '高风险'
  return '低风险'
}


function generateResponse(text, mood) {

  const stress = [
    "你最近的压力可能有点大，其实很多人都会有这样的阶段。",
    "感觉你最近挺辛苦的，偶尔累一点真的没关系。",
    "长期紧绷确实会让人疲惫，可以试着给自己一点喘息空间。"
  ]

  const sad = [
    "难过的时候不用强撑，情绪本来就值得被表达。",
    "你现在的感受很真实，也很重要。",
    "慢一点也没关系，你已经在努力面对了。"
  ]

  const normal = [
    "生活本来就有起伏，你现在的状态其实很正常。",
    "保持现在的节奏就很好，不用太苛求自己。",
    "你已经做得不错了，继续保持就好。"
  ]

  const pick = arr => arr[Math.floor(Math.random() * arr.length)]

  if (text.includes('累') || text.includes('作业') || mood === '压力') return pick(stress)
  if (text.includes('难过') || text.includes('想哭') || mood === '难受') return pick(sad)

  return pick(normal)
}


function getSuggestion(level) {
  if (level === '高风险') return "你现在的状态可能需要更多关注，建议找老师或朋友聊一聊。"
  if (level === '中风险') return "可以尝试放松一下，比如听音乐或短暂休息。"
  return "状态不错，继续保持现在的节奏就很好。"
}


function typeWriter(el, text, speed = 30) {
  let i = 0
  el.innerHTML = ""
  function run() {
    if (i < text.length) {
      el.innerHTML += text[i++]
      setTimeout(run, speed)
    }
  }
  run()
}


function scrollToBottom() {
  const box = document.getElementById('resultBox')
  box.scrollTop = box.scrollHeight
}


function saveChat() {
  localStorage.setItem('chatHistory', document.getElementById('resultBox').innerHTML)
}

function loadChat() {
  const data = localStorage.getItem('chatHistory')
  if (data) document.getElementById('resultBox').innerHTML = data
}


function saveRecord(text, risk) {
  let records = JSON.parse(localStorage.getItem('records') || '[]')
  records.push({ text, risk, time: new Date().toLocaleString() })
  localStorage.setItem('records', JSON.stringify(records))
}


function renderTeacher() {
  const contentBox = document.getElementById('content')
  const records = JSON.parse(localStorage.getItem('records') || '[]')

  let high = 0, mid = 0, low = 0
  records.forEach(r => {
    if (r.risk === '高风险') high++
    else if (r.risk === '中风险') mid++
    else low++
  })

  const list = records.slice(-5).reverse().map(r => `
    <div class="card ${getRiskClass(r.risk)} ${r.risk === '高风险' ? 'alert' : ''}">
      ⏰ ${r.time}<br>
      内容：${r.text || '（未填写）'}<br>
      风险：${r.risk}
    </div>
  `).join('')

  contentBox.innerHTML = `
    <h2>教师端 · 风险监测</h2>

    <div class="card high">高风险：${high}</div>
    <div class="card mid">中风险：${mid}</div>
    <div class="card low">低风险：${low}</div>

    <div class="card">
      <h3>风险分布图</h3>
      <div id="riskChart" style="height:300px;"></div>
    </div>

    ${list || '<div class="card">暂无数据</div>'}
  `

  setTimeout(() => drawRiskChart(records), 0)
}


function drawRiskChart(records) {
  const dom = document.getElementById('riskChart')
  if (!dom) return

  const chart = echarts.init(dom)

  let high = 0, mid = 0, low = 0
  records.forEach(r => {
    if (r.risk === '高风险') high++
    else if (r.risk === '中风险') mid++
    else low++
  })

  chart.setOption({
    xAxis: { type: 'category', data: ['高风险','中风险','低风险'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [high, mid, low] }]
  })
}


function getRiskClass(level) {
  if (level === '高风险') return 'high'
  if (level === '中风险') return 'mid'
  return 'low'
}

function clearChat() {
  localStorage.removeItem('chatHistory')
  document.getElementById('resultBox').innerHTML = ''
}


showPage('student')
