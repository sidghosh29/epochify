from pathlib import Path
from urllib.parse import urlencode
from fastapi import FastAPI, Form, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from models import ConvertRequest
import pytz
from datetime import datetime

BASE_DIR = Path(__file__).parent

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Epochify", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
async def index(
    request: Request,
    direction: str = "epoch_to_date",
    value: str = "",
    timezone: str = "UTC",
    unit: str = "seconds"
):
    result = convert_logic(value, direction, timezone, unit) if value else None
    return templates.TemplateResponse("index.html", {
        "request": request,
        "input": {"direction": direction, "value": value, "timezone": timezone, "unit": unit},
        "result": result
    })


@app.post("/", response_class=HTMLResponse)
async def convert_html(
    direction: str = Form(...),
    value: str = Form(...),
    timezone: str = Form("UTC"),
    unit: str = Form("seconds")
):
    return RedirectResponse(
        url="/?" + urlencode({"direction": direction,
                             "value": value, "timezone": timezone, "unit": unit}) + "#converters",
        status_code=303
    )


@app.get("/epoch-clock", response_class=HTMLResponse)
async def epoch_clock(request: Request):
    return templates.TemplateResponse("epoch-clock.html", {"request": request})


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/about", response_class=HTMLResponse)
async def about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})


@app.get("/privacy", response_class=HTMLResponse)
async def privacy(request: Request):
    return templates.TemplateResponse("privacy.html", {"request": request})


@app.get("/contact", response_class=HTMLResponse)
async def contact_get(request: Request):
    return templates.TemplateResponse("contact.html", {"request": request})


@app.post("/api/v1/convert")
@limiter.limit("60/minute")
async def convert_api(request: Request, payload: ConvertRequest):
    result = convert_logic(payload.value, payload.direction,
                           payload.timezone, payload.unit)
    return {"result": result}


def convert_logic(value: str, direction: str, timezone: str, unit: str) -> dict:
    try:
        tz = pytz.timezone(timezone)
    except pytz.exceptions.UnknownTimeZoneError:
        return {"error": f"Unknown timezone: '{timezone}'"}

    multipliers = {"seconds": 1, "milliseconds": 1000,
                   "microseconds": 1_000_000}
    if unit not in multipliers:
        return {"error": f"Invalid unit: '{unit}'. Must be seconds, milliseconds, or microseconds."}
    multiplier = multipliers[unit]

    if direction == "epoch_to_date":
        try:
            epoch_value = float(value)
        except (ValueError, TypeError):
            return {"error": "Value must be a number for epoch_to_date conversion."}
        try:
            dt_utc = datetime.fromtimestamp(
                epoch_value / multiplier, tz=pytz.UTC)
            dt_local = dt_utc.astimezone(tz)
        except (OverflowError, OSError, ValueError):
            return {"error": "Timestamp is out of supported range."}
        return {
            "input": value,
            "output": dt_local.strftime("%a, %d %b %Y %H:%M:%S %Z"),
            "unit": unit
        }
    else:  # date_to_epoch
        dt_naive = None
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                dt_naive = datetime.strptime(value, fmt)
                break
            except ValueError:
                continue
        if dt_naive is None:
            return {"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS or YYYY-MM-DD."}
        try:
            dt_local = tz.localize(dt_naive)
        except pytz.exceptions.AmbiguousTimeError:
            return {"error": "Ambiguous local time for the selected timezone."}
        except pytz.exceptions.NonExistentTimeError:
            return {"error": "Invalid local time for the selected timezone."}
        dt_utc = dt_local.astimezone(pytz.UTC)
        try:
            epoch = dt_utc.timestamp() * multiplier
        except (OverflowError, OSError, ValueError):
            return {"error": "Date is out of supported range."}
        return {
            "input": value,
            "output": int(epoch),
            "readable": dt_local.strftime("%a, %d %b %Y %H:%M:%S %Z"),
            "unit": unit
        }
