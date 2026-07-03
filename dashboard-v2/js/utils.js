const $ = id => document.getElementById(id)
const q = selector => document.querySelector(selector)
const qa = selector => document.querySelectorAll(selector)

function esc(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function sanitizeHTML(str) {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function fmtDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-DZ', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function fmtDateShort(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-DZ', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function fmtCurr(n) {
  if (n === null || n === undefined) return '-'
  return Number(n).toLocaleString('ar-DZ') + ' دج'
}

function statusBadge(status) {
  const colors = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    delivered: 'badge-delivered',
    archived: 'badge-archived',
    active: 'badge-active',
    inactive: 'badge-inactive',
    open: 'badge-open',
    in_progress: 'badge-progress',
    resolved: 'badge-resolved',
    closed: 'badge-closed',
    contacted: 'badge-contacted',
    recovered: 'badge-recovered',
    lost: 'badge-lost'
  }
  const cls = colors[status] || 'badge-default'
  const labels = {
    pending: __('order_status_pending'),
    approved: __('order_status_approved'),
    rejected: __('order_status_rejected'),
    delivered: __('order_status_delivered'),
    archived: __('order_status_archived'),
    active: __('is_active'),
    inactive: 'غير نشط',
    open: __('ticket_status_open'),
    in_progress: __('ticket_status_in_progress'),
    resolved: __('ticket_status_resolved'),
    closed: __('ticket_status_closed'),
    contacted: 'تم التواصل',
    recovered: 'تم الاسترداد',
    lost: 'مفقودة'
  }
  return `<span class="badge ${cls}">${labels[status] || status}</span>`
}

function showLoader(containerId) {
  const el = $(containerId)
  if (el) el.innerHTML = '<div class="loader"><div class="spinner"></div><p>' + __('loading') + '</p></div>'
}

function hideLoader(containerId) {
  const el = $(containerId)
  if (el) {
    const loader = el.querySelector('.loader')
    if (loader) loader.remove()
  }
}

function showEmpty(containerId, msg) {
  const el = $(containerId)
  if (el) el.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>' + (msg || __('no_data')) + '</p></div>'
}

function exportToCSV(headers, rows, filename) {
  let csv = headers.join(',') + '\n'
  for (const row of rows) {
    csv += row.map(cell => {
      const val = String(cell || '')
      return val.includes(',') ? '"' + val.replace(/"/g, '""') + '"' : val
    }).join(',') + '\n'
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename + '_' + new Date().toISOString().split('T')[0] + '.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
