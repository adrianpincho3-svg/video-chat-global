#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building backend...');

try {
  // Verificar que estamos en el directorio correcto
  const currentDir = process.cwd();
  console.log('📁 Current directory:', currentDir);

  // Verificar que existe src/
  if (!fs.existsSync('src')) {
    console.error('❌ Error: src/ directory not found');
    process.exit(1);
  }

  // Limpiar dist/
  if (fs.existsSync('dist')) {
    console.log('🧹 Cleaning dist/...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Crear dist/
  fs.mkdirSync('dist', { recursive: true });

  // Compilar con TypeScript
  console.log('📦 Compiling TypeScript...');
  execSync('npx tsc --skipLibCheck --noEmit false', { 
    stdio: 'inherit',
    cwd: currentDir
  });

  console.log('✅ Build completed successfully!');
  
  // Verificar que dist/server.js existe
  if (!fs.existsSync('dist/server.js')) {
    console.error('❌ Error: dist/server.js was not created');
    process.exit(1);
  }

  console.log('✅ dist/server.js created');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
