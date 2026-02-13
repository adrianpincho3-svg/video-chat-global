# Dockerfile para Railway - Optimizado
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar SOLO los archivos necesarios del backend
COPY packages/backend/package*.json ./
COPY packages/backend/tsconfig.json ./
COPY packages/backend/.babelrc ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY packages/backend/src ./src

# Etapa final
FROM node:18-alpine

WORKDIR /app

# Copiar desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Exponer puerto
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio usando tsx directamente
CMD ["npx", "tsx", "src/server.ts"]
