# Multi-stage build para optimizar tamaño de imagen

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Instalar dependencias
RUN npm ci --workspace=packages/backend

# Copiar código fuente
COPY packages/backend ./packages/backend
COPY tsconfig.json ./

# Compilar TypeScript
RUN npm run build --workspace=packages/backend

# Stage 2: Production
FROM node:18-alpine

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Instalar solo dependencias de producción
RUN npm ci --workspace=packages/backend --omit=dev

# Copiar código compilado desde builder
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/src/migrations ./packages/backend/src/migrations

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "packages/backend/dist/server.js"]
