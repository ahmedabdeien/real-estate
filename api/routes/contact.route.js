import express from 'express';
import Contact from "../models/contact.model.js";

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, phone, email, message } = req.body;
    try {
        console.log('Received contact form submission:', { name, phone, email, message });

        const newContact = new Contact({
            fullName: name,
            phoneNumber: phone,
            email,
            massage: message
        });
        
        await newContact.save();
        console.log('Contact saved successfully');
        res.status(200).json({ msg: 'Message sent successfully' });
    } catch (error) {
        console.error('Error saving contact:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            res.status(400).json({ msg: 'This email is already in use. Please use a different email address.' });
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