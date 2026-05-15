#!/bin/bash
# ─── النشر الكامل ───────────────────────────────────────────────────────────
# استخدم: ./deploy.sh "وصف التغيير"
# أو بدون رسالة: ./deploy.sh

set -e

MSG="${1:-update}"
BRANCH="main"

echo ""
echo "🔄  بناء الـ Client..."
cd client && npm run build --silent && cd ..

echo "📦  إضافة الملفات..."
git add -A

# Skip if nothing to commit
if git diff --cached --quiet; then
  echo "⚡  لا توجد تغييرات جديدة للرفع"
else
  echo "💾  حفظ التغييرات: $MSG"
  git commit -m "$MSG"
  echo "🚀  رفع على GitHub..."
  git push origin $BRANCH
fi

echo "🌐  نشر على Vercel..."
vercel deploy --prod --yes 2>&1 | grep -E "https://|Ready|Error|✓|✗|Aliased"

echo ""
echo "✅  تم النشر بنجاح!"
echo "🔗  الموقع: https://real-estate-mu-sandy-14.vercel.app"
echo ""
