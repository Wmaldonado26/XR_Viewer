const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Crear directorios necesarios
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Conectar a la base de datos
const db = new Database(path.join(__dirname, 'cotecmar.db'));

console.log('🔄 Iniciando migración optimizada de proyectos...\n');

// Función para convertir base64 a archivo
function saveBase64AsFile(base64String, projectId, type, index = 0) {
  if (!base64String || !base64String.startsWith('data:image')) {
    return base64String; // No es base64, devolver tal cual
  }
  
  try {
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return base64String;
    
    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    
    const timestamp = Date.now();
    const filename = `${projectId}_${type}_${index}_${timestamp}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log(`  ✓ Imagen guardada: ${filename} (${(buffer.length / 1024).toFixed(2)} KB)`);
    
    return `/uploads/${filename}`;
  } catch (error) {
    console.error(`  ✗ Error guardando imagen ${type}:`, error.message);
    return base64String;
  }
}

// Función para procesar proyecto
function processProject(project) {
  console.log(`\n📦 Procesando proyecto: ${project.name}`);
  
  const processed = JSON.parse(JSON.stringify(project));
  let imageCount = 0;
  
  // Procesar thumbnail
  if (processed.thumbnail && processed.thumbnail.startsWith('data:image')) {
    processed.thumbnail = saveBase64AsFile(processed.thumbnail, project.id, 'thumbnail');
    imageCount++;
  }
  
  // Procesar imágenes de escenas
  if (processed.scenes) {
    Object.keys(processed.scenes).forEach((sceneKey, index) => {
      const scene = processed.scenes[sceneKey];
      if (scene.image && scene.image.startsWith('data:image')) {
        scene.image = saveBase64AsFile(scene.image, project.id, `scene_${sceneKey}`, index);
        imageCount++;
      }
    });
  }
  
  console.log(`  📊 Total de imágenes procesadas: ${imageCount}`);
  return processed;
}

// Leer datos desde stdin (JSON pegado)
console.log('📋 Pega el contenido del localStorage (JSON array) y presiona Enter dos veces:\n');

let jsonData = '';
process.stdin.on('data', (chunk) => {
  jsonData += chunk.toString();
  
  // Detectar fin de entrada (dos enters consecutivos o EOF)
  if (jsonData.includes('\n\n') || chunk.toString().trim() === '') {
    process.stdin.pause();
    processData();
  }
});

process.stdin.on('end', () => {
  if (jsonData.trim()) {
    processData();
  }
});

function processData() {
  try {
    // Limpiar y parsear JSON
    const cleanJson = jsonData.trim();
    const projects = JSON.parse(cleanJson);
    
    if (!Array.isArray(projects)) {
      console.error('❌ Error: El JSON debe ser un array de proyectos');
      process.exit(1);
    }
    
    console.log(`\n✅ JSON parseado exitosamente: ${projects.length} proyecto(s) encontrado(s)\n`);
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO projects 
      (id, name, vesselType, description, thumbnail, status, dateCreated, dateModified, settings, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let successCount = 0;
    let errorCount = 0;
    
    projects.forEach((project, index) => {
      try {
        console.log(`\n[${index + 1}/${projects.length}] ${project.name}`);
        
        // Procesar imágenes
        const processed = processProject(project);
        
        const now = new Date().toISOString();
        const { settings, experiences, scenes, statistics } = processed;
        
        const dataToStore = {
          experiences: experiences || [],
          scenes: scenes || {},
          statistics: statistics || {}
        };
        
        stmt.run(
          processed.id,
          processed.name,
          processed.vesselType || '',
          processed.description || '',
          processed.thumbnail || '',
          processed.status || 'active',
          processed.dateCreated || now,
          now,
          JSON.stringify(settings || {}),
          JSON.stringify(dataToStore)
        );
        
        successCount++;
        console.log(`  ✅ Proyecto migrado exitosamente`);
        
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error migrando proyecto ${project.name}:`, error.message);
      }
    });
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 RESUMEN DE MIGRACIÓN`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Proyectos migrados exitosamente: ${successCount}`);
    console.log(`❌ Proyectos con errores: ${errorCount}`);
    console.log(`📁 Base de datos: ${path.join(__dirname, 'cotecmar.db')}`);
    console.log(`📸 Imágenes en: ${uploadsDir}`);
    console.log(`${'='.repeat(60)}\n`);
    
    db.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error al procesar datos:', error.message);
    console.error('\nAsegúrate de que el JSON esté correctamente formateado.');
    db.close();
    process.exit(1);
  }
}

// Timeout de seguridad (30 segundos esperando entrada)
setTimeout(() => {
  if (!jsonData.trim()) {
    console.log('\n⏱️ Tiempo de espera agotado. Saliendo...');
    db.close();
    process.exit(0);
  }
}, 30000);
