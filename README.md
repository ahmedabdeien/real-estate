# Real Estate Project

## تشغيل المشروع

### المتطلبات
- Node.js (يفضّل 20.11.1 كما هو محدد في `package.json`)
- npm
- MongoDB (محليًا أو عبر URI سحابي)

### 1) تثبيت الاعتماديات
```bash
npm install
npm --prefix client install
```

### 2) إعداد متغيرات البيئة
أنشئ ملف `.env` في جذر المشروع وأضف المتغيرات الأساسية (مثال):

```env
MONGO_URL=mongodb://127.0.0.1:27017/real_estate
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
```

> قد تحتاج متغيرات إضافية حسب مزايا البريد الإلكتروني/الدفع الموجودة في المشروع.

### 3) تشغيل الواجهة الخلفية والواجهة الأمامية معًا
```bash
npm run dev
```

- الواجهة الخلفية: `http://localhost:3000` (افتراضيًا حسب إعدادات الخادم)
- الواجهة الأمامية (Vite): `http://localhost:5173`

### أو تشغيل كل جزء بشكل منفصل
```bash
npm run dev:server
npm run dev:client
```

### 4) بناء نسخة الإنتاج
```bash
npm run build
```
