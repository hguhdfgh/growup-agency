var AppState = {
  user: null,
  session: null,
  settings: null,
  pages: {},
  currentPage: 'dashboard',
  currentParams: {},
  pagination: {
    orders: { page: 1, total: 0, perPage: 20 },
    customers: { page: 1, total: 0, perPage: 20 },
    reviews: { page: 1, total: 0, perPage: 20 },
    tickets: { page: 1, total: 0, perPage: 20 },
    activity: { page: 1, total: 0, perPage: 20 }
  },
  errors: [],
  subscriptions: [],
  filters: {
    orders: { status: '', search: '' },
    customers: { search: '', status: '', source: '' },
    reviews: { status: '', rating: '' },
    tickets: { status: '', priority: '' },
    activity: { actorType: '', action: '' }
  }
}

AppState.resetPageState = function(page) {
  this.pages[page] = null
  if (this.pagination[page]) {
    this.pagination[page].page = 1
    this.pagination[page].total = 0
  }
}

AppState.resetAll = function() {
  this.user = null
  this.session = null
  this.settings = null
  this.pages = {}
  this.currentPage = 'dashboard'
  this.currentParams = {}
  this.errors = []
  for (const key in this.pagination) {
    this.pagination[key].page = 1
    this.pagination[key].total = 0
  }
  for (const key in this.filters) {
    this.filters[key] = { status: '', search: '' }
  }
}
