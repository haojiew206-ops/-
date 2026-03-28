function showPage(type) {
  const contentBox = document.getElementById('content')

  if (type === 'student') {
    contentBox.innerHTML = `
      <h2>心事投递箱</h2>

      <div class="card">
        <strong>今天有什么想放下的？</strong><br><br>
        <textarea id="userInput" placeholder="可以写一句话，也可以不写..." style="width:100%;height:80px;"></textarea>
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
    contentBox.innerHTML = `
      <h2>教师端 · 风险监测</h2>

      <div class="card">高风险学生：5人</div>
      <div class="card">中风险学生：20人</div>

      <div class="card high" onclick="showStudentDetail('张三')">
        张三 - 高风险（点击查看）
      </div>

      <div class="card mid" onclick="showStudentDetail('李四')">
        李四 - 中风险（点击查看）
      </div>
    `
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

  const userMsg = document.createElement("div")
  userMsg.className = "chat-item chat-user"
  userMsg.innerText = "👤 " + (text || selectedMood)
  chatBox.appendChild(userMsg)

  scrollToBottom()
  saveChat()

  const response = generateResponse(text, selectedMood)
  const risk = generateRisk(text, selectedMood)

  document.getElementById('userInput').value = ''

  const loadingMsg = document.createElement("div")
  loadingMsg.className = "chat-item chat-ai typing"
  loadingMsg.innerText = "🤖 正在思考..."
  chatBox.appendChild(loadingMsg)

  scrollToBottom()

  setTimeout(() => {
    loadingMsg.remove()

    const aiMsg = document.createElement("div")
    aiMsg.className = "chat-item chat-ai"
    chatBox.appendChild(aiMsg)

    typeWriter(aiMsg, "🤖 " + response)
    scrollToBottom()

    setTimeout(saveChat, 1000)
  }, 600)

  setTimeout(() => {
    const tipMsg = document.createElement("div")
    tipMsg.className = "chat-item chat-tip"
    chatBox.appendChild(tipMsg)

    typeWriter(tipMsg, "💡 " + getSuggestion(risk), 20)
    scrollToBottom()

    setTimeout(saveChat, 1500)
  }, 1600)
}


function generateRisk(text, mood) {
  if (text.includes('累') || text.includes('压力') || mood === '压力') {
    return '中风险'
  }

  if (text.includes('难过') || text.includes('想哭') || mood === '难受') {
    return '高风险'
  }

  return '低风险'
}


function generateResponse(text, mood) {
  if (text.includes('累') || text.includes('作业') || mood === '压力') {
    return "你最近可能有点压力大，长时间紧绷真的很辛苦。可以试着给自己一点喘息的空间，不用一直逼自己。"
  }

  if (text.includes('难过') || text.includes('想哭') || mood === '难受') {
    return "难过的时候不用强撑，情绪本来就应该被表达出来。慢一点也没关系，你已经很努力了。"
  }

  return "生活本来就有起伏，你现在的状态其实很正常。可以试着放松一下，让自己轻松一点。"
}


function typeWriter(element, text, speed = 30) {
  let i = 0
  element.innerHTML = ""

  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
      setTimeout(typing, speed)
    }
  }

  typing()
}


function scrollToBottom() {
  const box = document.getElementById('resultBox')
  box.scrollTop = box.scrollHeight
}


function saveChat() {
  const chatBox = document.getElementById('resultBox')
  localStorage.setItem('chatHistory', chatBox.innerHTML)
}

function loadChat() {
  const chatBox = document.getElementById('resultBox')
  const history = localStorage.getItem('chatHistory')

  if (history) {
    chatBox.innerHTML = history
    scrollToBottom()
  }
}

function clearChat() {
  localStorage.removeItem('chatHistory')
  document.getElementById('resultBox').innerHTML = ''
}


function showStudentDetail(name) {
  const contentBox = document.getElementById('content')

  const moodList = [60,70,65,80,75,85,78]

  contentBox.innerHTML = `
    <h2>${name} · 详细分析</h2>

    <div class="card">当前情绪：75</div>
    <div class="card">风险等级：中风险</div>

    <div class="card">
      <strong>分析：</strong><br>
      最近情绪存在波动趋势，建议关注心理状态变化
    </div>

    <div id="detailChart" style="width:100%;height:300px;"></div>

    <button onclick="showPage('teacher')">返回教师端</button>
  `

  setTimeout(() => {
    const chart = echarts.init(document.getElementById('detailChart'))

    chart.setOption({
      title: { text: '情绪趋势分析' },
      xAxis: {
        type: 'category',
        data: ['周一','周二','周三','周四','周五','周六','周日']
      },
      yAxis: { type: 'value' },
      series: [{
        data: moodList,
        type: 'line',
        smooth: true
      }]
    })
  }, 0)
}


function getRiskClass(level) {
  if (level === '高风险') return 'high'
  if (level === '中风险') return 'mid'
  return 'low'
}

function getSuggestion(level) {
  if (level === '高风险') return '建议尽快寻求心理老师帮助'
  if (level === '中风险') return '建议适当放松，调整作息'
  return '状态良好，继续保持'
}


showPage('student')
