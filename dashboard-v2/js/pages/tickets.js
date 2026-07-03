let currentEditingTicketId = null
let currentViewingTicketId = null

async function loadTickets() {
  AppState.resetPageState('tickets')
  AppState.currentPage = 'tickets'
  const filters = AppState.filters.tickets
  const pag = AppState.pagination.tickets
  const { data, count, error } = await getTickets({
    status: filters.status,
    priority: filters.priority,
    page: pag.page,
    perPage: pag.perPage
  })
  if (error) { showToast(__('error_general'), 'error'); return }
  pag.total = count || 0
  renderTicketsTable(data || [])
  Pagination.render('tickets-pagination', { currentPage: pag.page, total: pag.total, perPage: pag.perPage, onChange: goTicketsPage })

  const statusFilter = $('tickets-status-filter')
  if (statusFilter) {
    statusFilter.value = filters.status
    statusFilter.onchange = () => {
      AppState.filters.tickets.status = statusFilter.value
      AppState.pagination.tickets.page = 1
      loadTickets()
    }
  }
  const priorityFilter = $('tickets-priority-filter')
  if (priorityFilter) {
    priorityFilter.value = filters.priority
    priorityFilter.onchange = () => {
      AppState.filters.tickets.priority = priorityFilter.value
      AppState.pagination.tickets.page = 1
      loadTickets()
    }
  }
}

function renderTicketsTable(tickets) {
  const tbody = $('tickets-body')
  if (!tickets.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><p>' + __('no_data') + '</p></div></td></tr>'
    return
  }
  const priorityColors = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--error)' }
  tbody.innerHTML = tickets.map(t => `
    <tr>
      <td><a onclick="Router.navigate('ticket-detail', {id: '${t.id}'})" style="color:var(--primary-light);cursor:pointer;font-weight:600;">${esc(t.subject || '')}</a></td>
      <td><span style="color:${priorityColors[t.priority] || 'var(--text-secondary)'};font-weight:600;">${__(`priority_${t.priority}`)}</span></td>
      <td>${statusBadge(t.status)}</td>
      <td>${esc(t.assigned_to || '-')}</td>
      <td>${fmtDate(t.updated_at)}</td>
      <td class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="Router.navigate('ticket-detail', {id: '${t.id}'})" title="تفاصيل"><i class="fas fa-eye"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('modal-ticket-form', {id: '${t.id}'})" title="تعديل"><i class="fas fa-edit"></i></button>
      </td>
    </tr>
  `).join('')
}

function goTicketsPage(page) {
  AppState.pagination.tickets.page = page
  loadTickets()
}

