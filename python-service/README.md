# خدمة التحليلات - Python FastAPI

## التشغيل المحلي
```bash
pip install -r requirements.txt
python main.py
```

## النشر على Railway
1. من Railway dashboard، أضف خدمة جديدة "Python Service"
2. اضبط Root Directory على `python-service`
3. Start command: `uvicorn main.py:app --host 0.0.0.0 --port $PORT`

## المسارات المتاحة
- `GET /health` — فحص حالة الخدمة
- `POST /analytics/units/price-analysis` — تحليل أسعار الوحدات
- `POST /analytics/leads/trends` — تحليل توجهات العملاء
- `GET /analytics/price-estimate?area=100&rooms=3&unit_type=apartment` — تقدير السعر
