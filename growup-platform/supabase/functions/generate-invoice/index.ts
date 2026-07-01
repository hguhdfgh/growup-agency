const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

    const { order_id } = await req.json()
    if (!order_id) return new Response(JSON.stringify({ error: 'order_id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const orderRes = await fetch(supabaseUrl + '/rest/v1/orders?id=eq.' + order_id + '&select=*', {
      headers: { 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey }
    })
    const orders = await orderRes.json()
    const order = orders?.[0]
    if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })

    const locale = order.locale || 'ar'
    const isRtl = locale === 'ar'
    const productName = order.product_snapshot?.[isRtl ? 'name_ar' : 'name_fr'] || '-'
    const price = Number(order.final_price_dzd || 0).toLocaleString(isRtl ? 'ar-DZ' : 'fr-DZ')

    const html = '<!DOCTYPE html><html lang=' + locale + ' dir=' + (isRtl ? 'rtl' : 'ltr') + '><head><meta charset=UTF-8><title>Invoice ' + order.order_number + '</title><style>body{font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem;color:#1d1d1f}h1{color:#0071e3}.row{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #d2d2d7}.total{font-weight:700;font-size:1.25rem;margin-top:1rem}</style></head><body><h1>' + (isRtl ? 'فاتورة' : 'Facture') + ' ' + order.order_number + '</h1><div class=row><span>' + (isRtl ? 'المنتج' : 'Produit') + '</span><span>' + productName + '</span></div><div class=row><span>' + (isRtl ? 'المبلغ' : 'Montant') + '</span><span>' + price + ' DZD</span></div><div class=row><span>' + (isRtl ? 'الحالة' : 'Statut') + '</span><span>' + order.status + '</span></div><div class=row><span>' + (isRtl ? 'التاريخ' : 'Date') + '</span><span>' + new Date(order.created_at).toLocaleDateString(isRtl ? 'ar-DZ' : 'fr-DZ') + '</span></div></body></html>'

    return new Response(JSON.stringify({ invoice_html: html, order_number: order.order_number, locale }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})