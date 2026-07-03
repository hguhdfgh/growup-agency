// ===================== AUTH & PROFILES =====================

async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

async function signOut() {
  return supabase.auth.signOut()
}

async function getSession() {
  return supabase.auth.getSession()
}

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data || user
}

async function getProfiles() {
  return supabase.from('profiles').select('*').in('role', ['admin', 'support']).order('full_name', { ascending: true })
}

// ===================== ORDERS =====================

async function getOrders(filters = {}) {
  let query = supabase.from('orders').select('*, customers(full_name, email, phone), products(name, price)', { count: 'exact' })
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.search) query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`)
  if (filters.customerId) query = query.eq('customer_id', filters.customerId)
  query = query.order('created_at', { ascending: false })
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function getOrder(id) {
  return supabase.from('orders').select('*, customers(*), products(*)').eq('id', id).single()
}

async function createOrder(data) {
  const dateStr = new Date().toISOString().split('T')[0]
  const { data: seqData } = await supabase.from('order_sequences').upsert({ date: dateStr }, { onConflict: 'date' }).select().single()
  let nextSeq = 1
  if (seqData?.sequence) nextSeq = seqData.sequence + 1
  await supabase.rpc('increment_sequence', { row_date: dateStr })
  const year = new Date().getFullYear()
  const orderNum = `ORD-${year}-${String(nextSeq).padStart(4, '0')}`
  return supabase.from('orders').insert({
    order_number: orderNum,
    customer_id: data.customer_id,
    product_id: data.product_id,
    customer_name: data.customer_name || '',
    email: data.email || '',
    phone: data.phone || '',
    amount: data.amount,
    payment_method: data.payment_method || 'baridimob',
    payment_proof_url: data.payment_proof_url || '',
    status: data.status || 'pending',
    notes: data.notes || '',
    admin_notes: data.admin_notes || ''
  }).select().single()
}

async function updateOrder(id, data) {
  return supabase.from('orders').update({
    ...data,
    updated_at: new Date().toISOString()
  }).eq('id', id).select().single()
}

async function deleteOrder(id) {
  return supabase.from('orders').delete().eq('id', id).select().single()
}

async function approveOrder(id) {
  return supabase.from('orders').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id).select().single()
}

async function rejectOrder(id) {
  return supabase.from('orders').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', id).select().single()
}

async function getRecentOrders(limit = 5) {
  return supabase.from('orders').select('*, customers(full_name, email), products(name)').order('created_at', { ascending: false }).limit(limit)
}

// ===================== ORDER TIMELINE =====================

async function getOrderTimeline(orderId) {
  return supabase.from('order_timeline').select('*').eq('order_id', orderId).order('created_at', { ascending: false })
}

async function addTimelineEntry(orderId, action, description, performedBy) {
  return supabase.from('order_timeline').insert({
    order_id: orderId,
    action,
    description,
    performed_by: performedBy || null
  }).select().single()
}

// ===================== CUSTOMERS =====================

async function getCustomers(filters = {}) {
  let query = supabase.from('customers').select('*', { count: 'exact' })
  if (filters.search) query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status)
  if (filters.source) query = query.eq('source', filters.source)
  query = query.order('created_at', { ascending: false })
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function getCustomer(id) {
  return supabase.from('customers').select('*').eq('id', id).single()
}

async function getCustomerOrders(customerId) {
  return supabase.from('orders').select('*, products(name)').eq('customer_id', customerId).order('created_at', { ascending: false })
}

async function createCustomer(data) {
  return supabase.from('customers').insert({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || '',
    country: data.country || '',
    city: data.city || '',
    notes: data.notes || '',
    source: data.source || 'direct',
    status: data.status || 'active'
  }).select().single()
}

async function updateCustomer(id, data) {
  return supabase.from('customers').update({
    ...data,
    updated_at: new Date().toISOString()
  }).eq('id', id).select().single()
}

async function deleteCustomer(id) {
  return supabase.from('customers').update({
    status: 'deleted',
    deleted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', id).select().single()
}

async function hardDeleteCustomer(id) {
  const { error: orderErr } = await supabase.from('orders').delete().eq('customer_id', id)
  if (orderErr) throw orderErr
  return supabase.from('customers').delete().eq('id', id)
}

// ===================== PRODUCTS =====================

async function getProducts(filters = {}) {
  let query = supabase.from('products').select('*', { count: 'exact' })
  if (filters.activeOnly) query = query.eq('is_active', true)
  query = query.order('sort_order', { ascending: true }).order('name', { ascending: true })
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function getProduct(id) {
  return supabase.from('products').select('*').eq('id', id).single()
}

async function createProduct(data) {
  return supabase.from('products').insert({
    name: data.name,
    slug: data.slug || '',
    description: data.description || '',
    price: data.price,
    warranty_months: data.warranty_months || 0,
    images: data.images || [],
    video_url: data.video_url || '',
    features: data.features || null,
    is_active: data.is_active !== undefined ? data.is_active : true,
    is_featured: data.is_featured || false,
    sort_order: data.sort_order || 0
  }).select().single()
}

async function updateProduct(id, data) {
  return supabase.from('products').update({
    ...data,
    updated_at: new Date().toISOString()
  }).eq('id', id).select().single()
}

async function deleteProduct(id) {
  return supabase.from('products').update({
    is_active: false,
    updated_at: new Date().toISOString()
  }).eq('id', id).select().single()
}

// ===================== REVIEWS =====================

async function getReviews(filters = {}) {
  let query = supabase.from('reviews').select('*', { count: 'exact' })
  if (filters.status === 'approved') query = query.eq('is_approved', true)
  if (filters.status === 'rejected') query = query.eq('is_approved', false)
  if (filters.productId) query = query.eq('product_id', filters.productId)
  if (filters.rating) query = query.eq('rating', filters.rating)
  query = query.order('created_at', { ascending: false })
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function createReview(data) {
  return supabase.from('reviews').insert({
    customer_name: data.customer_name || '',
    customer_city: data.customer_city || '',
    customer_avatar: data.customer_avatar || '',
    rating: data.rating,
    review_text: data.review_text || '',
    is_approved: data.is_approved || false,
    order_number: data.order_number || ''
  }).select().single()
}

async function updateReview(id, data) {
  return supabase.from('reviews').update(data).eq('id', id).select().single()
}

async function deleteReview(id) {
  return supabase.from('reviews').delete().eq('id', id).select().single()
}

async function approveReview(id) {
  return supabase.from('reviews').update({ is_approved: true, updated_at: new Date().toISOString() }).eq('id', id).select().single()
}

async function togglePinReview(id) {
  const { data } = await supabase.from('reviews').select('is_pinned').eq('id', id).single()
  return supabase.from('reviews').update({ is_pinned: !data?.is_pinned, updated_at: new Date().toISOString() }).eq('id', id).select().single()
}

// ===================== FAQ =====================

async function getFaqs(filters = {}) {
  let query = supabase.from('faq').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
  if (filters.activeOnly) query = query.eq('is_active', true)
  if (filters.category) query = query.eq('category', filters.category)
  return query
}

async function createFaq(data) {
  const { data: maxData } = await supabase.from('faq').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const maxOrder = maxData?.[0]?.sort_order || 0
  return supabase.from('faq').insert({
    question: data.question,
    answer: data.answer,
    category: data.category || 'general',
    sort_order: maxOrder + 1,
    is_active: true
  }).select().single()
}

async function updateFaq(id, data) {
  return supabase.from('faq').update(data).eq('id', id).select().single()
}

async function deleteFaq(id) {
  return supabase.from('faq').delete().eq('id', id).select()
}

async function reorderFaq(ids) {
  const updates = ids.map((id, index) => ({ id, sort_order: index, updated_at: new Date().toISOString() }))
  return supabase.from('faq').upsert(updates).select()
}

// ===================== LANDING CONTENT =====================

async function getLandingContent(section) {
  return supabase.from('landing_content').select('content').eq('section', section).single()
}

async function updateLandingContent(section, content) {
  return supabase.from('landing_content').upsert({
    section, content, updated_at: new Date().toISOString()
  }, { onConflict: 'section' }).select().single()
}

// ===================== ANALYTICS =====================

async function getAnalyticsEvents(type, from, to) {
  let query = supabase.from('analytics_events').select('*').order('created_at', { ascending: false })
  if (type) query = query.eq('event_type', type)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)
  return query
}

async function getEventStats(type, from, to) {
  let query = supabase.from('analytics_events').select('event_type', { count: 'exact', head: true })
  if (type) query = query.eq('event_type', type)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)
  return query
}

async function getSalesTrend(from, to) {
  return supabase.from('orders').select('created_at,amount')
    .gte('created_at', from).lte('created_at', to)
    .order('created_at', { ascending: true })
}

async function getOrderStatusDistribution() {
  const statuses = ['pending', 'approved', 'rejected', 'delivered', 'archived']
  const results = {}
  for (const s of statuses) {
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', s)
    results[s] = count || 0
  }
  return results
}

async function getCustomerGrowth(from, to) {
  return supabase.from('customers').select('created_at')
    .gte('created_at', from).lte('created_at', to)
    .order('created_at', { ascending: true })
}

// ===================== NOTIFICATIONS =====================

async function getNotifications(filters = {}) {
  let query = supabase.from('notifications').select('*').order('created_at', { ascending: false })
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.isRead !== undefined) query = query.eq('is_read', filters.isRead)
  if (AppState.user) query = query.or(`for_user.eq.${AppState.user.id},for_user.is.null`)
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function markNotificationRead(id) {
  return supabase.from('notifications').update({ is_read: true }).eq('id', id).select().single()
}

async function markAllNotificationsRead() {
  if (!AppState.user) return
  return supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    .or(`for_user.eq.${AppState.user.id},for_user.is.null`)
}

// ===================== SUPPORT TICKETS =====================

async function getTickets(filters = {}) {
  let query = supabase.from('support_tickets').select('*', { count: 'exact' })
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.assignee) query = query.eq('assigned_to', filters.assignee)
  query = query.order('updated_at', { ascending: false })
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function getTicket(id) {
  const ticket = await supabase.from('support_tickets').select('*').eq('id', id).single()
  const replies = await supabase.from('ticket_replies').select('*').eq('ticket_id', id).order('created_at', { ascending: true })
  return { ticket, replies }
}

async function createTicket(data) {
  return supabase.from('support_tickets').insert({
    subject: data.subject,
    description: data.description,
    customer_id: data.customer_id,
    priority: data.priority || 'medium',
    status: 'open'
  }).select().single()
}

async function updateTicket(id, data) {
  return supabase.from('support_tickets').update(data).eq('id', id).select().single()
}

async function addTicketReply(ticketId, senderType, senderName, message) {
  const reply = await supabase.from('ticket_replies').insert({
    ticket_id: ticketId,
    sender_type: senderType,
    sender_name: senderName,
    message
  }).select().single()
  await supabase.from('support_tickets').update({ updated_at: new Date().toISOString() }).eq('id', ticketId)
  return reply
}

// ===================== COUPONS =====================

async function getCoupons(filters = {}) {
  let query = supabase.from('coupons').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function createCoupon(data) {
  return supabase.from('coupons').insert({
    code: data.code,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    max_uses: data.max_uses,
    used_count: 0,
    expires_at: data.expires_at,
    is_active: true
  }).select().single()
}

async function updateCoupon(id, data) {
  return supabase.from('coupons').update(data).eq('id', id).select().single()
}

async function deleteCoupon(id) {
  return supabase.from('coupons').delete().eq('id', id).select().single()
}

// ===================== ACTIVITY LOGS =====================

async function getActivityLogs(filters = {}) {
  let query = supabase.from('activity_logs').select('*', { count: 'exact' })
  if (filters.actorType) query = query.eq('actor_type', filters.actorType)
  if (filters.actorId) query = query.eq('actor_id', filters.actorId)
  if (filters.action) query = query.eq('action', filters.action)
  if (filters.resourceType) query = query.eq('resource_type', filters.resourceType)
  query = query.order('created_at', { ascending: false })
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function logActivity(actorType, actorId, action, resourceType, resourceId, details) {
  return supabase.from('activity_logs').insert({
    actor_type: actorType,
    actor_id: actorId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details || null
  }).select().single()
}

// ===================== SETTINGS =====================

async function getSettings() {
  return supabase.from('settings').select('*').limit(1).single()
}

async function updateSettings(data) {
  const { data: existing } = await supabase.from('settings').select('id').limit(1).single()
  if (existing?.id) {
    return supabase.from('settings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single()
  }
  return supabase.from('settings').insert(data).select().single()
}

// ===================== ABANDONED ORDERS =====================

async function getAbandonedOrders(filters = {}) {
  let query = supabase.from('abandoned_orders').select('*', { count: 'exact' }).order('updated_at', { ascending: false })
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.search) query = query.or(`customer_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
  if (filters.page && filters.perPage) {
    const from = (filters.page - 1) * filters.perPage
    const to = from + filters.perPage - 1
    query = query.range(from, to)
  }
  return query
}

