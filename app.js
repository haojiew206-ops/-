function showPage(type) {
  const content = document.getElementById('content')

  if (type === 'student') {
    content.innerHTML = `
      <h2>学生端</h2>

      <div class="card">情绪：70</div>
      <div class="card">压力：中</div>
      <div class="card">睡眠：6小时</div>
      <div class="card mid">风险：中风险</div>

      <div id="chart" style="width:100%;height:300px;"></div>
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
          data: ['周一','周二','周三','周四','周五','周六','周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '情绪值',
          data: [60, 70, 65, 80, 75, 85, 78],
          type: 'line',
          smooth: true
        }]
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
