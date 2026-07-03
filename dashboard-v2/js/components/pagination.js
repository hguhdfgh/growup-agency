const Pagination = {
  render(containerId, { currentPage, total, perPage, onChange }) {
    const container = $(containerId)
    if (!container) return
    const totalPages = Math.ceil(total / perPage) || 1
    if (totalPages <= 1) { container.innerHTML = ''; return }

    let html = '<div class="pagination">'
    html += `<button class="btn btn-ghost pagination-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`

    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, currentPage + 2)
    if (start > 1) { html += '<button class="btn btn-ghost pagination-btn" data-page="1">1</button><span class="pagination-dots">...</span>' }
    for (let i = start; i <= end; i++) {
      html += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-ghost'} pagination-btn" data-page="${i}">${i}</button>`
    }
    if (end < totalPages) { html += '<span class="pagination-dots">...</span>' + `<button class="btn btn-ghost pagination-btn" data-page="${totalPages}">${totalPages}</button>` }
    html += `<button class="btn btn-ghost pagination-btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`
    html += '</div>'
    container.innerHTML = html

    container.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return
        const page = parseInt(btn.dataset.page)
        if (typeof onChange === 'function') onChange(page)
      })
    })
  }
}
