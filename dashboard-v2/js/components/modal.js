const Modal = {
  open(id, data) {
    const modal = $(id)
    if (!modal) return
    modal.classList.add('modal-open')
    if (data && data.onSave) {
      modal._onSave = data.onSave
    }
    const closeBtn = modal.querySelector('.modal-close, .btn-cancel')
    if (closeBtn) {
      closeBtn.onclick = () => Modal.close(id)
    }
    modal.querySelector('.modal-overlay')?.addEventListener('click', () => Modal.close(id))
    document.addEventListener('keydown', Modal._escHandler = e => {
      if (e.key === 'Escape') Modal.close(id)
    })
  },

  close(id) {
    const modal = $(id)
    if (modal) modal.classList.remove('modal-open')
    if (Modal._escHandler) document.removeEventListener('keydown', Modal._escHandler)
  },

  closeAll() {
    qa('.modal-overlay').forEach(m => m.classList.remove('modal-open'))
  }
}

function openModal(id, data) {
  Modal.open(id, data)
}

function closeModal(id) {
  Modal.close(id)
}

function closeAllModals() {
  Modal.closeAll()
}

function showConfirm(msg, onConfirm) {
  const el = $('modal-confirm')
  if (!el) return
  const msgEl = $('modal-confirm-message')
  if (msgEl) msgEl.textContent = msg
  const confirmBtn = el.querySelector('.btn-confirm')
  const cancelBtn = el.querySelector('.btn-cancel')
  const saveHandler = () => {
    if (typeof onConfirm === 'function') onConfirm()
    Modal.close('modal-confirm')
    confirmBtn?.removeEventListener('click', saveHandler)
  }
  confirmBtn?.addEventListener('click', saveHandler)
  cancelBtn?.addEventListener('click', () => Modal.close('modal-confirm'))
  Modal.open('modal-confirm')
}
