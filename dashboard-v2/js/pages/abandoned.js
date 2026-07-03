let currentAbandonedPage = 1

async function loadAbandoned() {
  AppState.currentPage = 'abandoned'
  const search = $('abandoned-search')?.value || ''
  const statusFilter = $('abandoned-status-filter')?.value || ''
  const { data, count, error } = await getAbandonedOrders({
    search,
    status: statusFilter,
    page: currentAbandonedPage,
    perPage: 20
  })
  if (error) { showToast(__('error_general'), 'error'); return }

  const stats = {
    total: count || 0,
    contacted: 0,
    recovered: 0,
    lost: 0
  }
  if (data) {
    for (const a of data) {
      if (a.status === 'contacted') stats.contacted++
      else if (a.status === 'recovered') stats.recovered++
      else if (a.status === 'lost') stats.lost++
    }
  }
  if ($('abandoned-total')) $('abandoned-total').textContent = stats.total
  if ($('abandoned-contacted')) $('abandoned-contacted').textContent = stats.contacted
  if ($('abandoned-recovered')) $('abandoned-recovered').textContent = stats.recovered
  if ($('abandoned-lost')) $('abandoned-lost').textContent = stats.lost

  const tbody = $('abandoned-body')
  if (!data?.length) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><p>' + __('no_data') + '</p></div></td></tr>'
    return
  }
  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${esc(a.customer_name || '')}</td>
      <td>${esc(a.email || '-')}</td>
      <td>${esc(a.phone || '-')}</td>
      <td>${esc(a.product_name || '-')}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="flex:1;height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${a.completion_pct || 0}%;background:var(--primary);border-radius:3px;"></div>
          </div>
          <span style="font-size:0.8rem;color:var(--text-muted);">${a.completion_pct || 0}%</span>
        </div>
      </td>
      <td>${statusBadge(a.status || 'pending')}</td>
      <td>${a.recovery_attempts || 0}</td>
      <td>${a.last_contact_date ? fmtDate(a.last_contact_date) : '-'}</td>
      <td class="actions">
        ${a.phone ? `<a href="https://wa.me/${a.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-ghost btn-icon btn-sm" title="${__('whatsapp')}" onclick="trackAbandonedAction('${a.id}','whatsapp')"><i class="fab fa-whatsapp" style="color:var(--success)"></i></a>` : ''}
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editAbandonedModal('${a.id}')" title="${__('edit')}"><i class="fas fa-edit"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="convertAbandoned('${a.id}')" title="${__('convert_to_order')}"><i class="fas fa-exchange-alt" style="color:var(--primary-light)"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="showConfirm('${__('confirm_delete')}', () => deleteAbandonedAction('${a.id}'))" title="${__('delete')}"><i class="fas fa-trash" style="color:var(--error)"></i></button>
      </td>
    </tr>
  `).join('')

  Pagination.render('abandoned-pagination', { currentPage: currentAbandonedPage, total: count || 0, perPage: 20, onChange: p => { currentAbandonedPage = p; loadAbandoned() } })

  const searchInput = $('abandoned-search')
  if (searchInput) {
    searchInput.oninput = debounce(() => {
      currentAbandonedPage = 1
      loadAbandoned()
    }, 400)
  }
  const statusSelect = $('abandoned-status-filter')
  if (statusSelect) {
    statusSelect.onchange = () => {
      currentAbandonedPage = 1
      loadAbandoned()
    }
  }

  const badge = $('abandoned-badge')
  if (badge) badge.textContent = data?.filter(a => a.status === 'pending')?.length || 0
}

async function trackAbandonedAction(id, action) {
  try {
    await trackAbandonedAction(id, action)
    updateAbandonedStatus(id, 'contacted')
  } catch {}
}

async function updateAbandonedStatus(id, status) {
  try {
    await updateAbandonedStatus(id, status)
    loadAbandoned()
  } catch { showToast(__('error_general'), 'error') }
}

function editAbandonedModal(id) {
  const row = document.querySelector(`#abandoned-body tr:nth-child(${currentAbandonedPage})`)
  showToast('يمكن تعديل الطلب المتروك من قائمة الطلبات', 'info')
}

async function convertAbandoned(id) {
  showConfirm('تحويل هذا الطلب المتروك إلى طلب فعلي؟', async () => {
    try {
      await convertAbandonedToOrder(id)
      showToast(__('success_create'), 'success')
      loadAbandoned()
    } catch { showToast(__('error_general'), 'error') }
  })
}

async function deleteAbandonedAction(id) {
  try {
    await deleteAbandonedOrder(id)
    showToast(__('success_delete'), 'success')
    loadAbandoned()
  } catch { showToast(__('error_general'), 'error') }
}

function exportAbandonedCSV() {
  showToast('جاري تصدير الطلبات المتروكة...', 'info')
  getAbandonedOrders({ page: 1, perPage: 10000 }).then(({ data }) => {
    if (!data?.length) { showToast(__('no_data'), 'warning'); return }
    const headers = ['الاسم', 'البريد', 'الهاتف', 'المنتج', 'الإكمال', 'الحالة', 'محاولات الاسترداد', 'آخر تواصل']
    const rows = data.map(a => [a.customer_name, a.email, a.phone, a.product_name, a.completion_pct + '%', a.status, a.recovery_attempts, a.last_contact_date])
    exportToCSV(headers, rows, 'الطلبات_المتروكة')
    showToast(__('success_save'), 'success')
  }).catch(() => showToast(__('error_general'), 'error'))
}
