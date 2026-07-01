# خطة تطوير لوحة التحكم — TikTok Agency

## نظرة عامة

ملف يوضح توزيع العمل على 10 وكلاء ذكاء اصطناعي (AI Agents) لتطوير واجهة لوحة التحكم (`dashboard.html` + `dashboard.js` + `supabase.js`) وإضافة الميزات المفقودة وإصلاح الأخطاء.

### الهيكل العام

```
Agent 1  →  مراقب (Monitor)  ←  يتابع تقدم الـ 10 ويتحقق من الجودة
Agent 2  →  مصحح (Fixer)     ←  يصلح الأخطاء التي يجدها المراقب
Agent 3  →  الطلبات والعملاء (Orders & Customers Enhancement)
Agent 4  →  المنتجات ومكتبة الوسائط (Products & Media)
Agent 5  →  التقييمات والأسئلة (Reviews & FAQ)
Agent 6  →  التحليلات والرسوم البيانية (Analytics & Charts)
Agent 7  →  الإعدادات والمحتوى (Settings & Content)
Agent 8  →  الإشعارات والوقت الفعلي (Notifications & Realtime)
Agent 9  →  التذاكر والنشاطات والملف الشخصي (Tickets, Activity, Profile)
Agent 10 →  تحسينات الواجهة والميزات العامة (UI/UX & Global)
```

---

## الملفات المستهدفة

| الملف | المسار | الدور |
|-------|--------|-------|
| `dashboard.html` | `dashboard/dashboard.html` | هيكل HTML للواجهة (1150 سطر) |
| `dashboard.js` | `dashboard/dashboard.js` | منطق التطبيق الرئيسي (984 سطر) |
| `supabase.js` | `dashboard/supabase.js` | طبقة الوصول إلى Supabase API (1417 سطر) |
| `dashboard.css` | `dashboard/dashboard.css` | ستايلات الواجهة |
| `i18n.js` | `dashboard/i18n.js` | التدويل والترجمة |
| `schema.sql` | `dashboard/schema.sql` | مخطط قاعدة البيانات (768 سطر) |

---

## تحليل الوضع الحالي لكل صفحة

### ✅ يعمل بشكل أساسي
- **تسجيل الدخول** — login, session, logout
- **الإحصائيات** — إجمالي الطلبات، النشطة، العملاء، الإيرادات، آخر الطلبات، أفضل المنتجات
- **الطلبات** — عرض، ترشيح، بحث، عرض التفاصيل، ملاحظات، تايم لاين، موافقة/رفض
- **العملاء** — عرض، بحث، عرض التفاصيل مع طلبات العميل
- **المنتجات** — عرض، إضافة/تعديل عبر مودال
- **التقييمات** — عرض، موافقة، تثبيت، رد
- **الأسئلة الشائعة** — عرض، إضافة/تعديل عبر مودال
- **التذاكر** — عرض، عرض التفاصيل مع الردود، إضافة رد
- **الإشعارات** — عرض، Mark as read (جزئي)
- **الكوبونات** — عرض، إضافة/تعديل عبر مودال
- **المحتوى** — أقسام Hero, Features, Stats, About مع حفظ
- **النشاطات** — عرض مع ترشيح
- **الملف الشخصي** — معلومات شخصية، تغيير كلمة المرور
- **الإعدادات** — قسم عام (اسم، وصف، شعار)، أقسام الدفع والإشعارات (بلاسهولدر)
- **التحليلات** — إحصائيات + ترشيح تواريخ (بدون رسوم بيانية حقيقية)

### ❌ ميزات مفقودة أو تحتاج تطوير

