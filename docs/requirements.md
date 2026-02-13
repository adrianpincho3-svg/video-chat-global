# Requisitos - Video Chat Aleatorio

## Requisitos Funcionales

### RF1: Conexión Aleatoria
- Los usuarios deben poder conectarse aleatoriamente con otros usuarios disponibles
- El emparejamiento debe ser automático al entrar a la aplicación
- Debe haber un botón "Siguiente" para cambiar de compañero

### RF2: Video en Tiempo Real
- Transmisión de video bidireccional usando WebRTC
- Calidad de video adaptativa según conexión
- Opción para activar/desactivar cámara

### RF3: Chat de Texto
- Mensajes de texto en tiempo real durante la videollamada
- Historial de mensajes durante la sesión actual
- Opción para activar/desactivar micrófono

### RF4: Anonimato
- No se requiere registro ni autenticación
- Los usuarios son identificados por IDs de sesión temporales
- No se almacenan datos personales

### RF5: Controles de Sesión
- Botón para finalizar conversación actual
- Botón para buscar nuevo compañero
- Indicador de estado de conexión

## Requisitos No Funcionales

### RNF1: Rendimiento
- Latencia de video < 500ms
- Tiempo de emparejamiento < 3 segundos
- Soporte para al menos 100 usuarios concurrentes

### RNF2: Seguridad
- Conexiones HTTPS/WSS en producción
- Validación de señalización WebRTC
- Protección contra spam de conexiones

### RNF3: Usabilidad
- Interfaz intuitiva y minimalista
- Responsive design (móvil y escritorio)
- Mensajes claros de estado y errores

### RNF4: Compatibilidad
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Soporte para dispositivos móviles
- Manejo de permisos de cámara/micrófono

## Tecnologías

- **Frontend**: React, Socket.io-client, WebRTC API
- **Backend**: Node.js, Express, Socket.io
- **Comunicación**: WebRTC (peer-to-peer), WebSocket (señalización)
