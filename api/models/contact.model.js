import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Name is required."],
        trim: true,
        match: /^[a-zA-Z\s]+$/,
        minLength: [3, "Name must be at least 3 characters long."],
        maxLength: [50, "Name must be at most 50 characters long."]
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required."],
        trim: true,
        match: /^[0-9]{11}$/
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        trim: true,
        match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        unique: true
    },
    massage: {
        type: String,
        required: [true, "Message is required."],
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

const Contact = mongoose.model('Contact', ContactSchema);

export default Contact;