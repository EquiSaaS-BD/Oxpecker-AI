from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    # Mock aggregation data for the user dashboard
    return {
        "user": {
            "name": current_user.full_name,
            "age": current_user.age or 30,
            "bloodGroup": current_user.blood_group or "O+",
            "height": current_user.height or "5'8\"",
            "weight": current_user.weight or "70 kg"
        },
        "healthScore": {
            "score": 85,
            "label": "খুব ভালো",
            "trend": "up",
            "trendLabel": "গত মাসের চেয়ে +৫%"
        },
        "reminders": [
            {"id": "1", "name": "Napa Extend", "time": "08:00 AM", "dosage": "1 Pill", "taken": True, "overdue": False},
            {"id": "2", "name": "Sergel 20mg", "time": "02:00 PM", "dosage": "1 Capsule", "taken": False, "overdue": True},
        ]
    }