#### Orders & Customers
- [ ] عرض صورة إثبات الدفع (payment_proof_url) في جدول الطلبات والتفاصيل
- [ ] تغيير الحالة المباشر من صف الجدول (قوائم منسدلة للحالة)
- [ ] إجراءات جماعية على الطلبات (تحديد متعدد، تغيير حالة جماعي، حذف)
- [ ] تصدير الطلبات إلى CSV/Excel
- [ ] ترقيم الصفحات (Pagination) لكل الجداول
- [ ] تحرير سريع للعميل (تعديل في المودال)
- [ ] وسم العملاء (Tags) مع إمكانية الترشيح
- [ ] حالة العميل (active/blocked/lead) مع إمكانية التغيير
- [ ] مصدر العميل (direct/tiktok/facebook/referral) مع ترشيح
- [ ] ملاحظات العميل مع إمكانية التحرير
- [ ] الطلبات المنسوبة لمشرف معين (assigned_to)
- [ ] زر عرض / تحميل إثبات الدفع

#### Products & Media
- [ ] رفع صور المنتج إلى Storage (bucket media)
- [ ] محرر JSON منظم للميزات (features)
- [ ] حقل مدة الضمان (warranty_months)
- [ ] ترتيب المنتجات بالسحب والإفلات (Drag & Drop)
- [ ] صفحة مكتبة الوسائط (Media Library) لإدارة الملفات المرفوعة
- [ ] توليد slug تلقائي من الاسم
- [ ] حقل رابط فيديو المنتج

#### Reviews & FAQ
- [ ] عرض النجوم (1-5) بشكل بصري في الجدول
- [ ] إجراءات جماعية (موافقة، تثبيت، حذف)
- [ ] فرز FAQ بالسحب والإفلات
- [ ] محرر نصوص غني للإجابات (Rich Text)
- [ ] تصنيف الأسئلة (category)

#### Analytics & Charts
- [ ] دمج مكتبة Chart.js للرسوم البيانية الحقيقية
- [ ] مخطط اتجاهات المبيعات (خطي)
- [ ] مخطط توزيع حالات الطلبات (دائري)
- [ ] مخطط نمو العملاء (خطي)
- [ ] تحميل بيانات التحليلات (CSV)
- [ ] مقارنة الفترات (هذا الشهر vs الشهر الماضي)

#### Settings & Content
- [ ] محرر حسابات الدفع (CCP RIB, Baridimob number, Bank info) — JSON منظم
- [ ] محرر Hero مع معاينة مباشرة
- [ ] محرر Features/Stats مع JSON validator
- [ ] إضافة/حذف أقسام المحتوى ديناميكياً
- [ ] تحميل الشعار (logo) إلى Storage
- [ ] إعدادات SMTP (placeholder حالياً)
- [ ] إعدادات وسائل التواصل الاجتماعي
- [ ] أكواد التتبع (Google Analytics, Facebook Pixel, TikTok Pixel)

#### Notifications & Realtime
- [ ] تفعيل Supabase Realtime للإشعارات المباشرة
- [ ] تحديث badge الإشعارات في الشريط الجانبي والهيدر مباشرة
- [ ] Toast notifications عند وصول إشعار جديد
- [ ] علامة القراءة/عدم القراءة
- [ ] ترشيح الإشعارات حسب النوع
- [ ] تحديد الكل كمقروء

#### Tickets, Activity & Profile
- [ ] تعيين التذكرة لمشرف (assigned_to) مع قائمة منسدلة
- [ ] تغيير أولوية التذكرة (low/medium/high/urgent)
- [ ] تفاصيل النشاط (عرض JSON metadata)
- [ ] رفع الصورة الشخصية إلى Storage
- [ ] تحميل الصورة الشخصية (avatar upload)

#### UI/UX & Global
- [ ] تحسين الاستجابة (المحمول)
- [ ] Pagination لكل الجداول
- [ ] تصدير CSV/Excel للطلبات والعملاء
- [ ] إجراءات جماعية (تحديد صفوف متعددة، تغيير حالة، حذف)
- [ ] وضع الليل (Dark mode toggle)
- [ ] حالات التحميل والخطأ بشكل أفضل
- [ ] بحث عام (global search)
- [ ] اختصارات لوحة المفاتيح
- [ ] إشعار التراجع (Undo toast)

---

