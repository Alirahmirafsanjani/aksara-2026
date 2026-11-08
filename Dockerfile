# Aksara 2026 — backend Express + frontend React (satu proses, port 3000)
# Build client dari source di dalam image (client/dist tidak di-commit).
FROM node:24-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --no-audit --no-fund
COPY client/ ./
RUN npm run build

FROM node:24-slim
WORKDIR /app
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev --no-audit --no-fund
COPY server/ ./server/
COPY config/ ./config/
COPY --from=client-build /app/client/dist/ ./client/dist/
WORKDIR /app/server
EXPOSE 3000
CMD ["node", "src/index.js"]
