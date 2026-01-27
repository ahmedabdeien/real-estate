import nodemailer from 'nodemailer';

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