## خطة التنفيذ — 10 AI Agents

### Agent 1: المراقب (Monitor)

**الدور:** متابعة تقدم جميع الوكلاء، مراجعة المخرجات، التحقق من الجودة، اكتشاف التعارضات.

**مهامه:**
1. فتح كل ملف بعد كل Agent والتأكد من عدم كسر الشيفرة الموجودة
2. التأكد من اتساق التسميات (naming conventions) عبر الملفات
3. التأكد من استخدام نفس أنماط الـ API calls (مثلاً `getOrders()`, `getCustomers()`)
4. التأكد من أن الـ CSS classes المستخدمة موجودة في `dashboard.css`
5. التأكد من عدم وجود تعارض بين تعديلات Agent 3 و Agent 4 ... إلخ
6. التحقق من أن `dashboard.html` + `dashboard.js` + `supabase.js` متوافقة بعد كل تعديل
7. تسجيل الملاحظات وإرسالها إلى Agent 2 (المصحح)

**التسليم:** تقرير يومي عن حالة كل Agent مع قائمة بالأخطاء

### Agent 2: المصحح (Fixer)

**الدور:** إصلاح الأخطاء والمشاكل التي يكتشفها المراقب (Agent 1).

**مهامه:**
1. استقبال تقارير الأخطاء من Agent 1
2. إصلاح conflicts في الملفات
3. تعديل الكود ليتوافق مع الأنماط المتبعة
4. التأكد من أن كل صفحة تعمل بعد الإصلاح
5. إعادة الاختبار (manual test flow: login → navigate → CRUD)
6. التأكد من عدم وجود broken references (مثلاً دوال مفقودة في supabase.js)

**التسليم:** كود مصحح وجاهز

---

### Agent 3: الطلبات والعملاء (Orders & Customers Enhancement)

**الملفات المستهدفة:** `dashboard.js`, `supabase.js`, `dashboard.html`

**المهام:**

1. **جدول الطلبات — عرض إثبات الدفع**
   - إضافة عمود "إثبات الدفع" في جدول الطلبات
   - إظهار صورة مصغرة `payment_proof_url` مع رابط للتكبير إذا موجود
   - إضافة زر "عرض الإثبات" في صفحة التفاصيل

2. **جدول الطلبات — تغيير الحالة المباشر**
   - إضافة `<select>` في كل صف لتغيير الحالة مباشرة
   - القيم: pending, approved, rejected, delivered, archived
   - استدعاء `updateOrder(id, { status: newStatus })` عند التغيير
   - إضافة حدث `onchange` مع تأكيد

3. **إجراءات جماعية**
   - إضافة checkbox في رأس الجدول (select all)
   - إضافة checkbox لكل صف
   - إظهار شريط إجراءات عند التحديد (تغيير حالة، حذف)
   - استدعاء `batchUpdateOrders(ids, { status })` في supabase.js

4. **تصدير CSV**
   - إضافة زر "تصدير CSV" في page-header
   - دالة `exportOrdersToCSV()` تستخدم الأعمدة: order_number, customer_name, amount, status, created_at
   - استخدام `Blob` و `URL.createObjectURL` للتحميل

5. **ترقيم الصفحات (Pagination)**
   - إضافة أزرار التنقل أسفل الجدول: « السابق | 1 | 2 | 3 | التالي »
   - تعديل `getOrders()` في supabase.js لقبول `{ page, perPage }`
   - استخدام `range()` في استعلام Supabase: `.range((page-1)*perPage, page*perPage-1)`
   - إضافة `count: 'exact'` للحصول على العدد الإجمالي

6. **العملاء — وسم وتصنيف**
   - إضافة قائمة منسدلة لترشيح العملاء حسب: الكل، lead, active, blocked
   - إضافة قائمة منسدلة لترشيح حسب المصدر
   - إظهار tags في جدول العملاء
   - إمكانية إضافة/إزالة tags في مودال التعديل
   - دالة `updateCustomerTags(id, tags)` في supabase.js

