let statsTimer = null

async function loadDashboard() {
  AppState.currentPage = 'dashboard'
  const stats = await getDashboardStats()
  updateStatCards(stats)
  loadRecentOrders()
  loadTopProducts()
  loadDashboardCharts()
  startStatsAutoRefresh()
}

function updateStatCards(stats) {
  if (!stats) return
  const setStat = (id, val, unit) => {
    const el = $(id)
    if (el) el.textContent = val !== undefined && val !== null ? (unit ? val + ' ' + unit : val) : '-'
  }
  setStat('stat-visitors', stats.total_visitors ?? stats.visitors)
  setStat('stat-pageviews', stats.total_pageviews ?? stats.pageviews)
  setStat('stat-orders', stats.total_orders ?? stats.orders)
  setStat('stat-revenue', fmtCurr(stats.monthly_revenue ?? stats.revenue))
  if (stats.conversion_rate !== undefined) {
    setStat('stat-conversion', stats.conversion_rate + '%')
  }
  if (stats.orders_today !== undefined || stats.today_orders !== undefined) {
    const today = stats.orders_today ?? stats.today_orders ?? 0
    const yesterday = stats.yesterday_orders ?? 0
    const change = yesterday > 0 ? ((today - yesterday) / yesterday * 100) : 0
    const changeEl = $('stat-orders-change')
    if (changeEl) {
      changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(1) + '%'
      changeEl.className = 'stat-card-change ' + (change >= 0 ? 'up' : 'down')
    }
  }
}

async function loadRecentOrders() {
  const container = $('recent-orders')
  try {
    const { data } = await getRecentOrders(5)
    if (!data?.length) {
      container.innerHTML = '<div class="empty-state"><p>' + __('no_data') + '</p></div>'
      return
    }
    container.innerHTML = '<div class="timeline">' + data.map(o => `
      <div class="timeline-item" style="cursor:pointer" onclick="Router.navigate('order-detail', {id: '${o.id}'})">
        <div class="timeline-dot"></div>
        <div class="timeline-date">#${esc(o.order_number)} - ${fmtDate(o.created_at)}</div>
        <div class="timeline-text">${esc(o.customer_name || o.customers?.full_name || '')} - ${fmtCurr(o.amount)} ${statusBadge(o.status)}</div>
      </div>
    `).join('') + '</div>'
  } catch {
    container.innerHTML = '<div class="empty-state"><p>' + __('no_data') + '</p></div>'
  }
}

async function loadTopProducts() {
  const container = $('top-products')
  try {
    let data
    const { data: rpcData } = await getTopProducts(5)
    if (rpcData?.length) {
      data = rpcData
    } else {
      const { data: products } = await getProducts({ activeOnly: true })
      data = products?.slice(0, 5).map(p => ({ name: p.name, order_count: 0, revenue: 0 })) || []
    }
    if (!data?.length) {
      container.innerHTML = '<div class="empty-state"><p>' + __('no_data') + '</p></div>'
      return
    }
    container.innerHTML = '<div class="timeline">' + data.map((p, i) => `
      <div class="timeline-item">
        <div class="timeline-dot" style="background:${['var(--primary)','var(--success)','var(--warning)','var(--info)','var(--error)'][i]}"></div>
        <div class="timeline-date">${esc(p.name || '')}</div>
        <div class="timeline-text">${p.order_count || 0} طلبات - ${fmtCurr(p.revenue || 0)}</div>
      </div>
    `).join('') + '</div>'
  } catch {
    container.innerHTML = '<div class="empty-state"><p>' + __('no_data') + '</p></div>'
  }
}

let dashboardCharts = {}

async function loadDashboardCharts() {
  if (typeof Chart === 'undefined') return
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1).toISOString()
  const endOfYear = new Date(year + 1, 0, 1).toISOString()

  const [salesRes, statusCounts] = await Promise.all([
    getSalesTrend(startOfYear, endOfYear),
    getOrderStatusDistribution()
  ])

  const salesCanvas = document.getElementById('sales-chart')
  const statusCanvas = document.getElementById('status-chart')

  if (salesCanvas && dashboardCharts.sales) { dashboardCharts.sales.destroy() }
  if (statusCanvas && dashboardCharts.status) { dashboardCharts.status.destroy() }

  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  const monthlyData = Array(12).fill(0)
  if (salesRes.data) {
    for (const s of salesRes.data) {
      const m = new Date(s.created_at).getMonth()
      monthlyData[m] += (s.amount || 0)
    }
  }

  if (salesCanvas) {
    dashboardCharts.sales = new Chart(salesCanvas, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{ label: 'الإيرادات', data: monthlyData, borderColor: '#0066FF', backgroundColor: 'rgba(0,102,255,0.1)', fill: true, tension: 0.4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
          x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)' } } } }
    })
  }

  if (statusCanvas) {
    dashboardCharts.status = new Chart(statusCanvas, {
      type: 'doughnut',
      data: {
        labels: ['قيد الانتظار','مقبول','مرفوض','تم التسليم','مؤرشف'],
        datasets: [{ data: [statusCounts.pending || 0, statusCounts.approved || 0, statusCounts.rejected || 0, statusCounts.delivered || 0, statusCounts.archived || 0],
          backgroundColor: ['#FFD60A','#30D158','#FF453A','#0066FF','rgba(255,255,255,0.2)'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)' } } } }
    })
  }
}

function startStatsAutoRefresh() {
  if (statsTimer) clearInterval(statsTimer)
  statsTimer = setInterval(refreshDashboardStats, 30000)
}

async function refreshDashboardStats() {
  const stats = await getDashboardStats()
  updateStatCards(stats)
}
