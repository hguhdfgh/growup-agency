async function loadActivity() {
  AppState.resetPageState('activity')
  AppState.currentPage = 'activity'
  const pag = AppState.pagination.activity
  const actionFilter = $('activity-action-filter')?.value || ''

  const { data, count, error } = await getActivityLogs({
    action: actionFilter,
    page: pag.page,
    perPage: pag.perPage
  })
  if (error) { showToast(__('error_general'), 'error'); return }
  pag.total = count || 0

  const tbody = $('activity-body')
  if (!data?.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><p>' + __('no_data') + '</p></div></td></tr>'
    return
  }
  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${esc(a.actor_id ? (a.actor_type || '') + ' - ' + a.actor_id : '-')}</td>
      <td><span class="badge badge-${a.action === 'delete' ? 'rejected' : a.action === 'create' ? 'approved' : 'default'}">${esc(a.action)}</span></td>
      <td>${esc(a.resource_type || '-')}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${a.details ? esc(typeof a.details === 'object' ? JSON.stringify(a.details) : a.details) : '-'}
      </td>
      <td>${fmtDate(a.created_at)}</td>
    </tr>
  `).join('')

  Pagination.render('activity-pagination', { currentPage: pag.page, total: pag.total, perPage: pag.perPage, onChange: goActivityPage })

  if ($('activity-action-filter')) {
    $('activity-action-filter').value = actionFilter
    $('activity-action-filter').onchange = () => {
      AppState.filters.activity.action = $('activity-action-filter').value
      AppState.pagination.activity.page = 1
      loadActivity()
    }
  }
}

function goActivityPage(page) {
  AppState.pagination.activity.page = page
  loadActivity()
}
