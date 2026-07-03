let currentEditingCouponId = null

async function loadCoupons() {
  AppState.currentPage = 'coupons'
  const { data, error } = await getCoupons()
  if (error) { showToast(__('error_general'), 'error'); return }
  const tbody = $('coupons-body')
  if (!data?.length) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>' + __('no_data') + '</p></div></td></tr>'
    return
  }
  tbody.innerHTML = data.map(c => {
    const isExpired = c.expires_at && new Date(c.expires_at) < new Date()
    const isMaxed = c.max_uses && c.used_count >= c.max_uses
    const isActive = c.is_active && !isExpired && !isMaxed
    return `
    <tr>
      <td style="font-weight:600;direction:ltr;text-align:right;">${esc(c.code)}</td>
      <td>${c.discount_type === 'percentage' ? __('percentage') : __('fixed')}</td>
      <td>${c.discount_type === 'percentage' ? c.discount_value + '%' : fmtCurr(c.discount_value)}</td>
      <td>${c.max_uses || '∞'}</td>
      <td>${c.used_count || 0}</td>
      <td>${c.expires_at ? fmtDateShort(c.expires_at) : '-'}</td>
      <td>${isActive ? '<span style="color:var(--success)">نشط</span>' : '<span style="color:var(--text-muted)">غير نشط</span>'}</td>
      <td class="actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('modal-coupon-form', {id: '${c.id}'})" title="تعديل"><i class="fas fa-edit"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="showConfirm('${__('confirm_delete')}', () => deleteCouponAction('${c.id}'))" title="حذف"><i class="fas fa-trash" style="color:var(--error)"></i></button>
      </td>
    </tr>`
  }).join('')
}

async function deleteCouponAction(id) {
  try {
    await deleteCoupon(id)
    showToast(__('success_delete'), 'success')
    loadCoupons()
  } catch { showToast(__('error_general'), 'error') }
}

function fillCouponModal(data) {
  const coupon = data?.coupon
  currentEditingCouponId = coupon?.id || null
  const modalTitle = $('modal-coupon-form')?.querySelector('.modal-title')
  if (modalTitle) modalTitle.textContent = coupon ? __('edit_coupon') : __('create_coupon')
  if (coupon) {
    if ($('modal-coupon-code')) $('modal-coupon-code').value = coupon.code || ''
    if ($('modal-coupon-type')) $('modal-coupon-type').value = coupon.discount_type || 'percentage'
    if ($('modal-coupon-discount')) $('modal-coupon-discount').value = coupon.discount_value || ''
    if ($('modal-coupon-max-uses')) $('modal-coupon-max-uses').value = coupon.max_uses || 100
    if ($('modal-coupon-expiry')) {
      const d = coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : ''
      $('modal-coupon-expiry').value = d
    }
  } else {
    if ($('modal-coupon-code')) $('modal-coupon-code').value = ''
    if ($('modal-coupon-type')) $('modal-coupon-type').value = 'percentage'
    if ($('modal-coupon-discount')) $('modal-coupon-discount').value = ''
    if ($('modal-coupon-max-uses')) $('modal-coupon-max-uses').value = 100
    if ($('modal-coupon-expiry')) $('modal-coupon-expiry').value = ''
  }
}

async function saveModalCoupon() {
  const data = {
    code: $('modal-coupon-code')?.value,
    discount_type: $('modal-coupon-type')?.value,
    discount_value: parseFloat($('modal-coupon-discount')?.value || 0),
    max_uses: parseInt($('modal-coupon-max-uses')?.value || 100),
    expires_at: $('modal-coupon-expiry')?.value || null
  }
  if (!data.code || !data.discount_value) {
    showToast('يرجى ملء الكود وقيمة الخصم', 'error'); return
  }
  try {
    if (currentEditingCouponId) {
      await updateCoupon(currentEditingCouponId, data)
    } else {
      await createCoupon(data)
    }
    closeModal('modal-coupon-form')
    showToast(__('success_save'), 'success')
    loadCoupons()
  } catch { showToast(__('error_general'), 'error') }
}
