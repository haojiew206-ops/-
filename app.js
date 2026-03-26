function showPage(type) {
  const contentBox = document.getElementById('content')

  if (type === 'student') {

    const moodNow = 70       
    const sleepTime = 6      

    let riskLevel = ''
    let riskReason = ''

    if (moodNow < 60 && sleepTime < 6) {
      riskLevel = '高风险'
      riskReason = '情绪较低且睡眠不足，存在较高心理压力'
    } else if (moodNow < 75) {
      riskLevel = '中风险'
      riskReason = '情绪波动较大，建议适当放松和调整状态'
    } else {
      riskLevel = '低风险'
      riskReason = '整体状态良好，请继续保持'
    }

    contentBox.innerHTML = `
      <h2>学生端 · 心理状态概览</h2>

      <div class="card">情绪指数：${moodNow}</div>
      <div class="card">睡眠时长：${sleepTime}小时</div>

      <div class="card ${getRiskClass(riskLevel)}">
        风险等级：${riskLevel}
      </div>

      <div class="card">
        <strong>风险说明：</strong><br>
        ${riskReason}
      </div>

      <div class="card">
        <strong>建议：</strong><br>
        ${getSuggestion(riskLevel)}
      </div>

      <div id="chart" style="width:100%;height:300px;"></div>
    `

    setTimeout(() => {
      const chartDom = document.getElementById('chart')
      if (!chartDom) return

      const chart = echarts.init(chartDom)

      chart.setOption({
        title: { text: '近7天情绪变化趋势' },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: ['周一','周二','周三','周四','周五','周六','周日']
        },
        yAxis: { type: 'value' },
        series: [{
          name: '情绪值',
          data: [60,70,65,80,75,85,78],
          type: 'line',
          smooth: true
        }]
      })
    }, 0)
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
