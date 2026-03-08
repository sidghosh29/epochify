# Epochify

Epochify is a lightweight web tool for converting between Unix epoch timestamps and human-readable dates. It is built using FastAPI and provides both a web interface and a simple REST API.

## Features

- Convert Unix timestamps to readable dates
- Convert dates to Unix timestamps
- Supports seconds, milliseconds, and microseconds
- 20+ timezone options across major regions
- Live Unix epoch counter on the homepage
- REST API endpoint for programmatic use

## Tech Stack

- FastAPI
- Jinja2
- pytz
- slowapi

## Project Structure

```
epochify/
 ├ static/
 │   └ style.css
 ├ templates/
 │   ├ base.html
 │   ├ index.html
 │   ├ about.html
 │   ├ contact.html
 │   └ privacy.html
 ├ main.py
 ├ models.py
 └ requirements.txt
```

## Local Development

### Install dependencies

```
pip install -r requirements.txt
```

### Run the application (development)

```
uvicorn main:app --reload
```

### Run the application (production)

```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## API

### Convert Timestamp

**Endpoint**

```
POST /api/v1/convert
```

**Request Body**

```
{
  "value": "1700000000",
  "direction": "epoch_to_date",
  "timezone": "UTC",
  "unit": "seconds"
}
```

### Parameters

- `direction` → `epoch_to_date` or `date_to_epoch`
- `unit` → `seconds`, `milliseconds`, or `microseconds`
- `timezone` → any valid timezone string (e.g. `America/New_York`)

### Rate Limiting

API requests are rate limited to **60 requests per minute per IP**.

## Health Check

```
GET /health
```

Returns:

```
{"status": "ok"}
```

## Code Usage

The source code in this repository is provided for reference only.
All rights are reserved by the author. The code may not be copied, modified, or redistributed without permission.
