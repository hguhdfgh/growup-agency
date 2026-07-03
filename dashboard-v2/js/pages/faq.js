let currentEditingFaqId = null

async function loadFaq() {
  AppState.currentPage = 'faq'
  const { data, error } = await getFaqs()
  if (error) { showToast(__('error_general'), 'error'); return }
  const container = $('faq-list')
  if (!data?.length) {
    container.innerHTML = '<div class="empty-state"><p>' + __('no_data') + '</p></div>'
    return
  }
  container.innerHTML = data.map((f, i) => `
    <div class="card" style="margin-bottom:12px;cursor:grab;" draggable="true" data-id="${f.id}" ondragstart="faqDragStart(event)" ondragover="faqDragOver(event)" ondrop="faqDrop(event)" ondragend="faqDragEnd(event)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="flex:1;">
          <div style="font-weight:600;margin-bottom:4px;">${esc(f.question)}</div>
          <div style="font-size:0.85rem;color:var(--text-secondary);">${esc(f.answer)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${esc(f.category || 'general')} - ترتيب: ${f.sort_order || 0} ${!f.is_active ? '(غير نشط)' : ''}</div>
        </div>
        <div class="actions" style="flex-shrink:0;">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openModal('modal-faq-form', {id: '${f.id}'})" title="تعديل"><i class="fas fa-edit"></i></button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="showConfirm('${__('confirm_delete')}', () => deleteFaqAction('${f.id}'))" title="حذف"><i class="fas fa-trash" style="color:var(--error)"></i></button>
        </div>
      </div>
    </div>
  `).join('')

  const categoryInput = $('faq-category-filter')
  if (categoryInput) {
    categoryInput.oninput = debounce(() => {
      const val = categoryInput.value.toLowerCase()
      container.querySelectorAll('.card').forEach(card => {
        const text = card.textContent.toLowerCase()
        card.style.display = val ? (text.includes(val) ? '' : 'none') : ''
      })
    }, 300)
  }
}

let draggedFaqId = null

function faqDragStart(e) {
  draggedFaqId = e.target.closest('.card')?.dataset?.id
  e.target.style.opacity = '0.5'
}

function faqDragOver(e) {
  e.preventDefault()
  const card = e.target.closest('.card')
  if (card) card.style.borderColor = 'var(--primary)'
}

function faqDrop(e) {
  e.preventDefault()
  const targetCard = e.target.closest('.card')
  if (!targetCard || !draggedFaqId) return
  const sourceCard = document.querySelector(`.card[data-id="${draggedFaqId}"]`)
  if (sourceCard && sourceCard !== targetCard) {
    const parent = targetCard.parentNode
    const siblings = [...parent.querySelectorAll('.card')]
    const targetIdx = siblings.indexOf(targetCard)
    const sourceIdx = siblings.indexOf(sourceCard)
    if (sourceIdx < targetIdx) {
      targetCard.after(sourceCard)
    } else {
      targetCard.before(sourceCard)
    }
    saveFaqOrder()
  }
  document.querySelectorAll('.card').forEach(c => c.style.borderColor = '')
  draggedFaqId = null
}

function faqDragEnd(e) {
  e.target.style.opacity = '1'
  document.querySelectorAll('.card').forEach(c => c.style.borderColor = '')
}

async function saveFaqOrder() {
  const ids = [...document.querySelectorAll('#faq-list .card')].map(c => c.dataset.id)
  try {
    await reorderFaq(ids)
  } catch {}
}

async function deleteFaqAction(id) {
  try {
    await deleteFaq(id)
    showToast(__('success_delete'), 'success')
    loadFaq()
  } catch { showToast(__('error_general'), 'error') }
}

function fillFaqModal(data) {
  const faq = data?.faq
  currentEditingFaqId = faq?.id || null
  const modalTitle = $('modal-faq-form')?.querySelector('.modal-title')
  if (modalTitle) modalTitle.textContent = faq ? __('edit_faq') : __('create_faq')
  if (faq) {
    if ($('modal-faq-question')) $('modal-faq-question').value = faq.question || ''
    if ($('modal-faq-answer')) $('modal-faq-answer').value = faq.answer || ''
    if ($('modal-faq-category')) $('modal-faq-category').value = faq.category || 'general'
    if ($('modal-faq-order')) $('modal-faq-order').value = faq.sort_order || 0
  } else {
    if ($('modal-faq-question')) $('modal-faq-question').value = ''
    if ($('modal-faq-answer')) $('modal-faq-answer').value = ''
    if ($('modal-faq-category')) $('modal-faq-category').value = 'general'
    if ($('modal-faq-order')) $('modal-faq-order').value = 0
  }
}

async function saveModalFaq() {
  const data = {
    question: $('modal-faq-question')?.value,
    answer: $('modal-faq-answer')?.value,
    category: $('modal-faq-category')?.value || 'general',
    sort_order: parseInt($('modal-faq-order')?.value || 0)
  }
  if (!data.question || !data.answer) {
    showToast('يرجى ملء السؤال والإجابة', 'error'); return
  }
  try {
    if (currentEditingFaqId) {
      await updateFaq(currentEditingFaqId, data)
    } else {
      await createFaq(data)
    }
    closeModal('modal-faq-form')
    showToast(__('success_save'), 'success')
    loadFaq()
  } catch { showToast(__('error_general'), 'error') }
}
