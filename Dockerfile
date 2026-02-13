# Dockerfile para Railway
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package files del backend
COPY packages/backend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente del backend
COPY packages/backend/ ./

# Exponer puerto
EXPOSE 4000

# Comando de inicio
CMD ["npm", "start"]
