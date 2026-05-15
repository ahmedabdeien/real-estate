# نشر تطبيق الحسابات على دومين مستقل

## الخطوات

### 1. رفع على Vercel (دومين منفصل)

```bash
# داخل مجلد accounting-app
cd accounting-app
npm install
```

ثم من Vercel Dashboard:
- New Project → Import from GitHub
- اختر نفس الـ repo
- **Root Directory**: `accounting-app`
- Environment Variables:
  ```
  VITE_API_URL=https://your-app.up.railway.app/api
  ```
- اضغط Deploy

ستحصل على رابط مثل: `https://elsarh-accounts.vercel.app`

### 2. تحديث CORS في Backend

في Railway → Variables، أضف الدومين الجديد لـ ALLOWED_ORIGINS:
```
ALLOWED_ORIGINS=real-estate-mu-sandy-14.vercel.app,elsarh-accounts.vercel.app
```

### 3. الصلاحيات
- فقط **Admin** و **موظفي قسم الحسابات** يمكنهم تسجيل الدخول
- محاولات تسجيل الدخول محدودة (5 محاولات ثم حظر 15 دقيقة)
- جميع العمليات تتطلب توكن صالح
- الصفحة مُعلَّمة `noindex` — لا تظهر في محركات البحث
- Headers أمنية كاملة (CSP, X-Frame-Options, etc.)
