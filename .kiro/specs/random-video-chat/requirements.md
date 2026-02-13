# Documento de Requisitos: Random Video Chat

## Introducción

Random Video Chat es una aplicación web que permite a usuarios anónimos conectarse aleatoriamente mediante video y texto en tiempo real, similar a Omegle. El sistema utiliza WebRTC para comunicación peer-to-peer, Socket.io para señalización, y React para la interfaz de usuario. La arquitectura está diseñada para soportar federación futura con otros servidores, permitiendo una red distribuida de chat aleatorio.

## Glosario

- **Sistema**: La aplicación completa de Random Video Chat (frontend + backend)
- **Usuario**: Persona que utiliza la aplicación para chatear
- **Sesión_de_Chat**: Conexión activa entre dos participantes (usuarios o bots)
- **Servidor_de_Señalización**: Componente backend que coordina conexiones WebRTC usando Socket.io
- **Bot_IA**: Agente automatizado que simula conversación cuando no hay usuarios reales disponibles
- **Enlace_Compartible**: URL única que permite a usuarios externos unirse a una sesión específica
- **Cola_de_Espera**: Lista de usuarios esperando ser emparejados
- **Filtro_de_Emparejamiento**: Preferencia del usuario sobre el tipo de pareja que desea encontrar
- **Categoría_de_Usuario**: Clasificación del usuario (Masculino, Femenino, o Pareja)
- **Región**: Ubicación geográfica del usuario (país o continente)
- **Filtro_de_Región**: Preferencia del usuario sobre la región geográfica de su pareja
- **Administrador**: Usuario con privilegios elevados para supervisar y moderar el sistema
- **Panel_de_Administrador**: Interfaz web privada para gestión y supervisión del sistema
- **Reporte_de_Usuario**: Denuncia de comportamiento inapropiado o contenido ofensivo
- **Peer**: Participante en una conexión WebRTC (puede ser usuario o bot)
- **Federación**: Capacidad de conectar múltiples servidores independientes en una red distribuida
- **WebRTC**: Tecnología de comunicación en tiempo real peer-to-peer
- **ICE_Candidate**: Información de conectividad de red para establecer conexiones WebRTC
- **SDP_Offer**: Descripción de sesión WebRTC para iniciar negociación
- **SDP_Answer**: Respuesta a una oferta SDP para completar negociación WebRTC

## Requisitos

### Requisito 1: Filtros de Emparejamiento

**User Story:** Como usuario, quiero poder elegir con quién quiero ser emparejado antes de iniciar el videochat, para tener conversaciones con el tipo de persona que prefiero.

#### Criterios de Aceptación

1. WHEN un usuario accede a la pantalla de inicio de chat, THE Sistema SHALL mostrar opciones de Filtro_de_Emparejamiento: Masculino, Femenino, o Parejas
2. WHEN un usuario selecciona un Filtro_de_Emparejamiento, THE Sistema SHALL almacenar la preferencia para el proceso de emparejamiento
3. WHEN un usuario solicita iniciar chat, THE Sistema SHALL requerir que el usuario especifique su propia Categoría_de_Usuario
4. WHEN el sistema valida la Categoría_de_Usuario, THE Sistema SHALL aceptar únicamente los valores: Masculino, Femenino, o Pareja
5. WHEN un usuario no selecciona un Filtro_de_Emparejamiento, THE Sistema SHALL usar "Cualquiera" como valor predeterminado

### Requisito 2: Emparejamiento Aleatorio con Filtros

**User Story:** Como usuario, quiero ser emparejado aleatoriamente con otro usuario que cumpla mis preferencias de filtro, para tener conversaciones con el tipo de persona que busco.

#### Criterios de Aceptación

