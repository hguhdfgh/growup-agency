let currentEditingCustomerId = null

async function loadCustomers() {
  AppState.resetPageState('customers')
  AppState.currentPage = 'customers'
  const filters = AppState.filters.customers
  const pag = AppState.pagination.customers
  const { data, count, error } = await getCustomers({
    search: filters.search,
    status: filters.status,
    source: filters.source,
    page: pag.page,
    perPage: pag.perPage
  })
  if (error) { showToast(__('error_general'), 'error'); return }
  pag.total = count || 0
  renderCustomersTable(data || [])
  Pagination.render('customers-pagination', { currentPage: pag.page, total: pag.total, perPage: pag.perPage, onChange: goCustomersPage })

  const searchInput = $('customers-search')
  if (searchInput) {
    searchInput.value = filters.search
    searchInput.oninput = debounce(() => {
      AppState.filters.customers.search = searchInput.value
      AppState.pagination.customers.page = 1
      loadCustomers()
    }, 400)
  }
  const statusFilter = $('customers-status-filter')
  if (statusFilter) {
    statusFilter.value = filters.status
    statusFilter.onchange = () => {
      AppState.filters.customers.status = statusFilter.value
      AppState.pagination.customers.page = 1
      loadCustomers()
    }
  }
}

function renderCustomersTable(customers) {
  const tbody = $('customers-body')
  if (!customers.length) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><p>' + __('no_data') + '</p></div></td></tr>'
    return
  }
  tbody.innerHTML = customers.map(c => `
    <tr>
      <td><a onclick="Router.navigate('customer-detail', {id: '${c.id}'})" style="color:var(--primary-light);cursor:pointer;font-weight:600;">${esc(c.full_name || '')}</a></td>
      <td>${esc(c.email || '')}</td>
      <td>${esc(c.phone || '-')}</td>
      <td>${esc(c.source || '-')}</td>
      <td>${statusBadge(c.status || 'active')}</td>
      <td>${c.total_orders || 0}</td>
      <td>${fmtCurr(c.total_spent || 0)}</td>
      <td>${fmtDate(c.created_at)}</td>
      <td class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="Router.navigate('customer-detail', {id: '${c.id}'})" title="تفاصيل"><i class="fas fa-eye"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('modal-customer-form', {id: '${c.id}'})" title="تعديل"><i class="fas fa-edit"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="showConfirm('${__('confirm_delete')}', () => deleteCustomerAction('${c.id}'))" title="حذف"><i class="fas fa-trash" style="color:var(--error)"></i></button>
      </td>
    </tr>
  `).join('')
}

function goCustomersPage(page) {
  AppState.pagination.customers.page = page
  loadCustomers()
}

async function loadCustomerDetail(params) {
  const id = params.id
  if (!id) { Router.navigate('customers'); return }
  try {
    const { data: customer } = await getCustomer(id)
    if (!customer) { Router.navigate('customers'); return }
    $('customer-detail-name').textContent = customer.full_name

    $('customer-detail-info').innerHTML = `
      <div class="detail-field"><div class="detail-label">${__('customer_name')}</div><div class="detail-value">${esc(customer.full_name || '')}</div></div>
      <div class="detail-field"><div class="detail-label">${__('email')}</div><div class="detail-value">${esc(customer.email || '')}</div></div>
      <div class="detail-field"><div class="detail-label">${__('customer_phone')}</div><div class="detail-value">${esc(customer.phone || '-')}</div></div>
      <div class="detail-field"><div class="detail-label">${__('city')}</div><div class="detail-value">${esc(customer.city || '-')}</div></div>
      <div class="detail-field"><div class="detail-label">${__('source')}</div><div class="detail-value">${esc(customer.source || '-')}</div></div>
      <div class="detail-field"><div class="detail-label">${__('total_orders')}</div><div class="detail-value">${customer.total_orders || 0}</div></div>
      <div class="detail-field"><div class="detail-label">${__('total_spent')}</div><div class="detail-value">${fmtCurr(customer.total_spent || 0)}</div></div>
      <div class="detail-field"><div class="detail-label">${__('status')}</div><div class="detail-value">${statusBadge(customer.status || 'active')}</div></div>
      <div class="detail-field"><div class="detail-label">${__('date')}</div><div class="detail-value">${fmtDate(customer.created_at)}</div></div>
    `

    const { data: orders } = await getCustomerOrders(id)
    const ordersContainer = $('customer-detail-orders')
    if (!orders?.length) {
      ordersContainer.innerHTML = '<div class="empty-state"><p>' + __('no_data') + '</p></div>'
    } else {
      ordersContainer.innerHTML = '<div class="timeline">' + orders.map(o => `
        <div class="timeline-item" style="cursor:pointer" onclick="Router.navigate('order-detail', {id: '${o.id}'})">
          <div class="timeline-dot"></div>
          <div class="timeline-date">#${esc(o.order_number || '')} - ${fmtDate(o.created_at)}</div>
          <div class="timeline-text">${esc(o.products?.name || '')} - ${fmtCurr(o.amount)} ${statusBadge(o.status)}</div>
        </div>
      `).join('') + '</div>'
    }
  } catch { Router.navigate('customers') }
}

