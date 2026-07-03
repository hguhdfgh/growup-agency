const I18n = {
  _locale: 'ar',
  _strings: {},

  ar: {
    // General
    app_name: 'GrowUp Agency',
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    search: 'بحث...',
    filter: 'تصفية',
    export: 'تصدير',
    actions: 'إجراءات',
    no_data: 'لا توجد بيانات',
    confirm: 'تأكيد',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    done: 'تم',
    all: 'الكل',
    status: 'الحالة',
    date: 'التاريخ',
    amount: 'المبلغ',
    notes: 'ملاحظات',
    select_all: 'تحديد الكل',
    selected: 'محدد',

    // Auth
    login: 'تسجيل الدخول',
    login_title: 'تسجيل الدخول إلى لوحة التحكم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login_btn: 'دخول',
    logging_in: 'جارٍ تسجيل الدخول...',
    login_error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    login_rate_limit: 'محاولات كثيرة جداً. حاول بعد دقيقة',
    session_expired: 'انتهت الجلسة. سجل دخول مرة أخرى',
    session_expiring: 'ستنتهي جلستك خلال ',
    minutes: 'دقائق',
    logout: 'تسجيل خروج',

    // Sidebar
    dashboard: 'الإحصائيات',
    orders: 'الطلبات',
    customers: 'العملاء',
    products: 'المنتجات',
    reviews: 'التقييمات',
    faq: 'الأسئلة الشائعة',
    tickets: 'تذاكر الدعم',
    abandoned: 'الطلبات المتروكة',
    notifications: 'الإشعارات',
    analytics: 'التحليلات',
    coupons: 'الكوبونات',
    content: 'المحتوى',
    activity: 'النشاطات',
    media: 'الوسائط',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',

    // Dashboard
    stats_visitors: 'الزوار',
    stats_pageviews: 'مشاهدات الصفحات',
    stats_orders: 'الطلبات',
    stats_revenue: 'الإيرادات',
    stats_conversion: 'معدل التحويل',
    stats_today: 'اليوم',
    stats_yesterday: 'أمس',
    stats_this_month: 'هذا الشهر',
    stats_last_month: 'الشهر الماضي',
    recent_orders: 'آخر الطلبات',
    top_products: 'أفضل المنتجات',
    recent_abandoned: 'آخر الطلبات المتروكة',
    view_all: 'عرض الكل',

    // Orders
    order_number: 'رقم الطلب',
    customer_name: 'اسم العميل',
    customer_email: 'البريد الإلكتروني',
    customer_phone: 'رقم الهاتف',
    product: 'المنتج',
    payment_method: 'طريقة الدفع',
    payment_proof: 'إثبات الدفع',
    order_status_pending: 'قيد الانتظار',
    order_status_approved: 'مقبول',
    order_status_rejected: 'مرفوض',
    order_status_delivered: 'تم التسليم',
    order_status_archived: 'مؤرشف',
    approve: 'قبول',
    reject: 'رفض',
    reject_reason: 'سبب الرفض',
    order_detail: 'تفاصيل الطلب',
    create_order: 'إنشاء طلب',
    edit_order: 'تعديل الطلب',
    order_timeline: 'الجدول الزمني',
    order_info: 'معلومات الطلب',
    admin_notes: 'ملاحظات الإدارة',

    // Customers
    customer_detail: 'تفاصيل العميل',
    create_customer: 'إضافة عميل',
    edit_customer: 'تعديل العميل',
    total_orders: 'إجمالي الطلبات',
    total_spent: 'إجمالي الإنفاق',
    source: 'المصدر',
    tags: 'الوسوم',
    city: 'المدينة',
    country: 'الدولة',

    // Products
    create_product: 'إضافة منتج',
    edit_product: 'تعديل المنتج',
    product_name: 'اسم المنتج',
    product_price: 'السعر',
    product_description: 'الوصف',
    product_features: 'المميزات',
    warranty_months: ' مدة الضمان',
    is_active: 'نشط',
    is_featured: 'مميز',
    sort_order: 'ترتيب',
    images: 'الصور',

    // Reviews
    review_customer: 'اسم العميل',
    review_text: 'نص التقييم',
    rating: 'التقييم',
    review_status_approved: 'مقبول',
    review_status_rejected: 'غير مقبول',
    approve_review: 'قبول التقييم',
    pin_review: 'تثبيت التقييم',
    delete_review: 'حذف التقييم',

    // FAQ
    question: 'السؤال',
    answer: 'الإجابة',
    category: 'الفئة',
    create_faq: 'إضافة سؤال',
    edit_faq: 'تعديل السؤال',
    reorder: 'ترتيب',

    // Tickets
    ticket_subject: 'الموضوع',
    ticket_description: 'الوصف',
    ticket_priority: 'الأولوية',
    priority_low: 'منخفضة',
    priority_medium: 'متوسطة',
    priority_high: 'عالية',
    ticket_status_open: 'مفتوحة',
    ticket_status_in_progress: 'قيد المعالجة',
    ticket_status_resolved: 'تم الحل',
    ticket_status_closed: 'مغلقة',
    ticket_detail: 'تفاصيل التذكرة',
    create_ticket: 'إنشاء تذكرة',
    reply: 'رد',
    send_reply: 'إرسال الرد',
    assign: 'تعيين',
    assigned_to: 'مسندة إلى',

    // Abandoned
    abandoned_stats_total: 'إجمالي المتروكة',
    abandoned_stats_contacted: 'تم التواصل',
    abandoned_stats_recovered: 'تم الاسترداد',
    abandoned_stats_lost: 'مفقودة',
    completion: 'الإكمال',
    recovery_attempts: 'محاولات الاسترداد',
    last_contact: 'آخر تواصل',
    convert_to_order: 'تحويل إلى طلب',
    edit_abandoned: 'تعديل الطلب المتروك',
    whatsapp: 'واتساب',
    call: 'اتصال',

    // Notifications
    mark_all_read: 'تحديد الكل كمقروء',
    no_notifications: 'لا توجد إشعارات',

    // Analytics
    visitors: 'الزوار',
    pageviews: 'مشاهدات الصفحات',
    bounce_rate: 'معدل الارتداد',
    conversion_rate: 'معدل التحويل',
    sales_chart: 'المبيعات',
    status_chart: 'حالات الطلبات',
    growth_chart: 'نمو العملاء',

    // Coupons
    coupon_code: 'الكود',
    discount_type: 'نوع الخصم',
    discount_value: 'قيمة الخصم',
    max_uses: 'الحد الأقصى للاستخدام',
    used_count: 'تم الاستخدام',
    expires_at: 'ينتهي في',
    percentage: 'نسبة مئوية',
    fixed: 'مبلغ ثابت',
    create_coupon: 'إضافة كوبون',
    edit_coupon: 'تعديل الكوبون',

    // Content
    hero_section: 'القسم الرئيسي',
    features_section: 'المميزات',
    stats_section: 'الإحصائيات',
    about_section: 'من نحن',
    section_title: 'العنوان',
    section_subtitle: 'العنوان الفرعي',
    section_content: 'المحتوى',

    // Settings
    general_settings: 'الإعدادات العامة',
    payment_settings: 'إعدادات الدفع',
    notification_settings: 'إعدادات الإشعارات',
    company_name: 'اسم الشركة',
    phone: 'رقم الهاتف',
    whatsapp_number: 'رقم واتساب',
    company_email: 'البريد الإلكتروني للشركة',
    address: 'العنوان',
    baridimob: 'بريدي موب',
    ccp: 'CCP',
    bank_transfer: 'تحويل بنكي',

    // Profile
    personal_info: 'المعلومات الشخصية',
    change_password: 'تغيير كلمة المرور',
    current_password: 'كلمة المرور الحالية',
    new_password: 'كلمة المرور الجديدة',
    confirm_password: 'تأكيد كلمة المرور',
    avatar: 'الصورة الشخصية',
    upload_avatar: 'رفع صورة',

    // Media
    upload_file: 'رفع ملف',
    delete_file: 'حذف الملف',
    no_files: 'لا توجد ملفات',

    // Activity
    activity_action: 'الإجراء',
    resource_type: 'نوع المورد',
    actor: 'المستخدم',
    activity_detail: 'تفاصيل النشاط',

    // Messages
    success_save: 'تم الحفظ بنجاح',
    success_delete: 'تم الحذف بنجاح',
    success_create: 'تم الإنشاء بنجاح',
    error_general: 'حدث خطأ. حاول مرة أخرى',
    error_network: 'خطأ في الاتصال',
    confirm_delete: 'هل أنت متأكد من الحذف؟',
    confirm_action: 'تأكيد الإجراء',
    no_results: 'لا توجد نتائج للبحث'
  },

  init() {
    this._strings = this.ar
  },

  t(key) {
    return this._strings[key] || key
  },

  get(key) {
    return this.t(key)
  }
}

I18n.init()
const __ = I18n.t.bind(I18n)
