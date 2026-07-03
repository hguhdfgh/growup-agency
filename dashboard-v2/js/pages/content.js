async function loadContent() {
  AppState.currentPage = 'content'
  const sections = ['hero', 'features', 'stats', 'about']
  for (const section of sections) {
    try {
      const { data } = await getLandingContent(section)
      const content = data?.content || {}
      const container = $(`content-${section}`)
      if (!container) continue

      container.innerHTML = `
        <div class="form-group"><label class="form-label">${__('section_title')}</label>
          <input type="text" class="form-input content-field" data-section="${section}" data-field="title" value="${esc(content.title || '')}"></div>
        <div class="form-group"><label class="form-label">${__('section_subtitle')}</label>
          <input type="text" class="form-input content-field" data-section="${section}" data-field="subtitle" value="${esc(content.subtitle || '')}"></div>
        <div class="form-group"><label class="form-label">${__('section_content')}</label>
          <textarea class="form-textarea content-field" data-section="${section}" data-field="content" style="min-height:100px">${esc(content.content || content.text || '')}</textarea></div>
        <button class="btn btn-primary btn-sm" onclick="saveContentSection('${section}')"><i class="fas fa-save"></i> ${__('save')}</button>
      `
    } catch {}
  }
}

async function saveContentSection(section) {
  const fields = document.querySelectorAll(`.content-field[data-section="${section}"]`)
  const content = {}
  fields.forEach(f => { content[f.dataset.field] = f.value })
  try {
    await updateLandingContent(section, content)
    showToast(__('success_save'), 'success')
  } catch { showToast(__('error_general'), 'error') }
}
