// migrate.js - Migrar proyectos de localStorage a SQLite
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Leer proyectos de localStorage (desde navegador)
console.log('=================================================');
console.log('MIGRACIÓN DE PROYECTOS: localStorage → SQLite');
console.log('=================================================\n');

console.log('INSTRUCCIONES:');
console.log('1. Abre la consola del navegador (F12)');
console.log('2. Ejecuta este comando:');
console.log('\n   copy(localStorage.getItem("cotecmar_projects"))\n');
console.log('3. El contenido se copiará al portapapeles');
console.log('4. Pega el contenido cuando se solicite\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Pega aquí el contenido de localStorage (o presiona Enter para saltar): ', (jsonString) => {
  readline.close();

  if (!jsonString || jsonString.trim() === '') {
    console.log('\n⚠️  No se proporcionaron datos. Migración cancelada.');
    process.exit(0);
  }

  try {
    // Parsear JSON
    const projects = JSON.parse(jsonString);
    
    if (!Array.isArray(projects) || projects.length === 0) {
      console.log('\n⚠️  No hay proyectos para migrar.');
      process.exit(0);
    }

    console.log(`\n✓ Se encontraron ${projects.length} proyecto(s)\n`);

    // Conectar a la base de datos
    const dbPath = path.join(__dirname, 'cotecmar.db');
    const db = new Database(dbPath);

    // Crear tablas si no existen
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        vesselType TEXT,
        dateCreated TEXT,
        dateModified TEXT,
        thumbnail TEXT,
        status TEXT,
        data TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId TEXT NOT NULL,
        imageType TEXT NOT NULL,
        imageData BLOB NOT NULL,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);

    // Preparar statements
    const insertProject = db.prepare(`
      INSERT OR REPLACE INTO projects (id, name, description, vesselType, dateCreated, dateModified, thumbnail, status, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let migrated = 0;
    let errors = 0;

    // Migrar cada proyecto
    for (const project of projects) {
      try {
        insertProject.run(
          project.id,
          project.name,
          project.description || '',
          project.vesselType || '',
          project.dateCreated,
          project.dateModified,
          project.thumbnail || '',
          project.status || 'active',
          JSON.stringify(project)
        );
        
        console.log(`✓ Migrado: ${project.name} (${project.id})`);
        migrated++;
      } catch (error) {
        console.error(`✗ Error migrando ${project.name}: ${error.message}`);
        errors++;
      }
    }

    db.close();

    console.log('\n=================================================');
    console.log('RESUMEN DE MIGRACIÓN');
    console.log('=================================================');
    console.log(`✓ Proyectos migrados exitosamente: ${migrated}`);
    if (errors > 0) {
      console.log(`✗ Errores: ${errors}`);
    }
    console.log(`\n📁 Base de datos: ${dbPath}`);
    console.log('\n✅ Migración completada. Ahora puedes iniciar el backend con "npm start"');

  } catch (error) {
    console.error('\n❌ Error en la migración:', error.message);
    process.exit(1);
  }
});
