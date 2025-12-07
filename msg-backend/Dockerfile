FROM python:3.9-slim

WORKDIR /code

# Install dependencies
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy application code
COPY ./app /code/app

# Use PORT env var provided by Render (default 8000)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