7. **العملاء — ملاحظات**
   - إظهار حقل notes في صفحة تفاصيل العميل
   - إمكانية التعديل والحفظ
   - دالة `updateCustomer(id, { notes })` في supabase.js

8. **الطلب — تعيين مشرف**
   - إضافة قائمة منسدلة "المشرف المسؤول" في صفحة تفاصيل الطلب
   - جلب قائمة المشرفين من جدول `profiles`
   - دالة `assignOrder(orderId, profileId)` في supabase.js

---

### Agent 4: المنتجات ومكتبة الوسائط (Products & Media)

**الملفات المستهدفة:** `dashboard.js`, `supabase.js`, `dashboard.html`

**المهام:**

1. **رفع صور المنتج**
   - تعديل مودال المنتج لإضافة حقل رفع صورة (input type="file", accept="image/*")
   - رفع الصورة إلى bucket `media` باستخدام `supabase.storage.from('media').upload()`
   - تخزين الـ URL العام في `products.images` (array)
   - دالة `uploadProductImage(file)` في supabase.js

2. **معاينة الصور**
   - عرض الصور المرفوعة في مودال التعديل مع إمكانية الحذف
   - إظهار أول صورة في جدول المنتجات

3. **محرر JSON للميزات**
   - تحويل حقل features من textarea عادي إلى محرر JSON منظم
   - إضافة/إزالة items (قائمة: نص الميزة)
   - التحقق من صحة JSON
   - تخزين كـ JSONB في Supabase

4. **حقل مدة الضمان**
   - إضافة input number لـ `warranty_months` في مودال المنتج
   - العرض في جدول المنتجات

5. **ترتيب المنتجات**
   - إضافة أزرار ↑ ↓ في جدول المنتجات لتغيير `sort_order`
   - دالة `reorderProduct(id, newOrder)` في supabase.js
   - أو تنفيذ Drag & Drop باستخدام HTML5 Drag API

6. **توليد slug**
   - تحويل الاسم إلى slug تلقائياً عند الكتابة
   - معالجة الأحرف العربية (إزالة التشكيل، استبدال المسافات بـ `-`)
   - دالة `generateSlug(name)` مساعدة

7. **صفحة مكتبة الوسائط (Media Library)**
   - صفحة جديدة: `page-media` في dashboard.html
   - جلب وعرض جميع الملفات من جدول `media_library`
   - عرض شبكي بالصور المصغرة (grid)
   - إمكانية رفع ملف جديد (image + pdf + video)
   - إمكانية حذف ملف
   - إظهار الـ URL للنسخ
   - دالة `getMedia()`, `uploadMedia(file)`, `deleteMedia(id)`

8. **رابط الفيديو**
   - إضافة حقل `video_url` في مودال المنتج
   - عرض في جدول المنتجات كأيقونة تشغيل

---

### Agent 5: التقييمات والأسئلة (Reviews & FAQ)

**الملفات المستهدفة:** `dashboard.js`, `supabase.js`, `dashboard.html`

**المهام:**

1. **التقييمات — عرض النجوم البصري**
   - إضافة عمود "التقييم" يعرض نجوم (★) ملونة
   - HTML: `<span class="stars">${'★'.repeat(rating) + '☆'.repeat(5-rating)}</span>`
   - تلوين النجوم: 1-2 أحمر، 3 برتقالي، 4-5 أخضر
   - إظهار التقييم العددي بجانب النجوم

2. **التقييمات — إجراءات جماعية**
   - إضافة checkbox لكل صف
   - أزرار: "موافقة على المحدد", "تثبيت المحدد", "حذف المحدد"
   - دوال في supabase.js: `batchApproveReviews(ids)`, `batchPinReviews(ids)`, `batchDeleteReviews(ids)`

3. **التقييمات — رد مسبق**
   - إظهار الرد (reply) في جدول التقييمات إذا موجود
   - إمكانية تحرير/حذف الرد

