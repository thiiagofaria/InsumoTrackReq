FROM python:3.11
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .  
ENV PYTHONPATH="/app"
CMD ["sh", "-c", "cd app && alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"]
