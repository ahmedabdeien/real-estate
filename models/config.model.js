import mongoose from 'mongoose';

const bilingualStr = (defaultAr = '', defaultEn = '') => ({
    ar: { type: String, default: defaultAr },
    en: { type: String, default: defaultEn },
});

const configSchema = new mongoose.Schema({
    // ─── هوية الموقع ─────────────────────────────────────
    siteName:     { type: String, default: 'الصرح للعقارات' },
    logo:         { type: String, default: '' },
    favicon:      { type: String, default: '' },
    primaryColor: { type: String, default: '#8A6924' },
    accentColor:  { type: String, default: '#DFBA6B' },
    secondaryColor: { type: String, default: '#12283C' },
    mapsApiKey:   { type: String, default: '' },

    // ─── SEO ─────────────────────────────────────────────
    seo: {
        title:       { type: String, default: 'الصرح للاستثمار العقاري' },
        description: { type: String, default: 'أكثر من 20 عاماً من الخبرة في السوق العقاري المصري' },
        keywords:    { type: String, default: 'عقارات, استثمار, مصر, الصرح' },
    },

    // ─── قسم الهيرو ──────────────────────────────────────
    hero: {
        title:    bilingualStr('نصنع مستقبلاً يليق بطموحاتك', 'We Build a Future Worth Your Ambitions'),
        subtitle: bilingualStr('شركة الصرح للاستثمار العقاري — معايير عالمية في البناء والتصميم منذ 2004', 'Al-Sarh Real Estate Investment — World-class standards since 2004'),
        images:   [{ type: String }],
        badge:    { type: String, default: 'ابتكار معماري' },
        ctaPrimary:   { type: String, default: 'استكشف مشاريعنا' },
        ctaSecondary: { type: String, default: 'استشارة مجانية' },
    },

    // ─── إحصائيات الشركة ─────────────────────────────────
    stats: {
        projects:    { type: String, default: '150+' },
        experience:  { type: String, default: '20+' },
        clients:     { type: String, default: '50K+' },
        units:       { type: String, default: '500+' },
    },

    // ─── قسم من نحن (الرئيسية) ───────────────────────────
    about: {
        badge:       { type: String, default: 'إرث يمتد منذ 2004' },
        title:       bilingualStr('رؤية عقارية تتجاوز الحدود', 'A Real Estate Vision Beyond Limits'),
        description: bilingualStr('منذ انطلاقتنا في عام 2004، أعدنا تعريف مفهوم السكن الفاخر في مصر.', 'Since 2004, we redefined luxury living in Egypt.'),
        image:       { type: String, default: '' },
        ctaText:     { type: String, default: 'اكتشف قصتنا' },
        yearsLabel:  { type: String, default: 'عاماً من الخبرة' },
        projectsLabel: { type: String, default: 'مشروع منجز' },
    },

    // ─── قسم الخدمات ─────────────────────────────────────
    services: {
        s1: { title: { type: String, default: 'تطوير عقاري متكامل' },   desc: { type: String, default: 'إدارة شاملة للمشروع من الفكرة حتى التسليم بأعلى معايير الجودة.' } },
        s2: { title: { type: String, default: 'استشارات قانونية' },      desc: { type: String, default: 'ضمان أمان استثماراتك وشفافية كاملة في جميع التعاقدات.' } },
        s3: { title: { type: String, default: 'إدارة المرافق' },         desc: { type: String, default: 'خدمات صيانة وإدارة متكاملة تضمن الحفاظ على قيمة عقارك.' } },
        s4: { title: { type: String, default: 'استثمار ذكي' },           desc: { type: String, default: 'فرص استثمارية مدروسة تحقق أعلى العوائد بأقل المخاطر.' } },
    },

    // ─── إعدادات الفوتر ──────────────────────────────────
    footer: {
        about:        { type: String, default: 'منذ عام 2004 ونحن نعيد تعريف مفهوم السكن الفاخر في مصر.' },
        copyright:    { type: String, default: 'جميع الحقوق محفوظة' },
        workingHours: { type: String, default: 'السبت - الخميس: 10:00 - 17:00' },
        showMap:      { type: Boolean, default: false },
    },

    // ─── التواصل ──────────────────────────────────────────
    contact: {
        phone:                { type: String, default: '+20 121 262 2210' },
        email:                { type: String, default: 'elsarhegypt@gmail.com' },
        hotline:              { type: String, default: '19000' },
        maadiBranchAddress:   { type: String, default: '14 شارع مختار، المعادي الجديدة، القاهرة' },
        maadiBranchLink:      { type: String, default: 'https://maps.app.goo.gl/X7yrBmiK7zjvaVB59' },
        beniSuefBranchAddress:{ type: String, default: 'شارع محمد حميدة، بني سويف' },
        beniSuefBranchLink:   { type: String, default: 'https://maps.app.goo.gl/UW32R6UBaoMqSCqT6' },
    },

    // ─── وسائل التواصل الاجتماعي ─────────────────────────
    socialLinks: {
        facebook:  { type: String, default: 'https://facebook.com/elsarh' },
        instagram: { type: String, default: 'https://instagram.com/elsarh' },
        whatsapp:  { type: String, default: 'https://wa.me/201212622210' },
        youtube:   { type: String, default: '' },
        tiktok:    { type: String, default: '' },
        linkedin:  { type: String, default: '' },
        x:         { type: String, default: '' },
    },

    // ─── الترجمات ─────────────────────────────────────────
    translations: {
        en: { type: Map, of: String, default: {} },
        ar: { type: Map, of: String, default: {} },
    },

    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);
export default Config;
