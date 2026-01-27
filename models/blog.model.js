import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
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
    excerpt: {
        en: { type: String },
        ar: { type: String }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending Approval', 'Published', 'Hidden'],
        default: 'Draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
