# 🎥 Integración con Jitsi Meet

## ¿Qué es Jitsi Meet?

Jitsi Meet es una plataforma de videoconferencia **open source** y **gratuita** que proporciona:

- ✅ Infraestructura pública gratuita
- ✅ Video HD de alta calidad
- ✅ Sin límites de tiempo
- ✅ Sin necesidad de cuenta
- ✅ Compatible con todos los navegadores
- ✅ Código abierto y auditable

## ¿Por qué Jitsi?

Tu aplicación ahora puede conectarse a la infraestructura pública de Jitsi Meet, lo que significa:

1. **Escalabilidad**: Jitsi maneja millones de usuarios
2. **Confiabilidad**: Infraestructura probada y estable
3. **Costo**: Completamente gratis
4. **Legal**: API pública y open source
5. **Calidad**: Video HD con baja latencia

## Cómo Funciona

### Flujo de Usuario

```
1. Usuario selecciona "Usar Jitsi Meet" en la página de inicio
2. Configura filtros (categoría, género, región)
3. Sistema busca pareja compatible
4. Cuando encuentra match, crea sala Jitsi única
5. Ambos usuarios se conectan a la misma sala
6. Chat de video usando infraestructura de Jitsi
```

### Arquitectura

```
Tu Frontend → Tu Backend → Jitsi Meet (meet.jit.si)
                ↓
         Matching Logic
         Session Management
         User Filtering
```

## Características Implementadas

### Backend

1. **JitsiIntegrationService** (`packages/backend/src/services/JitsiIntegrationService.ts`)
   - Genera nombres de sala únicos
   - Crea configuración de sala
   - Gestiona autenticación (opcional)
   - Proporciona información de instancia

2. **Jitsi Handlers** (`packages/backend/src/handlers/jitsiHandlers.ts`)
   - Maneja matching de usuarios
   - Crea salas cuando hay match
   - Notifica a ambos usuarios

3. **API REST** (`packages/backend/src/routes/jitsi.ts`)
   - `GET /api/jitsi/info` - Información de instancia
   - `POST /api/jitsi/create-room` - Crear sala
   - `GET /api/jitsi/room/:roomName/status` - Estado de sala
   - `GET /api/jitsi/room/:roomName/stats` - Estadísticas
   - `DELETE /api/jitsi/room/:roomName` - Cerrar sala

### Frontend

1. **JitsiMeeting Component** (`packages/frontend/src/components/JitsiMeeting.tsx`)
   - Integra Jitsi External API
   - Maneja eventos de sala
   - Configura interfaz personalizada

2. **JitsiChatPage** (`packages/frontend/src/pages/JitsiChatPage.tsx`)
   - Página completa de chat con Jitsi
   - Integra filtros y matching
   - Maneja estados de conexión

## Uso

### Para Usuarios

1. Ve a la página de inicio
2. Click en "Usar Jitsi Meet"
3. Selecciona tus preferencias
4. Click en "Buscar Pareja"
5. ¡Conecta con alguien!

### URLs

- **Chat con Jitsi**: `/chat/jitsi`
- **Chat WebRTC Nativo**: `/chat`

## Configuración

### Variables de Entorno (Opcional)

Si quieres usar tu propia instancia de Jitsi:

```env
# Backend (.env)
JITSI_DOMAIN=tu-jitsi.com
JITSI_APP_ID=tu-app-id
JITSI_SECRET=tu-secret-key
```

Si no configuras estas variables, se usa la instancia pública `meet.jit.si`.

### Instancia Pública vs Privada

**Instancia Pública (meet.jit.si)**
- ✅ Gratis
- ✅ Sin configuración
- ✅ Alta disponibilidad
- ❌ Sin control total
- ❌ Sin estadísticas detalladas

**Instancia Privada**
- ✅ Control total
- ✅ Estadísticas completas
- ✅ Personalización avanzada
- ✅ Grabación de sesiones
- ❌ Requiere servidor
- ❌ Costos de hosting

## Ventajas sobre WebRTC Nativo

| Característica | WebRTC Nativo | Jitsi Meet |
|----------------|---------------|------------|
| Infraestructura | Tu servidor | Jitsi (gratis) |
| Escalabilidad | Limitada | Ilimitada |
| Calidad | Buena | Excelente |
| Configuración | Compleja | Simple |
| Costo | Hosting propio | Gratis |
| Mantenimiento | Tu responsabilidad | Jitsi |

## Comparación con Otras Plataformas

### Jitsi vs Omegle/Monkey

**Jitsi Meet:**
- ✅ Legal y ético
- ✅ API pública
- ✅ Open source
- ✅ Documentación completa
- ✅ Soporte oficial

**Omegle/Monkey:**
- ❌ Sin API pública
- ❌ Términos de servicio restrictivos
- ❌ Riesgos legales
- ❌ Protocolos propietarios

## Personalización

### Configuración de Sala

Puedes personalizar las salas Jitsi editando `JitsiIntegrationService.ts`:

```typescript
config: {
  // Configuración de video
  resolution: 720,
  startWithAudioMuted: false,
  startWithVideoMuted: false,
  
  // Botones de toolbar
  toolbarButtons: [
    'microphone',
    'camera',
    'chat',
    'hangup',
    // ... más botones
  ],
  
  // Branding
  APP_NAME: 'Tu App',
  SHOW_JITSI_WATERMARK: false,
}
```

### Interfaz Personalizada

Edita `JitsiMeeting.tsx` para personalizar la interfaz:

```typescript
interfaceConfigOverwrite: {
  APP_NAME: 'Random Video Chat',
  SHOW_JITSI_WATERMARK: false,
  MOBILE_APP_PROMO: false,
  // ... más opciones
}
```

## Monitoreo

### Logs del Backend

```bash
# Ver logs de matching con Jitsi
npm run dev --workspace=packages/backend

# Buscar logs específicos
grep "Jitsi" logs/backend.log
```

### Métricas

Las métricas de Jitsi están disponibles en:
- Panel de administrador
- API REST: `/api/jitsi/room/:roomName/stats`

## Troubleshooting

### Problema: No se carga Jitsi

**Solución:**
- Verifica que el script de Jitsi se cargue: `https://meet.jit.si/external_api.js`
- Revisa la consola del navegador
- Verifica que HTTPS esté habilitado

### Problema: No se encuentra pareja

**Solución:**
- Verifica que el backend esté corriendo
- Revisa logs del servidor
- Verifica conexión Socket.io

### Problema: Video no funciona

**Solución:**
- Acepta permisos de cámara/micrófono
- Verifica que HTTPS esté habilitado
- Prueba en Chrome o Firefox

## Próximos Pasos

### Mejoras Posibles

1. **Instancia Privada de Jitsi**
   - Mayor control
   - Estadísticas detalladas
   - Grabación de sesiones

2. **Integración con Más Plataformas**
   - Matrix Protocol (federado)
   - WebRTC SFU públicos
   - Otros servicios open source

3. **Características Avanzadas**
   - Compartir pantalla
   - Grabación de sesiones
   - Transcripción en tiempo real
   - Traducción automática

## Recursos

- [Jitsi Meet](https://meet.jit.si)
- [Jitsi Handbook](https://jitsi.github.io/handbook/)
- [Jitsi External API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [Jitsi GitHub](https://github.com/jitsi/jitsi-meet)

## Licencia

Jitsi Meet es open source bajo licencia Apache 2.0.

---

**¿Preguntas?** Revisa la documentación de Jitsi o abre un issue en GitHub.

