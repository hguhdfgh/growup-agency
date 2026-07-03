const Toast = {
  init() {
    if (!$('toast-container')) {
      const container = document.createElement('div')
      container.id = 'toast-container'
      container.className = 'toast-container'
      document.body.appendChild(container)
    }
  },

  show(message, type) {
    type = type || 'info'
    const container = $('toast-container')
    if (!container) return

    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    }

    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`
    container.appendChild(toast)

    requestAnimationFrame(() => toast.classList.add('toast-visible'))

    setTimeout(() => {
      toast.classList.remove('toast-visible')
      toast.classList.add('toast-hiding')
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }
}

Toast.init()
