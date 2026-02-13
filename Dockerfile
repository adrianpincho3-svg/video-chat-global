FROM node:18-slim

WORKDIR /app

# Copiar archivos del backend
COPY packages/backend/package*.json ./
RUN npm install

COPY packages/backend/ ./

# Puerto
EXPOSE 4000

# Iniciar
CMD ["npx", "tsx", "src/server.ts"]
