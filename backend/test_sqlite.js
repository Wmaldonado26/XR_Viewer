const Database = require('better-sqlite3');
const db = new Database('prisma/cotecmar.db');

const rows = db.prepare('SELECT id, createdAt, updatedAt FROM users').all();

const updateStmt = db.prepare('UPDATE users SET createdAt = ?, updatedAt = ? WHERE id = ?');

for (const row of rows) {
  let created = row.createdAt;
  let updated = row.updatedAt;
  let changed = false;

  if (created && typeof created === 'string' && !created.endsWith('Z')) {
    created = created + 'Z';
    changed = true;
  }
  if (updated && typeof updated === 'string' && !updated.endsWith('Z')) {
    updated = updated + 'Z';
    changed = true;
  }

  if (changed) {
    updateStmt.run(created, updated, row.id);
    console.log(`Updated user ${row.id}: ${created}, ${updated}`);
  }
}

db.close();
