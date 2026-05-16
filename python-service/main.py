"""
الصرح للتطوير العقاري - Python Analytics Service
FastAPI microservice for analytics and reporting
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import statistics

app = FastAPI(
    title="الصرح Analytics API",
    description="خدمة تحليلات بايثون للصرح للتطوير العقاري",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ───────────────────────────────────────────────────────────────────

class UnitData(BaseModel):
    id: str
    price: float
    area: float
    rooms: int
    floor: Optional[str] = None
    type: str
    status: str

class PriceAnalysisRequest(BaseModel):
    units: List[UnitData]

class LeadData(BaseModel):
    date: str
    source: Optional[str] = "website"

class LeadsAnalyticsRequest(BaseModel):
    leads: List[LeadData]

# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "الصرح Analytics", "timestamp": datetime.now().isoformat()}

@app.post("/analytics/units/price-analysis")
def price_analysis(req: PriceAnalysisRequest):
    """تحليل أسعار الوحدات"""
    units = req.units
    if not units:
        raise HTTPException(status_code=400, detail="لا توجد وحدات للتحليل")

    prices = [u.price for u in units if u.price > 0]
    areas = [u.area for u in units if u.area > 0]
    price_per_sqm = [u.price / u.area for u in units if u.price > 0 and u.area > 0]

    # Group by type
    by_type = {}
    for u in units:
        if u.type not in by_type:
            by_type[u.type] = []
        by_type[u.type].append(u.price)

    type_stats = {
        t: {
            "count": len(prices_list),
            "avg": round(statistics.mean(prices_list)) if prices_list else 0,
            "min": min(prices_list) if prices_list else 0,
            "max": max(prices_list) if prices_list else 0,
        }
        for t, prices_list in by_type.items()
        if prices_list
    }

    # Status distribution
    status_dist = {}
    for u in units:
        status_dist[u.status] = status_dist.get(u.status, 0) + 1

    return {
        "total_units": len(units),
        "price_stats": {
            "min": min(prices) if prices else 0,
            "max": max(prices) if prices else 0,
            "avg": round(statistics.mean(prices)) if prices else 0,
            "median": round(statistics.median(prices)) if prices else 0,
        },
        "area_stats": {
            "min": min(areas) if areas else 0,
            "max": max(areas) if areas else 0,
            "avg": round(statistics.mean(areas), 1) if areas else 0,
        },
        "price_per_sqm": {
            "avg": round(statistics.mean(price_per_sqm)) if price_per_sqm else 0,
            "min": round(min(price_per_sqm)) if price_per_sqm else 0,
            "max": round(max(price_per_sqm)) if price_per_sqm else 0,
        },
        "by_type": type_stats,
        "status_distribution": status_dist,
    }

@app.post("/analytics/leads/trends")
def leads_trends(req: LeadsAnalyticsRequest):
    """تحليل توجهات العملاء المحتملين"""
    leads = req.leads
    if not leads:
        return {"monthly": {}, "total": 0}

    monthly = {}
    source_dist = {}

    for lead in leads:
        try:
            dt = datetime.fromisoformat(lead.date.replace("Z", "+00:00"))
            key = f"{dt.year}-{str(dt.month).zfill(2)}"
            monthly[key] = monthly.get(key, 0) + 1
        except:
            pass

        src = lead.source or "website"
        source_dist[src] = source_dist.get(src, 0) + 1

    return {
        "total": len(leads),
        "monthly": dict(sorted(monthly.items())),
        "source_distribution": source_dist,
        "peak_month": max(monthly, key=monthly.get) if monthly else None,
    }

@app.get("/analytics/price-estimate")
def price_estimate(area: float, rooms: int, unit_type: str = "apartment", floor: int = 1):
    """تقدير سعر وحدة بناءً على المواصفات (بسيط)"""
    # Base prices per sqm by type (EGP)
    base_prices = {
        "apartment": 15000,
        "villa": 25000,
        "studio": 18000,
        "duplex": 20000,
        "penthouse": 30000,
        "office": 22000,
        "shop": 28000,
        "chalet": 12000,
    }

    base_per_sqm = base_prices.get(unit_type, 15000)

    # Adjustments
    room_bonus = (rooms - 2) * 0.05  # +5% per room above 2
    floor_bonus = min(floor * 0.02, 0.15)  # +2% per floor, max 15%

    multiplier = 1 + room_bonus + floor_bonus
    estimated = area * base_per_sqm * multiplier

    return {
        "estimated_price": round(estimated),
        "price_per_sqm": round(base_per_sqm * multiplier),
        "area": area,
        "rooms": rooms,
        "type": unit_type,
        "note": "تقدير تقريبي بناءً على متوسطات السوق",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
