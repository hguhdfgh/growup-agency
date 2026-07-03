async function loadSettings() {
  AppState.currentPage = 'settings'
  try {
    const { data, error } = await getSettings()
    if (error) { showToast(__('error_general'), 'error'); return }
    if (data) {
      if ($('settings-company-name')) $('settings-company-name').value = data.company_name || ''
      if ($('settings-phone')) $('settings-phone').value = data.phone || ''
      if ($('settings-whatsapp')) $('settings-whatsapp').value = data.whatsapp || ''
      if ($('settings-email')) $('settings-email').value = data.email || ''
      if ($('settings-address')) $('settings-address').value = data.address || ''
      if (data.payment_accounts) {
        if ($('settings-baridimob')) $('settings-baridimob').value = data.payment_accounts.baridimob?.account || data.payment_accounts.baridimob || ''
        if ($('settings-ccp')) $('settings-ccp').value = data.payment_accounts.ccp?.account || data.payment_accounts.ccp || ''
        if ($('settings-bank')) $('settings-bank').value = data.payment_accounts.bank?.account || data.payment_accounts.bank || ''
      }
    }
  } catch {}

  const generalForm = $('settings-general-form')
  if (generalForm) {
    generalForm.onsubmit = async (e) => {
      e.preventDefault()
      const data = {
        company_name: $('settings-company-name')?.value,
        phone: $('settings-phone')?.value,
        whatsapp: $('settings-whatsapp')?.value,
        email: $('settings-email')?.value,
        address: $('settings-address')?.value
      }
      try {
        await updateSettings(data)
        showToast(__('success_save'), 'success')
      } catch { showToast(__('error_general'), 'error') }
    }
  }

  const paymentForm = $('settings-payment-form')
  if (paymentForm) {
    paymentForm.onsubmit = async (e) => {
      e.preventDefault()
      const paymentAccounts = {
        baridimob: { label: 'بريدي موب', account: $('settings-baridimob')?.value || '' },
        ccp: { label: 'CCP', account: $('settings-ccp')?.value || '' },
        bank: { label: 'تحويل بنكي', account: $('settings-bank')?.value || '' }
      }
      try {
        await updateSettings({ payment_accounts: paymentAccounts })
        showToast(__('success_save'), 'success')
      } catch { showToast(__('error_general'), 'error') }
    }
  }
}
