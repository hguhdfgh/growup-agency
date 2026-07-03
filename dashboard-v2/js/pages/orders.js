let currentEditingOrderId = null

async function loadOrders() {
  AppState.resetPageState('orders')
  AppState.currentPage = 'orders'
  const filters = AppState.filters.orders
  const pag = AppState.pagination.orders
  const { data, count, error } = await getOrders({
    status: filters.status,
    search: filters.search,
    page: pag.page,
    perPage: pag.perPage
  })
  if (error) { showToast(__('error_general'), 'error'); return }
  pag.total = count || 0
  renderOrdersTable(data || [])
  Pagination.render('orders-pagination', { currentPage: pag.page, total: pag.total, perPage: pag.perPage, onChange: goOrdersPage })

  bindOrderFilters()
}

function renderOrdersTable(orders) {
  const tbody = $('orders-body')
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><p>' + __('no_data') + '</p></div></td></tr>'
    return
  }
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><input type="checkbox" class="order-check" value="${o.id}" onchange="updateBatchBar()"></td>
      <td><a onclick="Router.navigate('order-detail', {id: '${o.id}'})" style="color:var(--primary-light);cursor:pointer;font-weight:600;">#${esc(o.order_number || '')}</a></td>
      <td>${esc(o.customer_name || o.customers?.full_name || '')}</td>
      <td>${esc(o.products?.name || '')}</td>
      <td>${fmtCurr(o.amount)}</td>
      <td>${esc(o.payment_method || '')}</td>
      <td>${statusBadge(o.status)}</td>
      <td>${fmtDate(o.created_at)}</td>
      <td class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="Router.navigate('order-detail', {id: '${o.id}'})" title="تفاصيل"><i class="fas fa-eye"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('modal-order-form', {id: '${o.id}'})" title="تعديل"><i class="fas fa-edit"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="showConfirm('${__('confirm_delete')}', () => deleteOrderAction('${o.id}'))" title="حذف"><i class="fas fa-trash" style="color:var(--error)"></i></button>
      </td>
    </tr>
  `).join('')
}

function bindOrderFilters() {
  const searchInput = $('orders-search')
  const statusFilter = $('orders-status-filter')
  if (searchInput) {
    searchInput.value = AppState.filters.orders.search
    searchInput.oninput = debounce(() => {
      AppState.filters.orders.search = searchInput.value
      AppState.pagination.orders.page = 1
      loadOrders()
    }, 400)
  }
  if (statusFilter) {
    statusFilter.value = AppState.filters.orders.status
    statusFilter.onchange = () => {
      AppState.filters.orders.status = statusFilter.value
      AppState.pagination.orders.page = 1
      loadOrders()
    }
  }
}

function goOrdersPage(page) {
  AppState.pagination.orders.page = page
  loadOrders()
}

function toggleAllOrders(checked) {
  qa('.order-check').forEach(cb => cb.checked = checked)
  updateBatchBar()
}

function updateBatchBar() {
  const checked = qa('.order-check:checked')
  const bar = $('orders-batch-bar')
  const count = $('orders-selected-count')
  if (count) count.textContent = checked.length + ' ' + __('selected')
  if (bar) bar.classList.toggle('active', checked.length > 0)
}

async function batchApproveOrders() {
  const ids = [...qa('.order-check:checked')].map(cb => cb.value)
  for (const id of ids) {
    try { await approveOrder(id) } catch {}
  }
  showToast(__('success_save'), 'success')
  loadOrders()
}

async function batchDeleteOrders() {
  const ids = [...qa('.order-check:checked')].map(cb => cb.value)
  showConfirm(__('confirm_action'), async () => {
    for (const id of ids) {
      try { await deleteOrder(id) } catch {}
    }
    showToast(__('success_delete'), 'success')
    loadOrders()
  })
}

async function deleteOrderAction(id) {
  await deleteOrder(id)
  showToast(__('success_delete'), 'success')
  loadOrders()
}

async function loadOrderDetail(params) {
  const id = params.id
  if (!id) { Router.navigate('orders'); return }
  AppState.currentOrderId = id
  try {
    const { data: order, error } = await getOrder(id)
    if (error || !order) { Router.navigate('orders'); return }
    $('order-detail-number').textContent = '#' + (order.order_number || '')

    const infoHtml = `
      <div class="detail-field"><div class="detail-label">رقم الطلب</div><div class="detail-value">#${esc(order.order_number || '')}</div></div>
      <div class="detail-field"><div class="detail-label">اسم العميل</div><div class="detail-value">${esc(order.customer_name || order.customers?.full_name || '')}</div></div>
      <div class="detail-field"><div class="detail-label">البريد الإلكتروني</div><div class="detail-value">${esc(order.email || order.customers?.email || '')}</div></div>
      <div class="detail-field"><div class="detail-label">رقم الهاتف</div><div class="detail-value">${esc(order.phone || order.customers?.phone || '')}</div></div>
      <div class="detail-field"><div class="detail-label">المنتج</div><div class="detail-value">${esc(order.products?.name || '')}</div></div>
      <div class="detail-field"><div class="detail-label">المبلغ</div><div class="detail-value">${fmtCurr(order.amount)}</div></div>
      <div class="detail-field"><div class="detail-label">طريقة الدفع</div><div class="detail-value">${esc(order.payment_method || '')}</div></div>
      <div class="detail-field"><div class="detail-label">الحالة</div><div class="detail-value">${statusBadge(order.status)}</div></div>
      <div class="detail-field"><div class="detail-label">التاريخ</div><div class="detail-value">${fmtDate(order.created_at)}</div></div>
      <div class="detail-field"><div class="detail-label">ملاحظات</div><div class="detail-value">${esc(order.notes || '-')}</div></div>
    `
    $('order-detail-info').innerHTML = infoHtml

    const actionsHtml = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${order.status === 'pending' ? `
          <button class="btn btn-success btn-block" onclick="approveOrderAction('${order.id}')"><i class="fas fa-check"></i> ${__('approve')}</button>
          <button class="btn btn-danger btn-block" onclick="showConfirm('${__('reject')}?', () => rejectOrderAction('${order.id}'))"><i class="fas fa-times"></i> ${__('reject')}</button>
        ` : ''}
        <button class="btn btn-secondary btn-block" onclick="openModal('modal-order-form', {id: '${order.id}'})"><i class="fas fa-edit"></i> ${__('edit_order')}</button>
        <button class="btn btn-danger btn-block" onclick="showConfirm('${__('confirm_delete')}', () => deleteOrderAction('${order.id}'))"><i class="fas fa-trash"></i> ${__('delete')}</button>
      </div>
    `
    $('order-detail-actions').innerHTML = actionsHtml
    $('order-admin-note').value = order.admin_notes || ''

    const { data: timeline } = await getOrderTimeline(id)
    renderTimeline(timeline || [])
  } catch {
    Router.navigate('orders')
  }
}