1. WHEN un usuario solicita iniciar un chat con un Filtro_de_Emparejamiento específico, THE Sistema SHALL agregar al usuario a la Cola_de_Espera con sus preferencias
2. WHEN hay dos o más usuarios en la Cola_de_Espera, THE Sistema SHALL emparejar usuarios cuyas preferencias sean compatibles y crear una Sesión_de_Chat
3. WHEN el sistema evalúa compatibilidad, THE Sistema SHALL verificar que la Categoría_de_Usuario de cada usuario coincida con el Filtro_de_Emparejamiento del otro
4. WHEN un usuario es emparejado, THE Sistema SHALL remover ambos usuarios de la Cola_de_Espera
5. WHEN no hay usuarios disponibles que cumplan el filtro, THE Sistema SHALL mantener al usuario en la Cola_de_Espera hasta que un usuario compatible esté disponible
6. WHEN un usuario cancela la búsqueda, THE Sistema SHALL remover al usuario de la Cola_de_Espera

### Requisito 3: Comunicación por Video WebRTC

**User Story:** Como usuario, quiero comunicarme por video en tiempo real con mi pareja de chat, para tener una experiencia de conversación más personal y auténtica.

#### Criterios de Aceptación

1. WHEN una Sesión_de_Chat es creada, THE Sistema SHALL iniciar negociación WebRTC entre los dos Peers
2. WHEN el Servidor_de_Señalización recibe un SDP_Offer, THE Sistema SHALL retransmitir la oferta al Peer correspondiente
3. WHEN el Servidor_de_Señalización recibe un SDP_Answer, THE Sistema SHALL retransmitir la respuesta al Peer correspondiente
4. WHEN el Servidor_de_Señalización recibe ICE_Candidates, THE Sistema SHALL retransmitir los candidatos al Peer correspondiente
5. WHEN la conexión WebRTC se establece exitosamente, THE Sistema SHALL transmitir video y audio directamente entre Peers sin pasar por el servidor
6. IF la conexión WebRTC falla después de 30 segundos, THEN THE Sistema SHALL notificar a ambos usuarios del error

### Requisito 4: Chat de Texto en Tiempo Real

**User Story:** Como usuario, quiero enviar mensajes de texto durante la sesión de video, para complementar la comunicación visual con texto escrito.

#### Criterios de Aceptación

1. WHEN un usuario envía un mensaje de texto, THE Sistema SHALL transmitir el mensaje al otro Peer a través del canal de datos WebRTC
2. WHEN un mensaje es recibido, THE Sistema SHALL mostrar el mensaje en la interfaz del receptor con marca de tiempo
3. WHEN la conexión WebRTC no está establecida, THE Sistema SHALL enviar mensajes a través del Servidor_de_Señalización como respaldo
4. WHEN un mensaje contiene más de 1000 caracteres, THE Sistema SHALL truncar el mensaje y notificar al usuario

### Requisito 5: Enlaces Compartibles

**User Story:** Como usuario, quiero generar un enlace compartible para invitar a una persona específica a chatear conmigo, para poder conectar con amigos o conocidos en lugar de usuarios aleatorios.

#### Criterios de Aceptación

1. WHEN un usuario solicita crear un Enlace_Compartible, THE Sistema SHALL generar un identificador único y retornar una URL
2. WHEN un usuario accede a un Enlace_Compartible válido, THE Sistema SHALL conectar al usuario directamente con el creador del enlace
3. WHEN el creador del enlace no está disponible, THE Sistema SHALL notificar al visitante y ofrecer opciones alternativas
4. WHEN un Enlace_Compartible es usado, THE Sistema SHALL invalidar el enlace para prevenir conexiones adicionales
5. WHERE el usuario configura un enlace como reutilizable, THE Sistema SHALL permitir múltiples conexiones usando el mismo enlace

### Requisito 6: Integración de Bots de IA

**User Story:** Como usuario, quiero tener la opción de chatear con un Bot_IA cuando no hay usuarios reales disponibles, para no tener que esperar y poder practicar conversaciones.

#### Criterios de Aceptación

1. WHEN un usuario está en la Cola_de_Espera por más de 10 segundos y no hay otros usuarios disponibles, THE Sistema SHALL ofrecer emparejar con un Bot_IA
2. WHEN un usuario acepta chatear con un Bot_IA, THE Sistema SHALL crear una Sesión_de_Chat con el bot
3. WHEN un Bot_IA recibe un mensaje de texto, THE Sistema SHALL generar una respuesta usando el servicio de IA configurado
4. WHEN un Bot_IA está en una sesión, THE Sistema SHALL simular video usando un avatar o video pregrabado
5. WHEN un usuario solicita terminar el chat con un bot, THE Sistema SHALL finalizar la sesión y ofrecer buscar un usuario real

