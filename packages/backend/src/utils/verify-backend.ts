/**
 * Script de verificación completa del backend
 * Verifica que todos los servicios estén implementados y funcionen correctamente
 */

import { connectRedis, getRedisClient, isRedisConnected } from '../config/redis';
import { connectDatabase, getPool, isDatabaseConnected } from '../config/database';
import { geoIPService } from '../services/GeoIPService';
import { matchingManager } from '../services/MatchingManager';
import { sessionManager } from '../services/SessionManager';
import { linkGenerator } from '../services/LinkGenerator';
import { aiBotService } from '../services/AIBotService';
import { authService } from '../services/AuthService';
import { reportManager } from '../services/ReportManager';
import { metricsService } from '../services/MetricsService';

async function verifyBackend() {
  console.log('🔍 Verificando backend completo...\n');

  let allPassed = true;

  // 1. Verificar conexión a Redis
  console.log('1️⃣ Verificando Redis...');
  try {
    await connectRedis();
    if (isRedisConnected()) {
      const redisClient = getRedisClient();
      await redisClient.ping();
      console.log('✅ Redis conectado y funcionando\n');
    } else {
      throw new Error('Redis no conectado');
    }
  } catch (error) {
    console.error('❌ Error en Redis:', error);
    allPassed = false;
  }

  // 2. Verificar conexión a PostgreSQL
  console.log('2️⃣ Verificando PostgreSQL...');
  try {
    await connectDatabase();
    if (isDatabaseConnected()) {
      const pool = getPool();
      await pool.query('SELECT NOW()');
      console.log('✅ PostgreSQL conectado y funcionando\n');
    } else {
      throw new Error('PostgreSQL no conectado');
    }
  } catch (error) {
    console.error('❌ Error en PostgreSQL:', error);
    allPassed = false;
  }

  // 3. Verificar GeoIP Service
  console.log('3️⃣ Verificando GeoIP Service...');
  try {
    const region = geoIPService.detectRegion('8.8.8.8');
    const servers = geoIPService.getSTUNServers('north-america');
    if (region && servers.length > 0) {
      console.log(`✅ GeoIP Service funcionando (región detectada: ${region})\n`);
    } else {
      throw new Error('GeoIP Service no retorna datos válidos');
    }
  } catch (error) {
    console.error('❌ Error en GeoIP Service:', error);
    allPassed = false;
  }

  // 4. Verificar Matching Manager
  console.log('4️⃣ Verificando Matching Manager...');
  try {
    const testUserId = `test-user-${Date.now()}`;
    await matchingManager.addToQueue(testUserId, 'male', 'female', 'north-america', 'any');
    const stats = await matchingManager.getQueueStats();
    await matchingManager.removeFromQueue(testUserId);
    
    if (stats) {
      console.log('✅ Matching Manager funcionando\n');
    } else {
      throw new Error('Matching Manager no retorna estadísticas');
    }
  } catch (error) {
    console.error('❌ Error en Matching Manager:', error);
    allPassed = false;
  }

  // 5. Verificar Session Manager
  console.log('5️⃣ Verificando Session Manager...');
  try {
    const session = await sessionManager.createSession(
      'user1-test',
      'user2-test',
      false,
      'north-america',
      'europe'
    );
    
    const retrieved = await sessionManager.getSession(session.sessionId);
    await sessionManager.endSession(session.sessionId);
    
    if (retrieved && retrieved.sessionId === session.sessionId) {
      console.log('✅ Session Manager funcionando\n');
    } else {
      throw new Error('Session Manager no retorna sesión correcta');
    }
  } catch (error) {
    console.error('❌ Error en Session Manager:', error);
    allPassed = false;
  }

  // 6. Verificar Link Generator
  console.log('6️⃣ Verificando Link Generator...');
  try {
    const link = await linkGenerator.createLink('test-creator', false, 3600);
    const retrieved = await linkGenerator.getLink(link.linkId);
    await linkGenerator.invalidateLink(link.linkId);
    
    if (retrieved && retrieved.linkId === link.linkId) {
      console.log('✅ Link Generator funcionando\n');
    } else {
      throw new Error('Link Generator no retorna enlace correcto');
    }
  } catch (error) {
    console.error('❌ Error en Link Generator:', error);
    allPassed = false;
  }

  // 7. Verificar AI Bot Service
  console.log('7️⃣ Verificando AI Bot Service...');
  try {
    const testSessionId = `bot-session-${Date.now()}`;
    await aiBotService.initializeConversation(testSessionId);
    const response = await aiBotService.generateResponse(testSessionId, 'Hola');
    await aiBotService.cleanupConversation(testSessionId);
    
    if (response && response.length > 0) {
      console.log('✅ AI Bot Service funcionando\n');
    } else {
      throw new Error('AI Bot Service no genera respuestas');
    }
  } catch (error) {
    console.error('❌ Error en AI Bot Service:', error);
    allPassed = false;
  }

  // 8. Verificar Auth Service
  console.log('8️⃣ Verificando Auth Service...');
  try {
    // Verificar que el servicio está disponible
    const testSessionId = 'test-session-invalid';
    const isValid = await authService.validateSession(testSessionId);
    
    if (isValid === false) {
      console.log('✅ Auth Service funcionando\n');
    } else {
      throw new Error('Auth Service no valida correctamente');
    }
  } catch (error) {
    console.error('❌ Error en Auth Service:', error);
    allPassed = false;
  }

  // 9. Verificar Report Manager
  console.log('9️⃣ Verificando Report Manager...');
  try {
    const report = await reportManager.createReport({
      reportedUserId: 'test-reported-user',
      reporterUserId: 'test-reporter-user',
      reason: 'spam',
      description: 'Test report',
    });
    
    const retrieved = await reportManager.getReport(report.reportId);
    
    if (retrieved && retrieved.reportId === report.reportId) {
      console.log('✅ Report Manager funcionando\n');
    } else {
      throw new Error('Report Manager no retorna reporte correcto');
    }
  } catch (error) {
    console.error('❌ Error en Report Manager:', error);
    allPassed = false;
  }

  // 10. Verificar Metrics Service
  console.log('🔟 Verificando Metrics Service...');
  try {
    const metrics = await metricsService.getRealtimeMetrics();
    const stats = await metricsService.getMatchingStats();
    
    if (metrics && stats) {
      console.log('✅ Metrics Service funcionando\n');
    } else {
      throw new Error('Metrics Service no retorna métricas');
    }
  } catch (error) {
    console.error('❌ Error en Metrics Service:', error);
    allPassed = false;
  }

  // Resumen final
  console.log('═══════════════════════════════════════');
  if (allPassed) {
    console.log('✅ TODOS LOS SERVICIOS FUNCIONANDO CORRECTAMENTE');
  } else {
    console.log('❌ ALGUNOS SERVICIOS TIENEN ERRORES');
  }
  console.log('═══════════════════════════════════════\n');

  process.exit(allPassed ? 0 : 1);
}

// Ejecutar verificación
verifyBackend().catch((error) => {
  console.error('❌ Error fatal en verificación:', error);
  process.exit(1);
});