function fillCustomerModal(data) {
  const customer = data?.customer
  currentEditingCustomerId = customer?.id || null
  const modalTitle = $('modal-customer-form')?.querySelector('.modal-title')
  if (modalTitle) modalTitle.textContent = customer ? __('edit_customer') : __('create_customer')
  if (customer) {
    if ($('modal-customer-name')) $('modal-customer-name').value = customer.full_name || ''
    if ($('modal-customer-email')) $('modal-customer-email').value = customer.email || ''
    if ($('modal-customer-phone')) $('modal-customer-phone').value = customer.phone || ''
    if ($('modal-customer-source')) $('modal-customer-source').value = customer.source || 'direct'
    if ($('modal-customer-city')) $('modal-customer-city').value = customer.city || ''
    if ($('modal-customer-status')) $('modal-customer-status').value = customer.status || 'active'
    if ($('modal-customer-notes')) $('modal-customer-notes').value = customer.notes || ''
  } else {
    ['modal-customer-name','modal-customer-email','modal-customer-phone','modal-customer-city','modal-customer-notes'].forEach(id => { const el = $(id); if (el) el.value = '' })
    if ($('modal-customer-source')) $('modal-customer-source').value = 'direct'
    if ($('modal-customer-status')) $('modal-customer-status').value = 'active'
  }
}

async function saveModalCustomer() {
  const data = {
    full_name: $('modal-customer-name')?.value,
    email: $('modal-customer-email')?.value,
    phone: $('modal-customer-phone')?.value || '',
    source: $('modal-customer-source')?.value || 'direct',
    city: $('modal-customer-city')?.value || '',
    notes: $('modal-customer-notes')?.value || '',
    status: $('modal-customer-status')?.value || 'active'
  }
  if (!data.full_name || !data.email) {
    showToast('يرجى ملء الاسم والبريد الإلكتروني', 'error'); return
  }
  try {
    if (currentEditingCustomerId) {
      await updateCustomer(currentEditingCustomerId, data)
    } else {
      await createCustomer(data)
    }
    closeModal('modal-customer-form')
    showToast(__('success_save'), 'success')
    loadCustomers()
  } catch { showToast(__('error_general'), 'error') }
}

async function deleteCustomerAction(id) {
  try {
    await deleteCustomer(id)
    showToast(__('success_delete'), 'success')
    loadCustomers()
  } catch { showToast(__('error_general'), 'error') }
}

function exportCustomersCSV() {
  showToast('جاري تصدير العملاء...', 'info')
  getCustomers({ page: 1, perPage: 10000 }).then(({ data }) => {
    if (!data?.length) { showToast(__('no_data'), 'warning'); return }
    const headers = ['الاسم', 'البريد', 'الهاتف', 'المصدر', 'الحالة', 'المدينة', 'الطلبات', 'الإجمالي', 'التاريخ']
    const rows = data.map(c => [c.full_name, c.email, c.phone, c.source, c.status, c.city, c.total_orders, c.total_spent, c.created_at])
    exportToCSV(headers, rows, 'العملاء')
    showToast(__('success_save'), 'success')
  }).catch(() => showToast(__('error_general'), 'error'))
}
