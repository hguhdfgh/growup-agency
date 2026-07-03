async function loadProfile() {
  AppState.currentPage = 'profile'
  const user = AppState.user
  if (!user) return

  if ($('profile-avatar-preview')) {
    $('profile-avatar-preview').textContent = (user.full_name || user.email || 'A')[0].toUpperCase()
    if (user.avatar_url) {
      $('profile-avatar-preview').style.backgroundImage = `url(${user.avatar_url})`
      $('profile-avatar-preview').style.backgroundSize = 'cover'
      $('profile-avatar-preview').textContent = ''
    }
  }
  if ($('profile-name')) $('profile-name').value = user.full_name || ''
  if ($('profile-email')) $('profile-email').value = user.email || ''
  if ($('profile-phone')) $('profile-phone').value = user.phone || ''

  const profileForm = $('profile-form')
  if (profileForm) {
    profileForm.onsubmit = async (e) => {
      e.preventDefault()
      const data = {
        full_name: $('profile-name')?.value,
        email: $('profile-email')?.value,
        phone: $('profile-phone')?.value || ''
      }
      try {
        await updateCustomer(user.id, data)
        if ($('sidebar-user-name')) $('sidebar-user-name').textContent = data.full_name || data.email
        showToast(__('success_save'), 'success')
      } catch { showToast(__('error_general'), 'error') }
    }
  }

  const passwordForm = $('password-form')
  if (passwordForm) {
    passwordForm.onsubmit = async (e) => {
      e.preventDefault()
      const currentPw = $('password-current')?.value
      const newPw = $('password-new')?.value
      if (!currentPw || !newPw) {
        showToast('يرجى ملء جميع الحقول', 'error'); return
      }
      if (newPw.length < 6) {
        showToast('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل', 'error'); return
      }
      try {
        const { error } = await supabase.auth.updateUser({ password: newPw })
        if (error) { showToast(error.message, 'error'); return }
        showToast('تم تغيير كلمة المرور بنجاح', 'success')
        $('password-current').value = ''
        $('password-new').value = ''
      } catch { showToast(__('error_general'), 'error') }
    }
  }
}

async function uploadAvatar(file) {
  if (!file) return
  try {
    const { path } = await uploadFile('avatars', file, `avatar_${AppState.user.id}_${Date.now()}.${file.name.split('.').pop()}`)
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await updateCustomer(AppState.user.id, { avatar_url: publicUrl })
    AppState.user.avatar_url = publicUrl
    loadProfile()
    showToast(__('success_save'), 'success')
  } catch { showToast(__('error_general'), 'error') }
}
