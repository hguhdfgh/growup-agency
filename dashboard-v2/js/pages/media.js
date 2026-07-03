async function loadMedia() {
  AppState.currentPage = 'media'
  try {
    const { data, error } = await listFiles('media')
    if (error) { showToast(__('error_general'), 'error'); return }
    const grid = $('media-grid')
    if (!data?.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-images"></i><p>' + __('no_files') + '</p></div>'
      return
    }
    const items = await Promise.all(data.map(async (file) => {
      try {
        const url = await getFileUrl('media', file.name)
        const isImage = file.metadata?.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
        return { name: file.name, url, isImage, created_at: file.created_at }
      } catch { return null }
    }))
    grid.innerHTML = items.filter(Boolean).map(f => `
      <div class="media-item">
        ${f.isImage ? `<img src="${f.url}" alt="${esc(f.name)}" loading="lazy">` : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:var(--bg-card);color:var(--text-muted);font-size:2rem;"><i class="fas fa-file"></i></div>`}
        <div class="media-item-overlay">
          <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(f.name)}</div>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="showConfirm('${__('confirm_delete')}', () => deleteMediaAction('${esc(f.name)}'))" style="color:var(--error);padding:2px;font-size:0.7rem;"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `).join('')
  } catch { showToast(__('error_general'), 'error') }
}

async function uploadMediaFiles(files) {
  if (!files?.length) return
  showToast('جاري الرفع...', 'info')
  for (const file of files) {
    try {
      const path = `uploads/${Date.now()}_${file.name}`
      await uploadFile('media', file, path)
    } catch { showToast(`فشل رفع: ${file.name}`, 'error') }
  }
  showToast(__('success_save'), 'success')
  loadMedia()
  document.getElementById('media-upload-input').value = ''
}

async function deleteMediaAction(name) {
  try {
    await deleteFile('media', name)
    showToast(__('success_delete'), 'success')
    loadMedia()
  } catch { showToast(__('error_general'), 'error') }
}