### Requisito 7: Gestión de Sesiones

**User Story:** Como usuario, quiero poder terminar una sesión de chat en cualquier momento y buscar una nueva pareja, para tener control sobre mis interacciones.

#### Criterios de Aceptación

1. WHEN un usuario solicita terminar una Sesión_de_Chat, THE Sistema SHALL cerrar la conexión WebRTC y notificar al otro Peer
2. WHEN una Sesión_de_Chat termina, THE Sistema SHALL limpiar recursos asociados y permitir a ambos usuarios buscar nuevas parejas
3. WHEN un Peer se desconecta inesperadamente, THE Sistema SHALL detectar la desconexión dentro de 5 segundos y notificar al otro Peer
4. WHEN una sesión termina, THE Sistema SHALL registrar la duración de la sesión para métricas
5. WHEN un usuario solicita "siguiente", THE Sistema SHALL terminar la sesión actual y agregar al usuario a la Cola_de_Espera automáticamente

### Requisito 8: Arquitectura Preparada para Federación

**User Story:** Como administrador del sistema, quiero que la arquitectura soporte federación futura con otros servidores, para permitir una red distribuida de chat aleatorio.

#### Criterios de Aceptación

1. WHEN el sistema almacena identificadores de usuarios, THE Sistema SHALL usar identificadores globalmente únicos que incluyan el dominio del servidor
2. WHEN el sistema diseña APIs de señalización, THE Sistema SHALL usar protocolos que puedan extenderse para comunicación entre servidores
3. WHEN el sistema implementa emparejamiento, THE Sistema SHALL diseñar la Cola_de_Espera de manera que pueda consultar usuarios de servidores remotos en el futuro
4. WHEN el sistema maneja sesiones, THE Sistema SHALL almacenar metadatos que identifiquen el servidor de origen de cada Peer
5. WHERE se implementa federación, THE Sistema SHALL validar la autenticidad de mensajes de servidores remotos usando firmas criptográficas

### Requisito 9: Soporte Global y Distribución Geográfica

**User Story:** Como usuario internacional, quiero poder conectarme con usuarios de cualquier país con video fluido, para tener conversaciones globales sin problemas de latencia.

#### Criterios de Aceptación

1. WHEN el sistema establece conexiones WebRTC, THE Sistema SHALL usar servidores STUN/TURN distribuidos geográficamente para optimizar latencia
2. WHEN un usuario se conecta, THE Sistema SHALL detectar automáticamente la región geográfica del usuario basándose en su ubicación
3. WHERE el usuario configura un Filtro_de_Región, THE Sistema SHALL priorizar emparejamiento con usuarios de la región especificada
4. WHEN no hay usuarios disponibles en la región preferida, THE Sistema SHALL expandir la búsqueda a otras regiones automáticamente
5. WHEN el sistema selecciona servidores STUN/TURN, THE Sistema SHALL elegir los servidores más cercanos geográficamente a ambos peers para minimizar latencia
6. WHEN un usuario no especifica Filtro_de_Región, THE Sistema SHALL emparejar con usuarios de cualquier región (comportamiento predeterminado)
7. WHEN el sistema muestra opciones de región, THE Sistema SHALL incluir al menos: América del Norte, América del Sur, Europa, Asia, África, Oceanía, y "Cualquier región"

### Requisito 10: Interfaz de Usuario React

**User Story:** Como usuario, quiero una interfaz intuitiva y responsiva que funcione en diferentes dispositivos, para poder usar la aplicación cómodamente desde cualquier lugar.

#### Criterios de Aceptación

1. WHEN un usuario accede a la aplicación, THE Sistema SHALL mostrar una interfaz clara con opciones para iniciar chat aleatorio o crear enlace compartible
2. WHEN una Sesión_de_Chat está activa, THE Sistema SHALL mostrar el video del otro usuario, el video propio, y el área de chat de texto
3. WHEN el usuario interactúa con controles, THE Sistema SHALL responder a las acciones dentro de 100ms para mantener sensación de fluidez
4. WHEN la aplicación se ejecuta en dispositivos móviles, THE Sistema SHALL adaptar el diseño para pantallas pequeñas
5. WHEN el usuario cambia el tamaño de la ventana, THE Sistema SHALL ajustar el layout dinámicamente sin perder funcionalidad

