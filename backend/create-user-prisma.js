// create-user-prisma.js
require('./src/config/env'); // Loads and normalizes environment variables
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function crearUsuario() {
  try {
    // Valores por defecto (se pueden modificar para crear otros usuarios)
    const name = 'Usuario Test';
    const email = 'test@ejemplo.com';
    const password = 'miContraseña123';
    const role = 'user'; // 'user' o 'admin'
    const phone = '3001234567';
    
    // Encriptar la contraseña usando bcryptjs
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Crear usuario con Prisma
    const usuario = await prisma.user.create({
      data: {
        name: name,
        email: email,
        phone: phone || null,
        passwordHash: hashedPassword,
        role: role,
        isActive: true,
      }
    });
    
    console.log('✅ Usuario creado exitosamente:');
    console.log('👤 Nombre:', name);
    console.log('📧 Email:', email);
    console.log('🛡️ Rol:', role);
    console.log('🆔 ID:', usuario.id);
    
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

crearUsuario();
