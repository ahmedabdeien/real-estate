import Contact from "../models/contact.model.js";
import { errorHandler } from "../Utils/error.js";

export const createContact = async (req, res, next) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
        return next(errorHandler(400, "يرجى ملء جميع الحقول المطلوبة"));
    }

    try {
        const newContact = new Contact({
            name,
            email,
            phone,
            message,
        });
        await newContact.save();
        res.status(201).json({
            success: true,
            msg: "تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت.",
        });
    } catch (error) {
        next(error);
    }
};

export const getContacts = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, "غير مسموح لك بالوصول لهذه البيانات"));
    }
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, "غير مسموح لك بالحذف"));
    }
    try {
        await Contact.findByIdAndDelete(req.params.contactId);
        res.status(200).json("تم حذف الرسالة بنجاح");
    } catch (error) {
        next(error);
    }
};
