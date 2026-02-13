import bcrypt from 'bcrypt';
import { connectDatabase, getPool } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para resetear el administrador
 */
async function resetAdmin() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await connectDatabase();
    
    const pool = getPool();

    const username = 'admin';
    const password = 'admin123';
    const email = 'admin@example.com';

    // Eliminar administrador existente
    await pool.query('DELETE FROM admins WHERE username = $1', [username]);
    console.log(`🗑️ Administrador "${username}" eliminado`);

    // Hashear contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear administrador
    const result = await pool.query(
      'INSERT INTO admins (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, passwordHash, email]
    );

    const admin = result.rows[0];

    console.log('✅ Administrador creado exitosamente:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al resetear administrador:', error);
    process.exit(1);
  }
}

resetAdmin();
