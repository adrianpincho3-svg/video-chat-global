import { runMigrations } from '../migrations/migrate';
import { connectDatabase } from '../config/database';
import { connectRedis } from '../config/redis';

async function initProduction() {
  console.log('🚀 Inicializando aplicación en producción...');

  try {
    // Conectar a Redis
    console.log('📡 Conectando a Redis...');
    await connectRedis();
    console.log('✅ Redis conectado');

    // Conectar a PostgreSQL
    console.log('📡 Conectando a PostgreSQL...');
    await connectDatabase();
    console.log('✅ PostgreSQL conectado');

    // Ejecutar migraciones
    console.log('🔄 Ejecutando migraciones...');
    await runMigrations();
    console.log('✅ Migraciones completadas');

    console.log('✅ Inicialización completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  }
}

initProduction();
