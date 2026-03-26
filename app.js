function showPage(type) {
  const content = document.getElementById('content')

  if (type === 'student') {
    content.innerHTML = `
      <h2>学生端</h2>
      <div class="card">情绪：70</div>
      <div class="card">压力：中</div>
      <div class="card">睡眠：6小时</div>
      <div class="card mid">风险：中风险</div>
    `
  }

  if (type === 'teacher') {
    content.innerHTML = `
      <h2>教师端</h2>
      <div class="card">高风险学生：5人</div>
      <div class="card">中风险学生：20人</div>
    `
  }
}

showPage('student')
