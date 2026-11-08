# Backend + frontend statik (single process, port 3000)
FROM node:24-slim
WORKDIR /app
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev --no-audit --no-fund
COPY server/ ./server/
COPY client/dist/ ./client/dist/
COPY config/ ./config/
WORKDIR /app/server
EXPOSE 3000
CMD ["node", "src/index.js"]
