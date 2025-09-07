from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime

Sex = Literal["M", "F", "O"]

class VitalEvent(BaseModel):
    patient_id: str = Field(..., description="Unique patient identifier")
    ts: datetime = Field(..., description="Event timestamp (ISO 8601)")
    heart_rate: float = Field(..., ge=20, le=250)
    systolic_bp: float = Field(..., ge=40, le=300)
    diastolic_bp: float = Field(..., ge=20, le=200)
    temperature_c: float = Field(..., ge=30, le=45)
    spo2: float = Field(..., ge=0, le=100)
    resp_rate: float = Field(..., ge=4, le=80)
    age: int = Field(..., ge=0, le=120)
    sex: Sex = Field(...)

    @field_validator("ts", mode="before")
    @classmethod
    def parse_ts(cls, v):
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace("Z","+00:00"))
        return v
