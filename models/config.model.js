import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
    siteName: { type: String, default: 'الصرح للعقارات' },
    logo: { type: String, default: '/assets/images/logoElsarh.png' },
    primaryColor: { type: String, default: '#8A6924' },
    accentColor: { type: String, default: '#DFBA6B' },
    mapsApiKey: { type: String, default: '' },
    hero: {
        title: {
            en: { type: String, default: 'Find Your Dream Home' },
            ar: { type: String, default: 'ابحث عن منزل أحلامك' }
        },
        subtitle: {
            en: { type: String, default: 'The best real estate platform in Egypt' },
            ar: { type: String, default: 'أفضل منصة عقارية في مصر' }
        },
        images: [{ type: String }]
    },
    contact: {
        phone: { type: String, default: '+20 121 262 2210' },
        email: { type: String, default: 'elsarhegypt@gmail.com' },
        hotline: { type: String, default: '19000' },
        maadiBranchAddress: { type: String, default: '14 Mokhtar St, New Maadi, Cairo, Egypt' },
        maadiBranchLink: { type: String, default: 'https://maps.app.goo.gl/X7yrBmiK7zjvaVB59' },
        beniSuefBranchAddress: { type: String, default: 'Mohamed Hamida St, Beni Suef' },
        beniSuefBranchLink: { type: String, default: 'https://maps.app.goo.gl/UW32R6UBaoMqSCqT6' }
    },
    socialLinks: {
        facebook: { type: String, default: 'https://facebook.com/elsarh' },
        instagram: { type: String, default: 'https://instagram.com/elsarh' },
        whatsapp: { type: String, default: 'https://wa.me/201212622210' },
        youtube: { type: String, default: '' },
        tiktok: { type: String, default: '' },
        linkedin: { type: String, default: '' },
    },
    services: {
        s1: { title: { type: String, default: 'تطوير عقاري متكامل' }, desc: { type: String, default: 'إدارة شاملة للمشروع من الفكرة حتى التسليم.' } },
        s2: { title: { type: String, default: 'استشارات قانونية' }, desc: { type: String, default: 'ضمان أمان استثماراتك وشفافية جميع التعاقدات.' } },
        s3: { title: { type: String, default: 'إدارة المرافق' }, desc: { type: String, default: 'خدمات صيانة وإدارة تضمن قيمة عقارك.' } },
        s4: { title: { type: String, default: 'استثمار ذكي' }, desc: { type: String, default: 'فرص استثمارية مدروسة تحقق أعلى العوائد.' } },
    },
    translations: {
        en: { type: Map, of: String, default: {} },
        ar: { type: Map, of: String, default: {} }
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);

export default Config;