async function updateAbandonedStatus(id, status) {
  return supabase.from('abandoned_orders').update({
    status,
    updated_at: new Date().toISOString()
  }).eq('id', id)
}

async function trackAbandonedAction(id, action) {
  const { data } = await supabase.from('abandoned_orders').select('recovery_attempts').eq('id', id).single()
  const attempts = (data?.recovery_attempts || 0) + 1
  return supabase.from('abandoned_orders').update({
    recovery_attempts: attempts,
    last_contact_date: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', id)
}

async function deleteAbandonedOrder(id) {
  return supabase.from('abandoned_orders').delete().eq('id', id)
}

async function convertAbandonedToOrder(abandonedId) {
  const { data: abandoned } = await supabase.from('abandoned_orders').select('*').eq('id', abandonedId).single()
  if (!abandoned) throw new Error('Abandoned order not found')
  const { data: customer } = await supabase.from('customers').upsert({
    full_name: abandoned.customer_name,
    email: abandoned.email,
    phone: abandoned.phone || '',
    source: 'abandoned_recovery'
  }, { onConflict: 'email', ignoreDuplicates: false }).select().single()
  if (!customer) throw new Error('Failed to create customer')
  const order = await createOrder({
    customer_id: customer.id,
    product_id: abandoned.product_id,
    customer_name: abandoned.customer_name,
    email: abandoned.email,
    phone: abandoned.phone,
    amount: abandoned.product_price,
    status: 'pending'
  })
  await updateAbandonedStatus(abandonedId, 'recovered')
  return order
}

// ===================== STORAGE =====================

async function uploadFile(bucket, file, path) {
  const filePath = path || `${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return { path: filePath, url: publicUrl }
}

async function deleteFile(bucket, path) {
  return supabase.storage.from(bucket).remove([path])
}

async function listFiles(bucket) {
  return supabase.storage.from(bucket).list()
}

async function getFileUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl
}

// ===================== DASHBOARD STATS =====================

async function getDashboardStats() {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    if (error) throw error
    return data
  } catch {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const [
      { count: totalOrders },
      { count: todayOrders },
      { count: visitors },
      { count: pageviews }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true })
    ])
    const { data: revenue } = await supabase.from('orders').select('amount').gte('created_at', startOfMonth)
    const totalRevenue = revenue?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0
    return { total_orders: totalOrders, today_orders: todayOrders, total_visitors: visitors, total_pageviews: pageviews, monthly_revenue: totalRevenue }
  }
}

async function getMonthlyRevenue(year) {
  return supabase.rpc('get_monthly_revenue', { year: year || new Date().getFullYear() })
}

async function getTopProducts(limit = 5) {
  return supabase.rpc('get_top_products', { p_limit: limit })
}
