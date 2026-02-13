# Multi-stage build para optimizar tamaño de imagen

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/

# Instalar dependencias
RUN npm ci --workspace=packages/frontend

# Copiar código fuente
COPY packages/frontend ./packages/frontend

# Build de producción
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build --workspace=packages/frontend

# Stage 2: Production con Nginx
FROM nginx:alpine

# Copiar archivos compilados
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]
