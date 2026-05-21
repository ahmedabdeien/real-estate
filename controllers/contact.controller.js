import nodemailer from 'nodemailer';
import { sendWhatsApp, WA_MESSAGES } from "../services/whatsapp.service.js";
import User from '../models/user.model.js';
import { createNotification } from './notification.controller.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const createContact = async (req, res, next) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
        return next(errorHandler(400, "يرجى ملء جميع الحقول المطلوبة"));
    }

    // Arabic name validation (basic regex for Arabic characters)
    const arabicRegex = /^[\u0600-\u06FF\s]+$/;
    if (!arabicRegex.test(name)) {
        return next(errorHandler(400, "يرجى إدخال الاسم باللغة العربية"));
    }

    try {
        const newContact = new Contact({
            name,
            email,
            phone,
            message,
        });
        await newContact.save();

        // Send Email Notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Contact Message - El Sarh',
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email Error: ", error);
            }
        });

        // Notify all admin users
        try {
            const admins = await User.find({ role: "admin" }).select("_id");
            for (const admin of admins) {
                await createNotification({
                    userId: admin._id,
                    type: "new_message",
                    title: "رسالة جديدة من عميل",
                    body: `من: ${name}`,
                    link: "/admin/leads",
                });
            }
        } catch (notifErr) {
            console.error("Notification error:", notifErr.message);
        }

        // WhatsApp notification to admin
        try {
            const adminWa = process.env.ADMIN_WHATSAPP;
            if (adminWa) {
                await sendWhatsApp(adminWa, WA_MESSAGES.newLead({ name, phone, projectName: "استفسار عام", message }));
            }
            // Welcome to client
            if (phone) await sendWhatsApp(phone, WA_MESSAGES.welcome({ name }));
        } catch (waErr) {
            console.error("[WhatsApp-Contact]", waErr.message);
        }

        res.status(201).json({
            success: true,
            msg: "تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت.",
        });
    } catch (error) {
        next(error);
    }
};

export const getContacts = async (req, res, next) => {
    if (req.user.role !== 'Admin') {
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
    if (req.user.role !== 'Admin') {
        return next(errorHandler(403, "غير مسموح لك بالحذف"));
    }
    try {
        await Contact.findByIdAndDelete(req.params.contactId);
        res.status(200).json("تم حذف الرسالة بنجاح");
    } catch (error) {
        next(error);
    }
};