### Requisito 11: Privacidad y Anonimato

**User Story:** Como usuario, quiero mantener mi anonimato durante las sesiones de chat, para sentirme seguro compartiendo sin revelar mi identidad.

#### Criterios de Aceptación

1. WHEN un usuario se conecta, THE Sistema SHALL asignar un identificador temporal anónimo que no revele información personal
2. WHEN una Sesión_de_Chat termina, THE Sistema SHALL eliminar todos los datos temporales asociados con la sesión
3. WHEN el sistema registra métricas, THE Sistema SHALL anonimizar los datos para prevenir identificación de usuarios individuales
4. WHEN se transmiten mensajes, THE Sistema SHALL no almacenar el contenido de mensajes en el servidor
5. WHEN se establece conexión WebRTC, THE Sistema SHALL usar STUN/TURN servers que no registren tráfico de usuarios

### Requisito 12: Manejo de Errores y Reconexión

**User Story:** Como usuario, quiero que la aplicación maneje errores de conexión gracefully y me permita reconectar, para tener una experiencia confiable incluso con problemas de red.

#### Criterios de Aceptación

1. IF la conexión WebRTC se interrumpe durante una sesión, THEN THE Sistema SHALL intentar reconectar automáticamente durante 15 segundos
2. IF la reconexión falla, THEN THE Sistema SHALL notificar al usuario y ofrecer opciones para buscar nueva pareja
3. IF el Servidor_de_Señalización se desconecta, THEN THE Sistema SHALL intentar reconectar usando backoff exponencial
4. WHEN ocurre un error de permisos de cámara/micrófono, THE Sistema SHALL mostrar instrucciones claras para resolver el problema
5. WHEN el navegador no soporta WebRTC, THE Sistema SHALL mostrar un mensaje informativo con navegadores compatibles


### Requisito 13: Panel de Administrador

**User Story:** Como administrador del sistema, quiero acceder a un panel privado para supervisar la actividad, gestionar reportes, ver estadísticas y moderar contenido, para mantener la calidad y seguridad de la plataforma.

#### Criterios de Aceptación

1. WHEN un administrador accede al Panel_de_Administrador, THE Sistema SHALL requerir autenticación mediante credenciales seguras
2. WHEN un administrador se autentica exitosamente, THE Sistema SHALL verificar que el usuario tiene rol de administrador antes de otorgar acceso
3. WHEN un administrador accede al panel, THE Sistema SHALL mostrar estadísticas en tiempo real incluyendo: usuarios activos, sesiones activas, distribución geográfica, y tiempo promedio de sesión
4. WHEN un usuario reporta comportamiento inapropiado, THE Sistema SHALL crear un Reporte_de_Usuario y notificar a los administradores
5. WHEN un administrador visualiza reportes, THE Sistema SHALL mostrar lista de Reportes_de_Usuario pendientes con detalles: usuario reportado, razón, timestamp, y evidencia disponible
6. WHEN un administrador toma acción sobre un reporte, THE Sistema SHALL permitir: marcar como resuelto, bloquear usuario temporalmente, o bloquear usuario permanentemente
7. WHEN un administrador bloquea un usuario, THE Sistema SHALL terminar sesiones activas del usuario y prevenir nuevas conexiones
8. WHEN un administrador visualiza estadísticas globales, THE Sistema SHALL mostrar métricas agregadas por región, categoría de usuario, y patrones de uso
9. WHEN un administrador accede a logs del sistema, THE Sistema SHALL mostrar eventos importantes sin exponer información personal identificable de usuarios
10. WHERE el sistema implementa galerías de fotos, THE Sistema SHALL permitir a administradores revisar y moderar contenido reportado
11. WHEN la sesión de administrador está inactiva por más de 30 minutos, THE Sistema SHALL cerrar la sesión automáticamente por seguridad
12. WHEN se intenta acceso no autorizado al panel, THE Sistema SHALL registrar el intento y notificar a administradores