async function loadTicketDetail(params) {
  const id = params.id
  if (!id) { Router.navigate('tickets'); return }
  currentViewingTicketId = id
  try {
    const { ticket, replies } = await getTicket(id)
    if (!ticket.data) { Router.navigate('tickets'); return }
    const t = ticket.data
    $('ticket-detail-subject').textContent = t.subject

    $('ticket-detail-info').innerHTML = `
      <div class="detail-field"><div class="detail-label">${__('ticket_subject')}</div><div class="detail-value">${esc(t.subject)}</div></div>
      <div class="detail-field"><div class="detail-label">${__('ticket_description')}</div><div class="detail-value">${esc(t.description || '-')}</div></div>
      <div class="detail-field"><div class="detail-label">${__('ticket_priority')}</div><div class="detail-value"><span style="color:${({low:'var(--success)',medium:'var(--warning)',high:'var(--error)'})[t.priority] || 'var(--text-secondary)'}">${__(`priority_${t.priority}`)}</span></div></div>
      <div class="detail-field"><div class="detail-label">${__('status')}</div><div class="detail-value">${statusBadge(t.status)}</div></div>
      <div class="detail-field"><div class="detail-label">${__('date')}</div><div class="detail-value">${fmtDate(t.created_at)}</div></div>
    `

    const statusActions = {
      open: ['in_progress', 'resolved'],
      in_progress: ['resolved', 'open'],
      resolved: ['closed', 'open'],
      closed: ['open']
    }
    const nextStatuses = statusActions[t.status] || []
    const actionsHtml = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${nextStatuses.map(s => `<button class="btn btn-${s === 'resolved' ? 'success' : s === 'closed' ? 'secondary' : 'primary'} btn-block" onclick="updateTicketStatus('${t.id}','${s}')">${__(`ticket_status_${s}`)}</button>`).join('')}
        <div class="form-group" style="margin-top:8px;">
          <label class="form-label">${__('assign')}</label>
          <select class="form-select" id="ticket-assign-select" onchange="assignTicketAction('${t.id}')">
            <option value="">اختر...</option>
          </select>
        </div>
      </div>
    `
    $('ticket-detail-actions').innerHTML = actionsHtml

    const repliesData = replies.data || []
    const repliesContainer = $('ticket-detail-replies')
    if (!repliesData.length) {
      repliesContainer.innerHTML = '<div class="empty-state"><p>' + __('no_data') + '</p></div>'
    } else {
      repliesContainer.innerHTML = repliesData.map(r => `
        <div class="card" style="margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <strong>${esc(r.sender_name || '')}</strong>
            <span style="font-size:0.75rem;color:var(--text-muted)">${fmtDate(r.created_at)}</span>
          </div>
          <p style="color:var(--text-secondary)">${esc(r.message)}</p>
        </div>
      `).join('')
    }

    const profilesRes = await getProfiles()
    const assignSelect = $('ticket-assign-select')
    if (assignSelect && profilesRes.data) {
      assignSelect.innerHTML = '<option value="">اختر...</option>' + profilesRes.data.map(p =>
        `<option value="${p.full_name || p.email}" ${t.assigned_to === (p.full_name || p.email) ? 'selected' : ''}>${esc(p.full_name || p.email)}</option>`
      ).join('')
    }
  } catch { Router.navigate('tickets') }
}

async function updateTicketStatus(id, status) {
  try {
    await updateTicket(id, { status })
    showToast(__('success_save'), 'success')
    loadTicketDetail({ id })
  } catch { showToast(__('error_general'), 'error') }
}

async function assignTicketAction(id) {
  const select = $('ticket-assign-select')
  if (!select) return
  try {
    await updateTicket(id, { assigned_to: select.value })
    showToast(__('success_save'), 'success')
  } catch { showToast(__('error_general'), 'error') }
}

async function sendTicketReply() {
  const text = $('ticket-reply-text')?.value
  if (!text || !currentViewingTicketId) return
  try {
    await addTicketReply(currentViewingTicketId, 'admin', AppState.user?.full_name || 'Admin', text)
    $('ticket-reply-text').value = ''
    showToast(__('success_save'), 'success')
    loadTicketDetail({ id: currentViewingTicketId })
  } catch { showToast(__('error_general'), 'error') }
}

function fillTicketModal(data) {
  const ticket = data?.ticket
  currentEditingTicketId = ticket?.id || null
  if (ticket) {
    if ($('modal-ticket-subject')) $('modal-ticket-subject').value = ticket.subject || ''
    if ($('modal-ticket-priority')) $('modal-ticket-priority').value = ticket.priority || 'medium'
    if ($('modal-ticket-description')) $('modal-ticket-description').value = ticket.description || ''
  } else {
    if ($('modal-ticket-subject')) $('modal-ticket-subject').value = ''
    if ($('modal-ticket-priority')) $('modal-ticket-priority').value = 'medium'
    if ($('modal-ticket-description')) $('modal-ticket-description').value = ''
  }
  getCustomers({ page: 1, perPage: 200 }).then(({ data }) => {
    const select = $('modal-ticket-customer')
    if (select) {
      select.innerHTML = '<option value="">اختر عميل...</option>' + (data || []).map(c =>
        `<option value="${c.id}" ${ticket?.customer_id === c.id ? 'selected' : ''}>${esc(c.full_name)} (${esc(c.email)})</option>`
      ).join('')
    }
  })
}

async function saveModalTicket() {
  const data = {
    subject: $('modal-ticket-subject')?.value,
    description: $('modal-ticket-description')?.value,
    customer_id: $('modal-ticket-customer')?.value || null,
    priority: $('modal-ticket-priority')?.value || 'medium'
  }
  if (!data.subject || !data.description) {
    showToast('يرجى ملء الموضوع والوصف', 'error'); return
  }
  try {
    if (currentEditingTicketId) {
      await updateTicket(currentEditingTicketId, data)
    } else {
      await createTicket(data)
    }
    closeModal('modal-ticket-form')
    showToast(__('success_save'), 'success')
    loadTickets()
  } catch { showToast(__('error_general'), 'error') }
}
