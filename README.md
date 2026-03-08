# Epochify

A lightweight web tool for converting between Unix epoch timestamps and human-readable dates. Built with FastAPI.

## Features

- Convert Unix timestamps to readable dates
- Convert dates to Unix timestamps
- Supports seconds, milliseconds, and microseconds
- 20+ timezone options across all major regions
- Live epoch counter on the homepage
- REST API endpoint for programmatic use

## Local Development

**Install dependencies**

```bash
pip install -r requirements.txt
```

**Run the app**

```bash
uvicorn main:app --reload
```

## API

**POST** `/api/v1/convert`

```json
{
  "value": "1700000000",
  "direction": "epoch_to_date",
  "timezone": "UTC",
  "unit": "seconds"
}
```

- `direction`: `epoch_to_date` or `date_to_epoch`
- `unit`: `seconds`, `milliseconds`, or `microseconds`
- `timezone`: any valid tz string e.g. `America/New_York`

Rate limited to 60 requests per minute per IP.

## Health Check

**GET** `/health` returns `{"status": "ok"}`

## Tech Stack

- [FastAPI](https://fastapi.tiangolo.com/)
- [Jinja2](https://jinja.palletsprojects.com/)
- [pytz](https://pythonhosted.org/pytz/)
- [slowapi](https://github.com/laurentS/slowapi)

## License

MIT
