import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
    title: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        en: { type: String, required: true },
        ar: { type: String, required: true }
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);

export default Page;
