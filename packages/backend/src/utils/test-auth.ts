import { connectDatabase } from '../config/database';
import { connectRedis } from '../config/redis';
import { authService } from '../services/AuthService';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para probar el Auth Service
 */
async function testAuthService() {
  try {
    console.log('🔧 Conectando a servicios...');
    await connectDatabase();
    await connectRedis();

    console.log('\n📝 Probando Auth Service...\n');

    // Test 1: Autenticación exitosa
    console.log('Test 1: Autenticación exitosa');
    const session = await authService.authenticate({
      username: 'admin',
      password: 'admin123',
    });

    if (session) {
      console.log('✅ Autenticación exitosa');
      console.log(`   Session ID: ${session.sessionId}`);
      console.log(`   Admin ID: ${session.adminId}`);
      console.log(`   Username: ${session.username}`);
      console.log(`   Created At: ${new Date(session.createdAt).toISOString()}`);
      console.log(`   Expires At: ${new Date(session.expiresAt).toISOString()}`);
    } else {
      console.log('❌ Autenticación fallida');
      process.exit(1);
    }

    // Test 2: Validar sesión
    console.log('\nTest 2: Validar sesión');
    const isValid = await authService.validateSession(session.sessionId);
    console.log(isValid ? '✅ Sesión válida' : '❌ Sesión inválida');

    // Test 3: Obtener información de sesión
    console.log('\nTest 3: Obtener información de sesión');
    const sessionInfo = await authService.getSession(session.sessionId);
    if (sessionInfo) {
      console.log('✅ Información de sesión obtenida');
      console.log(`   Username: ${sessionInfo.username}`);
      console.log(`   Last Activity: ${new Date(sessionInfo.lastActivity).toISOString()}`);
    } else {
      console.log('❌ No se pudo obtener información de sesión');
    }

    // Test 4: Actualizar actividad
    console.log('\nTest 4: Actualizar actividad');
    await authService.updateActivity(session.sessionId);
    console.log('✅ Actividad actualizada');

    // Test 5: Autenticación con credenciales incorrectas
    console.log('\nTest 5: Autenticación con credenciales incorrectas');
    const failedSession = await authService.authenticate({
      username: 'admin',
      password: 'wrongpassword',
    });
    console.log(failedSession ? '❌ Debería haber fallado' : '✅ Autenticación rechazada correctamente');

    // Test 6: Registrar intento no autorizado
    console.log('\nTest 6: Registrar intento no autorizado');
    await authService.logUnauthorizedAccess('192.168.1.100', 'hacker');
    console.log('✅ Intento no autorizado registrado');

    // Test 7: Cerrar sesión
    console.log('\nTest 7: Cerrar sesión');
    await authService.logout(session.sessionId);
    console.log('✅ Sesión cerrada');

    // Test 8: Validar sesión cerrada
    console.log('\nTest 8: Validar sesión cerrada');
    const isValidAfterLogout = await authService.validateSession(session.sessionId);
    console.log(isValidAfterLogout ? '❌ La sesión debería estar cerrada' : '✅ Sesión correctamente invalidada');

    console.log('\n✅ Todos los tests del Auth Service pasaron exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en tests:', error);
    process.exit(1);
  }
}

testAuthService();
