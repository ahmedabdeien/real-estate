import express from 'express';
import Contact from "../models/contact.model.js";

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, phone, email, message } = req.body;
    
    // Add Arabic text validation
    const arabicNameRegex = /^[\p{L}\s\-']{2,50}$/u;
    if (!arabicNameRegex.test(name)) {
        return res.status(400).json({ msg: 'الاسم يجب أن يكون باللغة العربية فقط' });
    }

    try {
        const newContact = new Contact({
            fullName: name,
            phoneNumber: phone,
            email,
            message // Fixed from 'massage' to 'message'
        });
        
        await newContact.save();
        res.status(200).json({ msg: 'تم إرسال رسالتك بنجاح' });
    } catch (error) {
        console.error('Error saving contact:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            res.status(400).json({ msg: 'هذا البريد الإلكتروني قيد الاستخدام بالفعل. يرجى استخدام عنوان بريد إلكتروني مختلف.' });
        } else {
            res.status(500).json({ msg: 'Server Error', error: error.message });
        }
    }
});

// GET route for fetching all contacts
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ date: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
});

export default router;