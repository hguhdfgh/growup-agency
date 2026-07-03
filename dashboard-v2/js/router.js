const Router = {
  routes: {
    dashboard: { page: 'page-dashboard', load: 'loadDashboard' },
    orders: { page: 'page-orders', load: 'loadOrders' },
    'order-detail': { page: 'page-order-detail', load: 'loadOrderDetail', params: true },
    customers: { page: 'page-customers', load: 'loadCustomers' },
    'customer-detail': { page: 'page-customer-detail', load: 'loadCustomerDetail', params: true },
    products: { page: 'page-products', load: 'loadProducts' },
    reviews: { page: 'page-reviews', load: 'loadReviews' },
    faq: { page: 'page-faq', load: 'loadFaq' },
    tickets: { page: 'page-tickets', load: 'loadTickets' },
    'ticket-detail': { page: 'page-ticket-detail', load: 'loadTicketDetail', params: true },
    abandoned: { page: 'page-abandoned', load: 'loadAbandoned' },
    notifications: { page: 'page-notifications', load: 'loadNotifications' },
    analytics: { page: 'page-analytics', load: 'loadAnalytics' },
    coupons: { page: 'page-coupons', load: 'loadCoupons' },
    content: { page: 'page-content', load: 'loadContent' },
    activity: { page: 'page-activity', load: 'loadActivity' },
    media: { page: 'page-media', load: 'loadMedia' },
    settings: { page: 'page-settings', load: 'loadSettings' },
    profile: { page: 'page-profile', load: 'loadProfile' }
  },

  init() {
    window.addEventListener('hashchange', () => this.handleHash())
    document.addEventListener('click', e => {
      const link = e.target.closest('[data-nav]')
      if (link) {
        e.preventDefault()
        const page = link.dataset.nav
        const params = link.dataset.params ? JSON.parse(link.dataset.params) : {}
        this.navigate(page, params)
      }
    })
  },

  handleHash() {
    const hash = location.hash.replace('#', '')
    if (!hash) { this.navigate('dashboard'); return }
    const parts = hash.split('/')
    const routeName = parts[0]
    const id = parts[1]
    if (this.routes[routeName]) {
      this.navigate(routeName, id ? { id } : {})
    } else {
      this.navigate('dashboard')
    }
  },

  navigate(page, params) {
    params = params || {}
    const route = this.routes[page]
    if (!route) { this.navigate('dashboard'); return }

    AppState.currentPage = page
    AppState.currentParams = params

    qa('.page').forEach(p => p.classList.remove('active'))
    qa('.nav-item').forEach(n => n.classList.remove('active'))

    const pageEl = $(route.page)
    if (pageEl) pageEl.classList.add('active')

    if (route.params && params.id) {
      const navItem = q(`[data-nav="${page}"]`)
      if (navItem) navItem.classList.add('active')
    } else {
      const navItem = q(`[data-nav="${page}"]`)
      if (navItem) navItem.classList.add('active')
    }

    if (page === 'dashboard') {
      const dashNav = q('[data-nav="dashboard"]')
      if (dashNav) dashNav.classList.add('active')
    }

    const loadFn = window[route.load]
    if (typeof loadFn === 'function') {
      loadFn(params)
    }

    const newHash = params.id ? `${page}/${params.id}` : page
    if (location.hash !== `#${newHash}`) {
      history.pushState(null, '', `#${newHash}`)
    }
  }
}
