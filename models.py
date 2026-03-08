from pydantic import BaseModel, Field
from typing import Literal


class ConvertRequest(BaseModel):
    value: str = Field(..., description="Epoch timestamp (number) for epoch_to_date, or date string (YYYY-MM-DD HH:MM:SS) for date_to_epoch")
    direction: Literal["epoch_to_date", "date_to_epoch"] = "epoch_to_date"
    timezone: str = "UTC"  # Common TZs: UTC, Asia/Kolkata, America/New_York
    unit: Literal["seconds", "milliseconds", "microseconds"] = "seconds"
