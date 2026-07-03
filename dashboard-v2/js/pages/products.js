let currentEditingProductId = null

async function loadProducts() {
  AppState.currentPage = 'products'
  const { data, error } = await getProducts()
  if (error) { showToast(__('error_general'), 'error'); return }
  const tbody = $('products-body')
  if (!data?.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>' + __('no_data') + '</p></div></td></tr>'
    return
  }
  tbody.innerHTML = data.map(p => `
    <tr>
      <td style="font-weight:600;">${esc(p.name)}</td>
      <td>${fmtCurr(p.price)}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(p.description || '-')}</td>
      <td>${p.is_active ? '<span style="color:var(--success)">نعم</span>' : '<span style="color:var(--text-muted)">لا</span>'}</td>
      <td>${p.is_featured ? '<span style="color:var(--warning)"><i class="fas fa-star"></i></span>' : '-'}</td>
      <td>${p.sort_order || 0}</td>
      <td class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('modal-product-form', {id: '${p.id}'})" title="تعديل"><i class="fas fa-edit"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="reorderProduct('${p.id}', ${p.sort_order || 0} - 1)" title="رفع"><i class="fas fa-arrow-up"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="reorderProduct('${p.id}', ${p.sort_order || 0} + 1)" title="خفض"><i class="fas fa-arrow-down"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="showConfirm('${__('confirm_delete')}', () => deleteProductAction('${p.id}'))" title="حذف"><i class="fas fa-trash" style="color:var(--error)"></i></button>
      </td>
    </tr>
  `).join('')
}

async function reorderProduct(id, newOrder) {
  try {
    await updateProduct(id, { sort_order: Math.max(0, newOrder) })
    loadProducts()
  } catch { showToast(__('error_general'), 'error') }
}

async function deleteProductAction(id) {
  try {
    await deleteProduct(id)
    showToast(__('success_delete'), 'success')
    loadProducts()
  } catch { showToast(__('error_general'), 'error') }
}

function fillProductModal(data) {
  const product = data?.product
  currentEditingProductId = product?.id || null
  const modalTitle = $('modal-product-form')?.querySelector('.modal-title')
  if (modalTitle) modalTitle.textContent = product ? __('edit_product') : __('create_product')

  if (product) {
    if ($('modal-product-name')) $('modal-product-name').value = product.name || ''
    if ($('modal-product-price')) $('modal-product-price').value = product.price || ''
    if ($('modal-product-slug')) $('modal-product-slug').value = product.slug || ''
    if ($('modal-product-warranty')) $('modal-product-warranty').value = product.warranty_months || 0
    if ($('modal-product-desc')) $('modal-product-desc').value = product.description || ''
    if ($('modal-product-video')) $('modal-product-video').value = product.video_url || ''
    if ($('modal-product-order')) $('modal-product-order').value = product.sort_order || 0
    if ($('modal-product-active')) $('modal-product-active').checked = product.is_active !== false
    if ($('modal-product-featured')) $('modal-product-featured').checked = product.is_featured || false
    renderFeatures(product.features || [])
  } else {
    ['modal-product-name','modal-product-price','modal-product-slug','modal-product-desc','modal-product-video'].forEach(id => { const el = $(id); if (el) el.value = '' })
    if ($('modal-product-warranty')) $('modal-product-warranty').value = 0
    if ($('modal-product-order')) $('modal-product-order').value = 0
    if ($('modal-product-active')) $('modal-product-active').checked = true
    if ($('modal-product-featured')) $('modal-product-featured').checked = false
    renderFeatures([])
  }
}

function renderFeatures(features) {
  const list = $('product-features-list')
  if (!list) return
  list.innerHTML = features.map((f, i) => `
    <div class="form-inline" style="margin-bottom:8px;gap:8px;">
      <input type="text" class="form-input" value="${esc(f)}" style="flex:1" onchange="features[${i}]=this.value">
      <button type="button" class="btn btn-ghost btn-icon btn-sm" onclick="removeFeature(this)"><i class="fas fa-times" style="color:var(--error)"></i></button>
    </div>
  `).join('')
}

let features = []

function addFeature(value) {
  features.push(value || '')
  renderFeatures(features)
}

function removeFeature(btn) {
  const div = btn.closest('.form-inline')
  const idx = [...div.parentNode.children].indexOf(div)
  features.splice(idx, 1)
  renderFeatures(features)
}

function getFeatures() {
  const inputs = $('product-features-list')?.querySelectorAll('input') || []
  return [...inputs].map(i => i.value).filter(v => v.trim())
}

async function saveModalProduct() {
  const data = {
    name: $('modal-product-name')?.value,
    price: parseFloat($('modal-product-price')?.value || 0),
    slug: $('modal-product-slug')?.value || '',
    description: $('modal-product-desc')?.value || '',
    warranty_months: parseInt($('modal-product-warranty')?.value || 0),
    video_url: $('modal-product-video')?.value || '',
    sort_order: parseInt($('modal-product-order')?.value || 0),
    is_active: $('modal-product-active')?.checked || false,
    is_featured: $('modal-product-featured')?.checked || false,
    features: getFeatures()
  }
  if (!data.name || !data.price) {
    showToast('يرجى ملء اسم المنتج والسعر', 'error'); return
  }
  try {
    if (currentEditingProductId) {
      await updateProduct(currentEditingProductId, data)
    } else {
      await createProduct(data)
    }
    closeModal('modal-product-form')
    showToast(__('success_save'), 'success')
    loadProducts()
  } catch { showToast(__('error_general'), 'error') }
}