4. **FAQ — ترتيب بالسحب**
   - تنفيذ Drag & Drop لقائمة FAQ
   - حفظ الترتيب الجديد في `sort_order`
   - دالة `reorderFaq(id, newOrder)` في supabase.js

5. **FAQ — محرر نصوص للإجابات**
   - تحويل textarea إلى محرر بسيط بأزرار: عريض, مائل, قائمة
   - أو إضافة دعم Markdown مع معاينة
   - تخزين HTML في `answer`

6. **FAQ — تصنيف**
   - إضافة حقل `category` في مودال FAQ
   - ترشيح الأسئلة حسب التصنيف في صفحة FAQ

---

### Agent 6: التحليلات والرسوم البيانية (Analytics & Charts)

**الملفات المستهدفة:** `dashboard.js`, `supabase.js`, `dashboard.html`, `dashboard.css`

**المهام:**

1. **دمج Chart.js**
   - إضافة CDN: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>` في dashboard.html
   - إنشاء دوال تهيئة الرسوم البيانية

2. **مخطط اتجاهات المبيعات (خطي)**
   - استعلام: عدد الطلبات والإيرادات لكل يوم في آخر 30 يوم
   - رسم خطين: عدد الطلبات + الإيرادات
   - محور X: التاريخ، محور Y: القيمة

3. **مخطط توزيع حالات الطلبات (دائري)**
   - استعلام: `SELECT status, COUNT(*) FROM orders GROUP BY status`
   - رسم دائري (Doughnut أو Pie)
   - ألوان: pending=أصفر, approved=أخضر, rejected=أحمر, delivered=أزرق

4. **مخطط نمو العملاء (خطي)**
   - استعلام: عدد العملاء الجدد لكل يوم في آخر 30 يوم
   - رسم خطي مع تعبئة (fill)

5. **إحصائيات التحليلات**
   - إجمالي الزوار، مشاهدات الصفحات، التحويلات، معدل الارتداد
   - مقارنة مع الفترة السابقة (نسبة التغير)
   - استعلام من جدول `analytics_events`

6. **تصفية متقدمة**
   - نطاق تاريخي مخصص (من - إلى)
   - ترشيح حسب نوع الحدث
   - تحديث الرسوم البيانية ديناميكياً

7. **تصدير التحليلات**
   - زر "تحميل CSV" لبيانات التحليلات

8. **دوال supabase.js للتحليلات**
   - `getAnalyticsOverview({ from, to })` — إحصائيات عامة
   - `getSalesTrend({ from, to })` — اتجاهات المبيعات
   - `getOrderStatusDistribution()` — توزيع حالات الطلبات
   - `getCustomerGrowth({ from, to })` — نمو العملاء
   - `getEventStats({ type, from, to })` — إحصائيات الأحداث

---

### Agent 7: الإعدادات والمحتوى (Settings & Content)

**الملفات المستهدفة:** `dashboard.js`, `supabase.js`, `dashboard.html`

**المهام:**

1. **إعدادات الدفع — محرر منظم**
   - بناء واجهة لإدارة `payment_accounts` في settings
   - ثلاث طرق دفع: baridimob, ccp, bank
   - لكل طريقة: label, account number/number, owner name, logo
   - حفظ كـ JSON في `settings.payment_accounts`
   - معاينة مباشرة للبيانات المحفوظة

2. **إعدادات عامة — متقدمة**
   - إضافة: الهاتف، الواتساب، البريد الإلكتروني، العنوان
   - إضافة: روابط التواصل الاجتماعي (Facebook, Instagram, TikTok, YouTube)
   - إضافة: أكواد التتبع (Google Analytics, Facebook Pixel, TikTok Pixel)
   - تحميل الشعار إلى Storage

3. **إعدادات SMTP**
   - نموذج: host, port, username, password, from email
   - إظهار/إخفاء كلمة المرور
   - حفظ كـ JSON في `settings.smtp_config`

4. **المحتوى — محرر Hero**
   - إضافة عناصر: subtitle, buttons (نص + رابط), صورة خلفية
   - معاينة مباشرة للتغييرات
   - رفع صورة الخلفية إلى Storage

5. **المحتوى — محرر Features مع JSON Validator**
   - قائمة من الميزات مع: أيقونة, عنوان, وصف
   - إضافة/حذف/ترتيب الميزات
   - التحقق من الصحة قبل الحفظ

6. **المحتوى — إضافة أقسام جديدة**
   - إمكانية إضافة أقسام محتوى جديدة (بجانب hero, features, trust, cta, footer, seo)
   - نموذج: section name, content (JSON), is_active

7. **SEO Editor**
   - محرر للـ `seo_meta` في settings: meta title, meta description, meta keywords, og-image
   - معاينة كيفية ظهور الموقع في نتائج البحث

8. **دوال supabase.js**
   - `getSettings()` — جلب all settings
   - `updateSettings(data)` — تحديث settings
   - `updateSettingsSection(section, data)` — تحديث قسم معين
   - `saveContent(section, content)` — حفظ محتوى landing_content

---

### Agent 8: الإشعارات والوقت الفعلي (Notifications & Realtime)

**الملفات المستهدفة:** `dashboard.js`, `supabase.js`, `dashboard.html`

**المهام:**

1. **تفعيل Supabase Realtime**
   - الاشتراك في قناة `notifications` في `setupRealtime()`
   - الاستماع للأحداث الجديدة (INSERT)
   - تحديث قائمة الإشعارات مباشرة

2. **تحديث badge الإشعارات**
   - `$('notif-badge-sidebar')` و `$('notif-dot-header')`
   - التحديث فور وصول إشعار جديد
   - عرض عدد الإشعارات غير المقروءة

3. **Toast notifications**
   - إظهار toast عند وصول إشعار جديد
   - النوع: info (أزرق)، warning (أصفر)، success (أخضر)، error (أحمر)
   - إظهار title + body مع رابط للصفحة المعنية

4. **إشعارات للطلبات الجديدة**
   - عند وصول إشعار من نوع `new_order`
   - Toast + صوت تنبيه (اختياري)
   - رابط مباشر لصفحة تفاصيل الطلب

5. **تحديث شريط الإشعارات**
   - إضافة `data-id` لكل إشعار في القائمة
   - تمييز غير المقروء بخلفية مختلفة
   - النقر على الإشعار يفتح الصفحة المعنية ويحدده كمقروء

6. **ترشيح الإشعارات**
   - إضافة فلتر حسب النوع: new_order, new_customer, payment_uploaded, support
   - إضافة فلتر حسب حالة القراءة: الكل, مقروء, غير مقروء

7. **تحديد الكل كمقروء**
   - تفعيل زر "تحديد الكل كمقروء"
   - دالة `markAllNotificationsRead()` في supabase.js

8. **دوال supabase.js**
   - `getNotifications({ filter, page })` — جلب الإشعارات مع ترشيح
   - `markNotificationRead(id)` — تحديد إشعار كمقروء
   - `markAllNotificationsRead()` — تحديد الكل كمقروء
   - `getUnreadCount()` — عدد غير المقروء

---

### Agent 9: التذاكر والنشاطات والملف الشخصي (Tickets, Activity, Profile)

**الملفات المستهدفة:** `dashboard.js`, `supabase.js`, `dashboard.html`

**المهام:**

1. **التذاكر — تعيين مشرف**
   - في صفحة تفاصيل التذكرة، إضافة قائمة منسدلة "المشرف المسؤول"
   - جلب قائمة المشرفين من `profiles WHERE role IN ('admin', 'support')`
   - دالة `assignTicket(ticketId, profileId)` في supabase.js

2. **التذاكر — تغيير الأولوية**
   - إضافة أزرار أو قائمة منسدلة لتغيير الأولوية
   - low, medium, high, urgent
   - دالة `updateTicketPriority(ticketId, priority)` في supabase.js

3. **التذاكر — تغيير الحالة**
   - إضافة أزرار إجراء سريع: "حل", "إغلاق", "إعادة فتح"
   - دالة `updateTicketStatus(ticketId, status)` في supabase.js

4. **التذاكر — إضافة ردود مع تنسيق**
   - دعم Markdown بسيط أو HTML للردود
   - إظهار اسم المرسل وصورته في كل رد

5. **النشاطات — عرض تفاصيل**
   - توسيع صف النشاط عند النقر (expandable row)
   - إظهار `details` كـ JSON منسق
   - إظهار `ip_address` إذا موجود

6. **النشاطات — ترشيح متقدم**
   - فلتر حسب نوع المصدر (resource_type): order, customer, product, ticket, system
   - فلتر حسب الإجراء (action): order_created, customer_created, login, logout
   - دالة `getActivities({ filters, page })` في supabase.js

7. **الملف الشخصي — رفع الصورة**
   - تفعيل زر "تغيير الصورة" (رفع إلى bucket `avatars`)
   - معاينة الصورة بعد الرفع
   - تحديث `profiles.avatar_url`
   - دالة `uploadAvatar(file)` في supabase.js

8. **الملف الشخصي — تحديث المعلومات**
   - ربط نموذج `profile-form` مع `updateProfile(data)` في supabase.js
   - ربط نموذج `password-form` مع `updatePassword(password)` في supabase.js

9. **دوال supabase.js جديدة**
   - `getAssignableProfiles()` — جلب المشرفين للتخصيص
   - `getActivities({ actorType, resourceType, action, page })` — نشاطات مع ترشيح
   - `uploadAvatar(file)` — رفع الصورة الشخصية
   - `updateProfile(data)` — تحديث الملف الشخصي
   - `updatePassword(newPassword)` — تغيير كلمة المرور عبر Supabase Auth API

---

### Agent 10: تحسينات الواجهة والميزات العامة (UI/UX & Global)

**الملفات المستهدفة:** `dashboard.js`, `dashboard.css`, `dashboard.html`

**المهام:**

1. **ترقيم الصفحات (Pagination) للجميع**
   - توحيد نمط pagination عبر جميع الصفحات (orders, customers, products, reviews, tickets, coupons, activity)
   - Component مشترك: `renderPagination(containerId, { currentPage, totalPages, onPageChange })`
   - تعديل دوال `load*()` لقبول رقم الصفحة

2. **تصدير CSV للجميع**
   - توحيد دالة `exportToCSV(data, filename, columns)` في dashboard.js
   - إضافة زر "تصدير" في صفحات: العملاء، المنتجات، التقييمات، التذاكر، الكوبونات

3. **إجراءات جماعية موحدة**
   - توحيد نمط تحديد الصفوف عبر جميع الجداول
   - شريط إجراءات يظهر عند التحديد مع عدد العناصر المحددة
   - دوال: `batchDelete(ids, table)`, `batchUpdate(ids, table, data)`

4. **تحسين الاستجابة (Responsive)**
   - إضافة `@media` queries للنقال (عرض < 768px)
   - تحويل الجداول إلى بطاقات (cards) في الشاشات الصغيرة
   - إخفاء/إظهار عناصر حسب حجم الشاشة
   - اختبار مع 3 أحجام: 375px, 768px, 1440px

5. **وضع الليل (Dark Mode)**
   - إضافة toggle في الهيدر: أيقونة 🌙/☀️
   - تخزين التفضيل في `localStorage`
   - إضافة class `dark` على `<html>` أو `<body>`
   - CSS custom properties: `--bg-primary`, `--text-primary`, إلخ
   - التأكد من وجود متغيرات CSS للوضعين

6. **حالات التحميل**
   - إضافة skeleton loaders بدلاً من spinner
   - أو تحسين spinner الحالي (padding, centering)
   - إظهار رسالة "جاري التحميل..." للنصوص
   - معالجة الأخطاء: عرض toast بدلاً من console.error

7. **بحث عام (Global Search)**
   - تفعيل `global-search` في الهيدر
   - البحث في: الطلبات (order_number)، العملاء (full_name, email)، المنتجات (name)
   - عرض نتائج في قائمة منسدلة (dropdown)
   - النقر على نتيجة يفتح الصفحة المعنية

8. **تحسينات الأداء**
   - إضافة `loading="lazy"` للصور
   - تجنب عمليات DOM المتكررة
   - تخزين مؤقت للبيانات (cache) لا يتم مسحه إلا عند الحاجة
   - دالة `debounce` للبحث

9. **اختصارات لوحة المفاتيح**
   - `Ctrl+K` → بحث عام
   - `Ctrl+N` → إنشاء جديد (حسب الصفحة الحالية)
   - `Escape` → إغلاق المودال

10. **تحسينات بصرية إضافية**
    - إضافة ألوان متدرجة للـ status badges
    - تحسين هوفر الصفوف (hover effect) بظل خفيف
    - إضافة أيقونات للأزرار التي لا توجد بها أيقونات
    - تحسين التباعد (spacing) والهوامش

---

## قواعد العمل

### تسلسل التنفيذ المقترح

```
Phase 1 (Agents 3-5): تحسينات البيانات الأساسية
Phase 2 (Agents 6-7): تحليلات + إعدادات
Phase 3 (Agents 8-9): الوقت الفعلي + تكامل
Phase 4 (Agent 10): تحسينات واجهة شاملة
```

المراقب (Agent 1) يعمل بالتوازي مع جميع الفases.
المصحح (Agent 2) يتدخل عند الحاجة فقط.

### أنماط الكود المطلوبة

- **Vanilla JS** — لا تستخدم أي framework أو مكتبة (باستثناء Chart.js و Supabase UMD)
- **التعليقات** — لا تضف تعليقات (حسب سياسة المشروع)
- **التسميات** — camelCase للدوال والمتغيرات
- **الدوال المساعدة** — أضفها في dashboard.js مع دوال `load*` الموجودة
- **API calls** — أضفها في supabase.js فقط، واستدعها من dashboard.js
- **الـ CSS** — أضف styles جديدة في dashboard.css

### دوال API موجودة في supabase.js

```js
signIn(email, password)
signOut()
getSession()
getCurrentUser()
getDashboardStats()
getRecentOrders(limit)
getTopProducts(limit)
getOrders({ status, search })
getOrderById(id)
createOrder(data)
updateOrder(id, data)
deleteOrder(id)
getOrderTimeline(orderId)
approveOrder(id)
rejectOrder(id)
getCustomers({ search })
getCustomerById(id)
createCustomer(data)
updateCustomer(id, data)
deleteCustomer(id)
getProducts()
createProduct(data)
updateProduct(id, data)
deleteProduct(id)
getReviews()
createReview(data)
approveReview(id)
rejectReview(id)
pinReview(id)
unpinReview(id)
getFaq()
createFaq(data)
updateFaq(id, data)
deleteFaq(id)
getTickets()
getTicketById(id)
createTicketReply(ticketId, data)
getNotifications()
markNotificationRead(id)
getCoupons()
createCoupon(data)
updateCoupon(id, data)
deleteCoupon(id)
getAnalyticsEvents()
getActivityLogs()
getSettings()
```

### التحقق من الصحة

بعد كل Agent، يجب التحقق من:

1. **التجميع:** افتح dashboard.html في المتصفح، سجل الدخول، تصفح جميع الصفحات
2. **الكونسول:** لا يوجد أخطاء في Console (F12)
3. **الشبكة:** لا يوجد طلبات API فاشلة (Tab Network)
4. **الوظائف:** اختبر CRUD لكل صفحة معدلة

### أوامر التنفيذ

```powershell
# فتح لوحة التحكم
start dashboard\dashboard.html

# تطبيق SQL (عند الحاجة)
node --dns-result-order=ipv4first scripts\apply-schema.js

# التحقق من logs
# استخدم F12 → Console tab
```
