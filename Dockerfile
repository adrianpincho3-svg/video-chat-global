FROM node:18-slim

WORKDIR /app

# Copiar package.json primero (para aprovechar caché de Docker)
COPY packages/backend/package.json packages/backend/package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY packages/backend/src ./src
COPY packages/backend/tsconfig.json ./tsconfig.json
COPY packages/backend/.babelrc ./.babelrc

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=4000

# Exponer puerto
EXPOSE 4000

# Comando de inicio
CMD ["npx", "tsx", "src/server.ts"]
