import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
    siteName: { type: String, default: 'El Sarh Real Estate' },
    logo: { type: String, default: '/assets/images/logoElsarh.png' },
    primaryColor: { type: String, default: '#005B94' },
    accentColor: { type: String, default: '#5BC1D7' },
    mapsApiKey: { type: String, default: '' },
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
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);

export default Config;
