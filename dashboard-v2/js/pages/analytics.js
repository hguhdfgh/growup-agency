let analyticsCharts = {}

async function loadAnalytics() {
  AppState.currentPage = 'analytics'
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1).toISOString()

  const [visitorsRes, pageviewsRes, salesRes, statusCounts, growthRes] = await Promise.all([
    getEventStats('page_view', startOfMonth),
    getEventStats(null, startOfMonth),
    getSalesTrend(startOfYear, endOfYear),
    getOrderStatusDistribution(),
    getCustomerGrowth(startOfYear, endOfYear)
  ])

  if ($('analytics-visitors')) $('analytics-visitors').textContent = visitorsRes.count || 0
  if ($('analytics-pageviews')) $('analytics-pageviews').textContent = pageviewsRes.count || 0

  const totalVisitors = visitorsRes.count || 0
  const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0)
  const conversion = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(2) + '%' : '0%'
  if ($('analytics-conversion')) $('analytics-conversion').textContent = conversion
  if ($('analytics-bounce')) $('analytics-bounce').textContent = '--'

  if (typeof Chart !== 'undefined') {
    Object.values(analyticsCharts).forEach(c => { try { c.destroy() } catch {} })
    analyticsCharts = {}

    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    const monthlyData = Array(12).fill(0)
    if (salesRes.data) {
      for (const s of salesRes.data) { monthlyData[new Date(s.created_at).getMonth()] += (s.amount || 0) }
    }

    const salesCanvas = document.getElementById('analytics-sales-chart')
    if (salesCanvas) {
      analyticsCharts.sales = new Chart(salesCanvas, {
        type: 'line',
        data: { labels: months, datasets: [{ label: 'الإيرادات', data: monthlyData, borderColor: '#0066FF', backgroundColor: 'rgba(0,102,255,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } } } }
      })
    }

    const statusCanvas = document.getElementById('analytics-status-chart')
    if (statusCanvas) {
      analyticsCharts.status = new Chart(statusCanvas, {
        type: 'doughnut',
        data: { labels: ['قيد الانتظار','مقبول','مرفوض','تم التسليم','مؤرشف'],
          datasets: [{ data: [statusCounts.pending || 0, statusCounts.approved || 0, statusCounts.rejected || 0, statusCounts.delivered || 0, statusCounts.archived || 0],
            backgroundColor: ['#FFD60A','#30D158','#FF453A','#0066FF','rgba(255,255,255,0.2)'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)' } } } }
      })
    }

    const growthCanvas = document.getElementById('analytics-growth-chart')
    if (growthCanvas && growthRes.data) {
      const growthMap = {}
      for (const c of growthRes.data) {
        const month = new Date(c.created_at).getMonth()
        growthMap[month] = (growthMap[month] || 0) + 1
      }
      const growthData = months.map((_, i) => growthMap[i] || 0)
      let cumulative = 0
      const cumData = growthData.map(v => { cumulative += v; return cumulative })
      analyticsCharts.growth = new Chart(growthCanvas, {
        type: 'line',
        data: { labels: months, datasets: [{ label: 'نمو العملاء', data: cumData, borderColor: '#30D158', backgroundColor: 'rgba(48,209,88,0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
            x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } } } }
      })
    }
  }
}
