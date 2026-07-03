const Auth = {
  _loginAttempts: [],
  _refreshTimer: null,

  init() {
    this.bindLoginForm()
    this.initAuthListener()
    this.restoreSession()
  },

  bindLoginForm() {
    const form = $('login-form')
    if (!form) return
    form.addEventListener('submit', async e => {
      e.preventDefault()
      const email = $('login-email').value.trim()
      const password = $('login-password').value
      const btn = $('login-btn')
      const errorEl = $('login-error')

      if (!this.checkRateLimit(email)) {
        errorEl.textContent = __('login_rate_limit')
        errorEl.style.display = 'block'
        return
      }

      errorEl.style.display = 'none'
      btn.disabled = true
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + __('logging_in')

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          errorEl.textContent = __('login_error')
          errorEl.style.display = 'block'
          btn.disabled = false
          btn.textContent = __('login_btn')
          return
        }
        this._loginAttempts.push({ email, time: Date.now() })
      } catch (err) {
        errorEl.textContent = __('error_network')
        errorEl.style.display = 'block'
        btn.disabled = false
        btn.textContent = __('login_btn')
      }
    })
  },

  checkRateLimit(email) {
    const now = Date.now()
    this._loginAttempts = this._loginAttempts.filter(a => now - a.time < 60000)
    const attemptsForEmail = this._loginAttempts.filter(a => a.email === email)
    return attemptsForEmail.length < 5
  },

  initAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        AppState.session = session
        this.restoreSession()
      } else if (event === 'SIGNED_OUT') {
        AppState.resetAll()
        this.showLogin()
      } else if (event === 'TOKEN_REFRESHED') {
        AppState.session = session
      }
    })
  },

  async restoreSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        this.showLogin()
        return
      }
      AppState.session = session
      const user = await this.getCurrentUser()
      if (!user) {
        await supabase.auth.signOut()
        this.showLogin()
        return
      }
      AppState.user = user
      this.showApp()
      this.startSessionRefresh()
    } catch (err) {
      this.showLogin()
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return data || user
    } catch {
      return null
    }
  },

  showLogin() {
    const layout = $('app-layout')
    const loginPage = $('page-login')
    if (layout) layout.style.display = 'none'
    if (loginPage) loginPage.classList.add('active')
  },

  showApp() {
    const layout = $('app-layout')
    const loginPage = $('page-login')
    if (loginPage) loginPage.classList.remove('active')
    if (layout) {
      layout.style.display = 'flex'
      const userNameEl = $('sidebar-user-name')
      const userRoleEl = $('sidebar-user-role')
      if (userNameEl) userNameEl.textContent = AppState.user?.full_name || AppState.user?.email || ''
      if (userRoleEl) userRoleEl.textContent = AppState.user?.role || 'Admin'
    }
    Router.handleHash()
  },

  startSessionRefresh() {
    if (this._refreshTimer) clearInterval(this._refreshTimer)
    this._refreshTimer = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
        const timeLeft = expiresAt - Date.now()
        if (timeLeft < 5 * 60 * 1000 && timeLeft > 0) {
          Toast.show( __('session_expiring') + Math.ceil(timeLeft / 60000) + ' ' + __('minutes'), 'warning')
          await supabase.auth.refreshSession()
        }
      } catch {}
    }, 10 * 60 * 1000)
  },

  async handleLogout() {
    await supabase.auth.signOut()
    AppState.resetAll()
    this.showLogin()
    Router.navigate('dashboard')
  }
}