function renderTimeline(entries) {
  const container = $('order-timeline')
  if (!entries?.length) {
    container.innerHTML = '<div class="empty-state"><p>' + __('no_data') + '</p></div>'
    return
  }
  container.innerHTML = entries.map(e => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-date">${fmtDate(e.created_at)}</div>
      <div class="timeline-text"><strong>${esc(e.action)}</strong>: ${esc(e.description || '')}</div>
    </div>
  `).join('')
}

async function approveOrderAction(id) {
  try {
    await approveOrder(id)
    await addTimelineEntry(id, 'approved', 'تم قبول الطلب', AppState.user?.full_name)
    showToast(__('success_save'), 'success')
    loadOrderDetail({ id })
  } catch { showToast(__('error_general'), 'error') }
}

async function rejectOrderAction(id) {
  try {
    await rejectOrder(id)
    await addTimelineEntry(id, 'rejected', 'تم رفض الطلب', AppState.user?.full_name)
    showToast(__('success_save'), 'success')
    loadOrderDetail({ id })
  } catch { showToast(__('error_general'), 'error') }
}

async function saveOrderNote() {
  const note = $('order-admin-note')?.value || ''
  try {
    await updateOrder(AppState.currentOrderId, { admin_notes: note })
    showToast(__('success_save'), 'success')
  } catch { showToast(__('error_general'), 'error') }
}

async function loadModalSelects() {
  const [customersRes, productsRes] = await Promise.all([
    getCustomers({ page: 1, perPage: 200 }),
    getProducts({ activeOnly: true })
  ])
  const customerSelect = $('modal-order-customer')
  const productSelect = $('modal-order-product')
  if (customerSelect) {
    customerSelect.innerHTML = '<option value="">اختر عميل...</option>' + (customersRes.data || []).map(c =>
      `<option value="${c.id}">${esc(c.full_name)} (${esc(c.email)})</option>`
    ).join('')
  }
  if (productSelect) {
    productSelect.innerHTML = '<option value="">اختر منتج...</option>' + (productsRes.data || []).map(p =>
      `<option value="${p.id}" data-price="${p.price}">${esc(p.name)} - ${fmtCurr(p.price)}</option>`
    ).join('')
  }
}

function fillOrderModal(data) {
  const order = data?.order
  currentEditingOrderId = order?.id || null
  const modalTitle = $('modal-order-form')?.querySelector('.modal-title')
  if (modalTitle) modalTitle.textContent = order ? __('edit_order') : __('create_order')
  const amountInput = $('modal-order-amount')
  const statusSelect = $('modal-order-status')
  const notesTextarea = $('modal-order-notes')
  if (order) {
    setSelectValue('modal-order-customer', order.customer_id)
    setSelectValue('modal-order-product', order.product_id)
    if (amountInput) amountInput.value = order.amount
    if (statusSelect) statusSelect.value = order.status
    if (notesTextarea) notesTextarea.value = order.notes || ''
  } else {
    if (amountInput) amountInput.value = ''
    if (statusSelect) statusSelect.value = 'pending'
    if (notesTextarea) notesTextarea.value = ''
  }
  const productSelect = $('modal-order-product')
  if (productSelect) {
    productSelect.onchange = () => {
      const opt = productSelect.options[productSelect.selectedIndex]
      if (opt?.dataset?.price && amountInput) amountInput.value = opt.dataset.price
    }
  }
  loadModalSelects().then(() => {
    if (order) {
      setSelectValue('modal-order-customer', order.customer_id)
      setSelectValue('modal-order-product', order.product_id)
    }
  })
}

function setSelectValue(id, value) {
  const el = $(id)
  if (el) el.value = value
}

async function saveModalOrder() {
  const data = {
    customer_id: $('modal-order-customer')?.value,
    product_id: $('modal-order-product')?.value,
    amount: parseFloat($('modal-order-amount')?.value || 0),
    quantity: parseInt($('modal-order-quantity')?.value || 1),
    status: $('modal-order-status')?.value || 'pending',
    notes: $('modal-order-notes')?.value || ''
  }
  if (!data.customer_id || !data.product_id || !data.amount) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error')
    return
  }
  try {
    if (currentEditingOrderId) {
      await updateOrder(currentEditingOrderId, data)
    } else {
      const selectedCustomer = await getCustomer(data.customer_id)
      if (selectedCustomer.data) {
        data.customer_name = selectedCustomer.data.full_name
        data.email = selectedCustomer.data.email
        data.phone = selectedCustomer.data.phone
      }
      await createOrder(data)
    }
    closeModal('modal-order-form')
    showToast(__('success_save'), 'success')
    loadOrders()
  } catch { showToast(__('error_general'), 'error') }
}

function exportOrdersCSV() {
  showToast('جاري تصدير الطلبات...', 'info')
  getOrders({ page: 1, perPage: 10000 }).then(({ data }) => {
    if (!data?.length) { showToast(__('no_data'), 'warning'); return }
    const headers = ['رقم الطلب', 'اسم العميل', 'البريد', 'الهاتف', 'المنتج', 'المبلغ', 'طريقة الدفع', 'الحالة', 'التاريخ']
    const rows = data.map(o => [o.order_number, o.customer_name, o.email, o.phone, o.products?.name, o.amount, o.payment_method, o.status, o.created_at])
    exportToCSV(headers, rows, 'الطلبات')
    showToast(__('success_save'), 'success')
  }).catch(() => showToast(__('error_general'), 'error'))
}

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
