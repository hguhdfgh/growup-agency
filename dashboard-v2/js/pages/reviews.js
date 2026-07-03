let currentEditingReviewId = null

async function loadReviews() {
  AppState.resetPageState('reviews')
  AppState.currentPage = 'reviews'
  const filters = AppState.filters.reviews
  const pag = AppState.pagination.reviews
  const { data, count, error } = await getReviews({
    status: filters.status,
    rating: filters.rating,
    page: pag.page,
    perPage: pag.perPage
  })
  if (error) { showToast(__('error_general'), 'error'); return }
  pag.total = count || 0
  renderReviewsTable(data || [])
  Pagination.render('reviews-pagination', { currentPage: pag.page, total: pag.total, perPage: pag.perPage, onChange: goReviewsPage })

  const statusFilter = $('reviews-status-filter')
  if (statusFilter) {
    statusFilter.value = filters.status
    statusFilter.onchange = () => {
      AppState.filters.reviews.status = statusFilter.value
      AppState.pagination.reviews.page = 1
      loadReviews()
    }
  }
  const ratingFilter = $('reviews-rating-filter')
  if (ratingFilter) {
    ratingFilter.value = filters.rating
    ratingFilter.onchange = () => {
      AppState.filters.reviews.rating = ratingFilter.value
      AppState.pagination.reviews.page = 1
      loadReviews()
    }
  }
}

function renderStarRating(rating) {
  return Array(5).fill(0).map((_, i) => `<i class="fas fa-star" style="color:${i < rating ? 'var(--warning)' : 'var(--border-color)'};font-size:0.85rem;"></i>`).join('')
}

function renderReviewsTable(reviews) {
  const tbody = $('reviews-body')
  if (!reviews.length) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>' + __('no_data') + '</p></div></td></tr>'
    return
  }
  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td><input type="checkbox" class="review-check" value="${r.id}" onchange="updateReviewsBatchBar()"></td>
      <td>${esc(r.customer_name || '')}</td>
      <td>${renderStarRating(r.rating || 0)}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(r.review_text || '-')}</td>
      <td>${r.is_approved ? statusBadge('approved') : statusBadge('rejected')}</td>
      <td>${r.is_pinned ? '<span style="color:var(--warning)"><i class="fas fa-thumbtack"></i></span>' : '-'}</td>
      <td>${fmtDateShort(r.created_at)}</td>
      <td class="actions">
        ${!r.is_approved ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="approveReviewAction('${r.id}')" title="قبول"><i class="fas fa-check" style="color:var(--success)"></i></button>` : ''}
        <button class="btn btn-ghost btn-icon btn-sm" onclick="pinReviewAction('${r.id}')" title="تثبيت"><i class="fas fa-thumbtack" style="color:${r.is_pinned ? 'var(--warning)' : 'var(--text-muted)'}"></i></button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="showConfirm('${__('confirm_delete')}', () => deleteReviewAction('${r.id}'))" title="حذف"><i class="fas fa-trash" style="color:var(--error)"></i></button>
      </td>
    </tr>
  `).join('')
}

function goReviewsPage(page) {
  AppState.pagination.reviews.page = page
  loadReviews()
}

async function approveReviewAction(id) {
  try {
    await approveReview(id)
    showToast(__('success_save'), 'success')
    loadReviews()
  } catch { showToast(__('error_general'), 'error') }
}

async function pinReviewAction(id) {
  try {
    await togglePinReview(id)
    loadReviews()
  } catch { showToast(__('error_general'), 'error') }
}

async function deleteReviewAction(id) {
  try {
    await deleteReview(id)
    showToast(__('success_delete'), 'success')
    loadReviews()
  } catch { showToast(__('error_general'), 'error') }
}

function toggleAllReviews(checked) {
  qa('.review-check').forEach(cb => cb.checked = checked)
  updateReviewsBatchBar()
}

function updateReviewsBatchBar() {
  const checked = qa('.review-check:checked')
  const bar = $('reviews-batch-bar')
  const count = $('reviews-selected-count')
  if (count) count.textContent = checked.length + ' ' + __('selected')
  if (bar) bar.classList.toggle('active', checked.length > 0)
}

async function batchApproveReviews() {
  const ids = [...qa('.review-check:checked')].map(cb => cb.value)
  for (const id of ids) { try { await approveReview(id) } catch {} }
  showToast(__('success_save'), 'success')
  loadReviews()
}

async function batchPinReviews() {
  const ids = [...qa('.review-check:checked')].map(cb => cb.value)
  for (const id of ids) { try { await togglePinReview(id) } catch {} }
  loadReviews()
}

async function batchDeleteReviews() {
  const ids = [...qa('.review-check:checked')].map(cb => cb.value)
  showConfirm(__('confirm_action'), async () => {
    for (const id of ids) { try { await deleteReview(id) } catch {} }
    showToast(__('success_delete'), 'success')
    loadReviews()
  })
}

function fillReviewModal(data) {
  const review = data?.review
  currentEditingReviewId = review?.id || null
  if (review) {
    if ($('modal-review-name')) $('modal-review-name').value = review.customer_name || ''
    if ($('modal-review-rating')) $('modal-review-rating').value = review.rating || 5
    if ($('modal-review-text')) $('modal-review-text').value = review.review_text || ''
  } else {
    if ($('modal-review-name')) $('modal-review-name').value = ''
    if ($('modal-review-rating')) $('modal-review-rating').value = '5'
    if ($('modal-review-text')) $('modal-review-text').value = ''
  }
}

async function saveModalReview() {
  const data = {
    customer_name: $('modal-review-name')?.value,
    rating: parseInt($('modal-review-rating')?.value || 5),
    review_text: $('modal-review-text')?.value
  }
  if (!data.customer_name || !data.review_text) {
    showToast('يرجى ملء الاسم ونص التقييم', 'error'); return
  }
  try {
    if (currentEditingReviewId) {
      await updateReview(currentEditingReviewId, data)
    } else {
      await createReview(data)
    }
    closeModal('modal-review-form')
    showToast(__('success_save'), 'success')
    loadReviews()
  } catch { showToast(__('error_general'), 'error') }
}
