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
        <button onclick="selectMood('难受')">😔 有点难受</button>
        <button onclick="selectMood('一般')">😐 还行</button>
        <button onclick="selectMood('压力')">😫 压力大</button>
        <button onclick="selectMood('不错')">🙂 还不错</button>
      </div>

      <div class="card">
        <button onclick="submitEmotion()">📮 投进邮筒</button>
      </div>

      <div id="resultBox"></div>
    `
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

function selectMood(mood) {
  selectedMood = mood
  alert("已选择：" + mood)
}

function submitEmotion() {
  const text = document.getElementById('userInput').value

  const response = generateResponse(text, selectedMood)
  const risk = generateRisk(text, selectedMood)

  document.getElementById('resultBox').innerHTML = `
    <div class="card ${getRiskClass(risk)}">
      风险判断：${risk}
    </div>

    <div class="card">
      <strong>💬 给你的回应：</strong><br><br>
      ${response}
    </div>

    <div class="card">
      <strong>💡 小建议：</strong><br><br>
      ${getSuggestion(risk)}
    </div>
  `
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
