function showPage(type) {
  const content = document.getElementById('content')

  if (type === 'student') {
    const mood = 70
    const sleep = 6

    let risk = ''
    let reason = ''

    if (mood < 60 && sleep < 6) {
      risk = '高风险'
      reason = '情绪较低且睡眠不足，存在较高心理压力'
    } else if (mood < 75) {
      risk = '中风险'
      reason = '情绪波动较大，建议适当放松和调整状态'
    } else {
      risk = '低风险'
      reason = '整体状态良好，请继续保持'
    }

    content.innerHTML = `
      <h2>学生端</h2>

      <div class="card">情绪：${mood}</div>
      <div class="card">睡眠：${sleep}小时</div>
      <div class="card">${risk}</div>

      <div class="card">
        <strong>风险说明：</strong><br>
        ${reason}
      </div>

      <div id="chart" style="width:100%; height:300px;"></div>
    `

    setTimeout(() => {
      const chartDom = document.getElementById('chart')
      if (!chartDom) return

      const chart = echarts.init(chartDom)

      chart.setOption({
        title: { text: '近7天情绪变化' },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [60, 70, 65, 80, 75, 85, 78],
            type: 'line',
            smooth: true
          }
        ]
      })
    }, 0)
  }

  if (type === 'teacher') {
    content.innerHTML = `
      <h2>教师端</h2>

      <div class="card">高风险学生：5人</div>
      <div class="card">中风险学生：20人</div>
      <div class="card high">张三 - 高风险</div>
      <div class="card mid">李四 - 中风险</div>
    `
  }
}

showPage('student')
