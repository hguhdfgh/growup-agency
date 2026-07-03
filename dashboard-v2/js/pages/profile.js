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
        await supabase.from('profiles').update(data).eq('id', user.id)
        AppState.user.full_name = data.full_name
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
    const ext = file.name.split('.').pop()
    const path = `avatar_${AppState.user.id}_${Date.now()}.${ext}`
    const { path: savedPath } = await uploadFile('avatars', file, path)
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(savedPath)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', AppState.user.id)
    AppState.user.avatar_url = publicUrl
    loadProfile()
    showToast(__('success_save'), 'success')
  } catch { showToast(__('error_general'), 'error') }
}
