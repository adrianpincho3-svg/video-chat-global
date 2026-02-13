import { readFileSync } from 'fs';
import { join } from 'path';
import { connectDatabase, query, disconnectDatabase } from '../config/database';

/**
 * Ejecuta las migraciones de base de datos
 */
async function runMigrations() {
  try {
    console.log('🔄 Iniciando migraciones...');
    
    // Conectar a la base de datos
    await connectDatabase();
    
    // Crear tabla de migraciones si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Lista de archivos de migración
    const migrations = [
      '001_initial_schema.sql',
    ];
    
    for (const migrationFile of migrations) {
      // Verificar si la migración ya fue ejecutada
      const result = await query(
        'SELECT * FROM migrations WHERE name = $1',
        [migrationFile]
      );
      
      if (result.rows.length > 0) {
        console.log(`⏭️  Migración ${migrationFile} ya ejecutada, saltando...`);
        continue;
      }
      
      // Leer y ejecutar el archivo SQL
      const migrationPath = join(__dirname, migrationFile);
      const sql = readFileSync(migrationPath, 'utf-8');
      
      console.log(`▶️  Ejecutando migración: ${migrationFile}`);
      await query(sql);
      
      // Registrar la migración como ejecutada
      await query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [migrationFile]
      );
      
      console.log(`✅ Migración ${migrationFile} completada`);
    }
    
    console.log('✅ Todas las migraciones completadas');
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

// Ejecutar migraciones si se llama directamente
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
