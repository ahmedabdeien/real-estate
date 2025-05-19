import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Name is required."],
        trim: true,
        match: [/^[\p{L}\s\-']+$/u, "Name must contain only letters and spaces"],
        minLength: [2, "Name must be at least 2 characters long."],
        maxLength: [50, "Name must be at most 50 characters long."]
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required."],
        trim: true,
        match: [/^[+0-9\u0660-\u0669\u06F0-\u06F9][0-9\u0660-\u0669\u06F0-\u06F9\s\-()]{9,14}$/, "Invalid phone number format"]
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format"],
    },
    message: {  // Fixed typo from 'massage' to 'message'
        type: String,
        required: [true, "Message is required."],
        trim: true,
        minLength: [10, "Message must be at least 10 characters long."],
        maxLength: [500, "Message must be at most 500 characters long."]
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

const Contact = mongoose.model('Contact', ContactSchema);

export default Contact;