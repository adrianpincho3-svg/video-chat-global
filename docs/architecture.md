# Arquitectura del Sistema

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente (React)                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   VideoChat  │  │  TextChat    │  │   Controls   │  │
│  │  Component   │  │  Component   │  │  Component   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         WebRTC Service (RTCPeerConnection)       │  │
│  └──────────────────────────────────────────────────┘  │
│         │                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Socket.io Client (Señalización)          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                    WebSocket (WSS)
                            │
┌─────────────────────────────────────────────────────────┐
│              Servidor (Node.js + Express)                │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │         Socket.io Server (Señalización)          │  │
│  └──────────────────────────────────────────────────┘  │
│         │                                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Matching Service (Emparejamiento)        │  │
│  │  - Cola de usuarios esperando                    │  │
│  │  - Lógica de emparejamiento aleatorio           │  │
│  │  - Gestión de salas                              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Flujo de Conexión

1. **Usuario entra a la aplicación**
   - Cliente solicita permisos de cámara/micrófono
   - Se conecta al servidor vía WebSocket
   - Se añade a la cola de espera

2. **Emparejamiento**
   - Servidor busca otro usuario disponible
   - Crea una sala única para ambos usuarios
   - Notifica a ambos clientes

3. **Establecimiento de WebRTC**
   - Usuario A crea oferta SDP
   - Servidor retransmite oferta a Usuario B
   - Usuario B crea respuesta SDP
   - Servidor retransmite respuesta a Usuario A
   - Intercambio de candidatos ICE
   - Conexión peer-to-peer establecida

4. **Comunicación**
   - Video/audio fluye directamente entre peers (P2P)
   - Mensajes de texto van a través del servidor
   - Estado de conexión monitoreado

5. **Finalización**
   - Usuario presiona "Siguiente" o "Salir"
   - Se cierra conexión WebRTC
   - Usuario vuelve a cola de espera (si busca siguiente)

## Eventos Socket.io

### Cliente → Servidor
- `join-queue`: Usuario listo para emparejamiento
- `offer`: Oferta SDP de WebRTC
- `answer`: Respuesta SDP de WebRTC
- `ice-candidate`: Candidato ICE
- `message`: Mensaje de texto
- `next-partner`: Buscar nuevo compañero
- `disconnect`: Usuario se desconecta

### Servidor → Cliente
- `matched`: Emparejamiento exitoso
- `offer`: Retransmisión de oferta
- `answer`: Retransmisión de respuesta
- `ice-candidate`: Retransmisión de candidato ICE
- `message`: Mensaje de texto del compañero
- `partner-disconnected`: Compañero se desconectó
- `waiting`: En cola de espera

## Estructura de Datos

### Usuario (en memoria del servidor)
```javascript
{
  socketId: string,
  partnerId: string | null,
  roomId: string | null,
  isWaiting: boolean
}
```

### Sala
```javascript
{
  roomId: string,
  users: [socketId1, socketId2]
}
```
