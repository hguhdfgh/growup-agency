async function loadNotifications() {
  AppState.currentPage = 'notifications'
  const typeFilter = $('notif-type-filter')?.value || ''
  const readFilter = $('notif-read-filter')?.value || ''
  const isRead = readFilter === 'unread' ? false : readFilter === 'read' ? true : undefined

  const { data, error } = await getNotifications({ type: typeFilter, isRead })
  if (error) { showToast(__('error_general'), 'error'); return }
  const container = $('notifications-list')
  if (!data?.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><p>' + __('no_notifications') + '</p></div>'
    return
  }
  container.innerHTML = data.map(n => `
    <div class="card" style="margin-bottom:8px;${!n.is_read ? 'border-right:3px solid var(--primary);' : ''}">
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <div style="flex:1;">
          <div style="font-weight:${n.is_read ? '400' : '700'};margin-bottom:4px;">${esc(n.title || '')}</div>
          <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:4px;">${esc(n.body || '')}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${fmtDate(n.created_at)}</div>
        </div>
        ${!n.is_read ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="markNotifRead('${n.id}')" title="تحديد كمقروء"><i class="fas fa-check"></i></button>` : ''}
      </div>
    </div>
  `).join('')

  if ($('notif-type-filter')) {
    $('notif-type-filter').onchange = loadNotifications
  }
  if ($('notif-read-filter')) {
    $('notif-read-filter').onchange = loadNotifications
  }
}

async function markNotifRead(id) {
  try {
    await markNotificationRead(id)
    loadNotifications()
    updateNotifBadge()
  } catch {}
}

async function markAllRead() {
  try {
    await markAllNotificationsRead()
    loadNotifications()
    updateNotifBadge()
    showToast(__('success_save'), 'success')
  } catch {}
}

async function updateNotifBadge() {
  try {
    const { data } = await getNotifications({ isRead: false })
    const count = data?.length || 0
    const badge = $('notif-badge')
    const headerBadge = $('header-notif-count')
    if (badge) badge.textContent = count
    if (headerBadge) {
      headerBadge.textContent = count
      headerBadge.style.display = count > 0 ? 'flex' : 'none'
    }
  } catch {}
}
