import mongoose from 'mongoose';

const ctaSchema = new mongoose.Schema({
    label: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
    },
    link: { type: String, required: true },
    color: { type: String, default: '#005B94' }, // Primary color default
    active: { type: Boolean, default: true },
    type: { type: String, enum: ['primary', 'secondary', 'whatsapp', 'call'], default: 'primary' }
}, { timestamps: true });

const CTA = mongoose.model('CTA', ctaSchema);

export default CTA;
