FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY models /models

ENV MODEL_PATH=/models/churn_model.joblib
ENV METRICS_PATH=/models/final_test_results.csv
ENV PORT=8080

EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]