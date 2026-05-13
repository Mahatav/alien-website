FROM python:3.12-slim

WORKDIR /app

COPY server.py .
COPY home/ home/
COPY terminal/ terminal/
COPY data/ data/

EXPOSE 8080

ENV PORT=8080

CMD ["python", "-u", "server.py"]
