const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  try {
    const { product_id, coupon_code } = await req.json()
    
    const res = await fetch(supabaseUrl + '/rest/v1/products?id=eq.' + product_id + '&status=eq.active&select=*', {
      headers: { 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey }
    })
    const products = await res.json()
    
    if (!products || products.length === 0) {
      return new Response(JSON.stringify({ error: 'المنتج غير متاح' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    
    const product = products[0]
    let discount = 0
    let coupon_data = null

    if (coupon_code) {
      const couponRes = await fetch(supabaseUrl + '/rest/v1/coupons?code=eq.' + coupon_code.toUpperCase() + '&active=eq.true&select=*', {
        headers: { 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey }
      })
      const coupons = await couponRes.json()
      
      if (coupons && coupons.length > 0) {
        const coupon = coupons[0]
        const valid = !(coupon.expires_at && new Date(coupon.expires_at) < new Date()) &&
          !(coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) &&
          !(coupon.product_scope && coupon.product_scope !== product_id)
        
        if (valid) {
          discount = coupon.type === 'PERCENT'
            ? Math.round(product.price_dzd * coupon.value / 100)
            : Math.min(coupon.value, product.price_dzd)
          coupon_data = { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value, discount_amount: discount }
        }
      }
    }

    return new Response(JSON.stringify({
      product: { id: product.id, name_ar: product.name_ar, name_fr: product.name_fr, price_dzd: product.price_dzd },
      coupon: coupon_data,
      original_price_dzd: product.price_dzd,
      discount_dzd: discount,
      final_price_dzd: product.price_dzd - discount
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})