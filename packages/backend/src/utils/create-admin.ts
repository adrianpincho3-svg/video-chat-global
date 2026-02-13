import bcrypt from 'bcrypt';
import { connectDatabase, getPool } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para crear un administrador inicial
 */
async function createAdmin() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await connectDatabase();
    
    const pool = getPool();

    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';

    // Verificar si el administrador ya existe
    const existingAdmin = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      [username]
    );

    if (existingAdmin.rows.length > 0) {
      console.log(`⚠️ El administrador "${username}" ya existe`);
      process.exit(0);
    }

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
    console.log('');
    console.log('⚠️ IMPORTANTE: Cambia la contraseña después del primer login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear administrador:', error);
    process.exit(1);
  }
}

createAdmin();
