# دليل إعداد Supabase الكامل — GrowUp Agency

> هذا الدليل يوضح كل الخطوات اليدوية التي يجب تنفيذها في Supabase Dashboard.

---

## 1. إنشاء المشروع (مرة واحدة)
1. supabase.com → New Project
2. الاسم: `growup-agency`
3. كلمة المرور: احفظها في `.env.example`
4. المنطقة: اختر الأقرب لجزائر (مثلاً Europe West)
5. انتظر 2-3 دقائق حتى ينشأ المشروع

## 2. تنفيذ SQL Schema
1. Supabase → SQL Editor
2. افتح ملف `supabase/migrations/001_full_schema.sql`
3. الصق المحتوى بالكامل
4. Run — يجب أن تظهر كل الجداول بدون أخطاء
5. افتح ملف `supabase/migrations/002_storage_auth.sql`
6. نفّذ الجزء الخاص بإنشاء دالة `decrypt_payload` فقط

## 3. إعداد Storage (bucket payment-proofs)
1. Supabase → Storage → New Bucket
2. الاسم: `payment-proofs`
3. Public bucket: **OFF**
4. بعد الإنشاء، اذهب إلى Policies
5. أضف سياسة لـ INSERT:
   - Policy name: `authenticated users can upload`
   - Allowed operations: INSERT
   - Target roles: authenticated
   - USING expression: `(bucket_id = 'payment-proofs')`
   - WITH CHECK expression: `(bucket_id = 'payment-proofs')`

## 4. إعداد Auth
1. Supabase → Authentication → Settings
2. **Site URL**: ضع رابط موقعك بعد النشر (مثلاً `https://growup-agency.netlify.app`)
3. **Redirect URLs**: أضف `https://growup-agency.netlify.app/landing.html`
4. Authentication → Providers → Email:
   - تأكد من أن **Enable email provider** مفعّل
   - **Confirm email**: يمكنك تعطيلها (المستخدمون لا يحتاجون تأكيد)
5. **تخصيص قوالب الإيميلات** (اختياري لكن مفضّل):
   - Confirmation (للـ Magic Link):
     - Subject AR: `رابط الدخول — GrowUp Agency`
     - Subject FR: `Lien de connexion — GrowUp Agency`
     - Body: قالب بسيط بالعربية والفرنسية

## 5. إنشاء حساب OWNER الأول
1. Supabase → Authentication → Users
2. Invite User → أدخل بريد المالك (مثلاً `owner@growup.com`)
3. سيصله بريد الدعوة — أنشئ كلمة مرور
4. بعد تأكيد الحساب، اذهب إلى SQL Editor ونفّذ:
   ```sql
   INSERT INTO staff_users (id, email, role) 
   VALUES ('[user-id من صفحة Users]', 'owner@growup.com', 'OWNER');
   ```
5. الآن يمكن للمالك تسجيل الدخول للداشبورد

## 6. إضافة أول delivery_payload (محتوى تسليم)
قبل الموافقة على أول طلب، يجب إدخال محتوى التسليم المشفّر:
```sql
INSERT INTO delivery_payloads (order_id, payload_encrypted)
VALUES (
  'order-uuid',
  encode(pgp_sym_encrypt(
    'بيانات حساب TikTok هنا
    Email: test@example.com
    Password: Test1234!',
    'your-encryption-key-من-.env'
  ), 'base64')
);
```
> ملاحظة: يمكنك إدخال هذا قبل كل موافقة أو أتمتته لاحقاً

## 7. نشر Edge Functions
### الطريقة 1: باستخدام Supabase CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy validate-order
supabase functions deploy create-order
supabase functions deploy approve-order
supabase functions deploy generate-invoice
```

### الطريقة 2: يدوياً عبر Supabase Dashboard
1. Supabase → Edge Functions
2. New Function → الصق الكود من كل ملف
3. كرر لكل function

## 8. إضافة Secrets (لـ Edge Functions)
Supabase → Edge Functions → Secrets → Add:

| Secret | القيمة |
|---|---|
| `SUPABASE_URL` | رابط مشروعك من Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | المفتاح السري |
| `RESEND_API_KEY` | من حساب Resend (re_...) |
| `PAYLOAD_ENCRYPTION_KEY` | مفتاح التشفير الخاص بك |

**تحذير**: لا تضع `SUPABASE_SERVICE_ROLE_KEY` أبداً في ملفات HTML.

## 9. إعداد Resend للإيميلات
1. سجّل في `resend.com`
2. أضف نطاقك وتحقق منه (أو استخدم النطاق التجريبي @resend.dev)
3. أنشئ API Key
4. أضف الـ API Key في Supabase Secrets

## 10. التعديل النهائي في HTML
افتح `landing.html` و `dashboard.html` وابحث عن:
```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'
```
استبدلهما بقيم مشروعك الحقيقية.

## 11. رفع على Netlify
1. netlify.com → Deploy manually
2. اسحب مجلد `growup-platform` كاملاً
3. أو: ادفع إلى GitHub واربط مع Netlify → auto-deploy

## 12. قائمة التدقيق النهائية
- [ ] جميع الـ 11 جدولاً موجودة في Supabase
- [ ] RLS مفعّل على كل الجداول
- [ ] bucket `payment-proofs` خاص وله سياسة INSERT
- [ ] حساب OWNER موجود في `staff_users`
- [ ] أرقام الدفع الحقيقية مُدخَلة (من dashboard → الإعدادات)
- [ ] `SUPABASE_URL` محدَّث في كلا الملفين
- [ ] `SUPABASE_ANON_KEY` محدَّثة في كلا الملفين
- [ ] Edge Functions منشورة
- [ ] Secrets مضبوطة
- [ ] الإشعارات معطّلة (`notifications_enabled = false`)
- [ ] لا ادعاءات قانونية كاذبة في Settings
- [ ] اختبار شراء كامل (طلب → رفع إيصال → موافقة → إيميل)
