FROM node:18-slim

# Download Cloud SQL Auth Proxy
RUN apt-get update && apt-get install -y curl && \
    curl -o cloud-sql-proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 && \
    chmod +x cloud-sql-proxy && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080

# Start proxy + appropriate service (app or worker) based on WORKER_MODE env var
CMD ["/bin/sh", "-c", "/cloud-sql-proxy -instances=cloud-portfolio-789:us-central1:training-db=tcp:5432 & if [ \"$WORKER_MODE\" = \"true\" ]; then npm run start:worker; else npm run start:app; fi"]
