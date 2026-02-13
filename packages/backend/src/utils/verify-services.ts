/**
 * Script de verificación de servicios backend
 * Verifica que todos los servicios core estén funcionando correctamente
 */

import { connectRedis, pingRedis, disconnectRedis } from '../config/redis';
import { connectDatabase, pingDatabase, disconnectDatabase } from '../config/database';
import { geoIPService } from '../services/GeoIPService';
import { matchingManager } from '../services/MatchingManager';
import { sessionManager } from '../services/SessionManager';
import { linkGenerator } from '../services/LinkGenerator';
import { aiBotService } from '../services/AIBotService';

async function verifyServices() {
  console.log('🔍 Verificando servicios backend...\n');

  let allPassed = true;

  // 1. Verificar Redis
  console.log('1️⃣ Verificando Redis...');
  try {
    await connectRedis();
    const redisPing = await pingRedis();
    if (redisPing) {
      console.log('   ✅ Redis: Conectado y funcionando\n');
    } else {
      console.log('   ❌ Redis: No responde a ping\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Redis: Error de conexión\n');
    allPassed = false;
  }

  // 2. Verificar PostgreSQL
  console.log('2️⃣ Verificando PostgreSQL...');
  try {
    await connectDatabase();
    const dbPing = await pingDatabase();
    if (dbPing) {
      console.log('   ✅ PostgreSQL: Conectado y funcionando\n');
    } else {
      console.log('   ❌ PostgreSQL: No responde a ping\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ PostgreSQL: Error de conexión\n');
    allPassed = false;
  }

  // 3. Verificar GeoIP Service
  console.log('3️⃣ Verificando GeoIP Service...');
  try {
    const region = geoIPService.detectRegion('8.8.8.8');
    const servers = geoIPService.getSTUNServers('north-america');
    if (region && servers.length > 0) {
      console.log(`   ✅ GeoIP Service: Funcionando (detectó región: ${region})\n`);
    } else {
      console.log('   ❌ GeoIP Service: No funciona correctamente\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ GeoIP Service: Error\n');
    allPassed = false;
  }

  // 4. Verificar Matching Manager
  console.log('4️⃣ Verificando Matching Manager...');
  try {
    // Agregar usuario de prueba
    await matchingManager.addToQueue(
      'test-user-1',
      'male',
      'female',
      'north-america',
      'any'
    );
    
    const waitTime = await matchingManager.getWaitTime('test-user-1');
    const stats = await matchingManager.getQueueStats();
    
    // Limpiar
    await matchingManager.removeFromQueue('test-user-1');
    
    if (waitTime >= 0 && stats.totalWaiting >= 0) {
      console.log('   ✅ Matching Manager: Funcionando\n');
    } else {
      console.log('   ❌ Matching Manager: No funciona correctamente\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Matching Manager: Error -', error);
    allPassed = false;
  }

  // 5. Verificar Session Manager
  console.log('5️⃣ Verificando Session Manager...');
  try {
    // Crear sesión de prueba
    const session = await sessionManager.createSession(
      'test-user-1',
      'test-user-2',
      false,
      'north-america',
      'europe'
    );
    
    const retrievedSession = await sessionManager.getSession(session.sessionId);
    const stats = await sessionManager.getSessionStats();
    
    // Limpiar
    await sessionManager.endSession(session.sessionId);
    
    if (retrievedSession && stats.activeSessions >= 0) {
      console.log('   ✅ Session Manager: Funcionando\n');
    } else {
      console.log('   ❌ Session Manager: No funciona correctamente\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Session Manager: Error -', error);
    allPassed = false;
  }

  // 6. Verificar Link Generator
  console.log('6️⃣ Verificando Link Generator...');
  try {
    // Crear enlace de prueba
    const link = await linkGenerator.createLink('test-user-1', false, 3600);
    const retrievedLink = await linkGenerator.getLink(link.linkId);
    const url = linkGenerator.buildLinkURL(link.linkId);
    
    // Limpiar
    await linkGenerator.invalidateLink(link.linkId);
    
    if (retrievedLink && url.includes(link.linkId)) {
      console.log('   ✅ Link Generator: Funcionando\n');
    } else {
      console.log('   ❌ Link Generator: No funciona correctamente\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Link Generator: Error -', error);
    allPassed = false;
  }

  // 7. Verificar AI Bot Service
  console.log('7️⃣ Verificando AI Bot Service...');
  try {
    await aiBotService.initializeConversation('test-session-1');
    const response = await aiBotService.generateResponse('test-session-1', 'Hola');
    const stats = aiBotService.getStats();
    
    // Limpiar
    await aiBotService.cleanupConversation('test-session-1');
    
    if (response && response.length > 0 && stats.activeConversations >= 0) {
      console.log('   ✅ AI Bot Service: Funcionando\n');
    } else {
      console.log('   ❌ AI Bot Service: No funciona correctamente\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ AI Bot Service: Error -', error);
    allPassed = false;
  }

  // Resumen
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('✅ TODOS LOS SERVICIOS FUNCIONAN CORRECTAMENTE');
  } else {
    console.log('❌ ALGUNOS SERVICIOS TIENEN PROBLEMAS');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Cerrar conexiones
  await disconnectRedis();
  await disconnectDatabase();

  process.exit(allPassed ? 0 : 1);
}

// Ejecutar verificación
verifyServices().catch((error) => {
  console.error('❌ Error fatal durante verificación:', error);
  process.exit(1);
});
