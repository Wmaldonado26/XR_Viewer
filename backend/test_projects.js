const Database = require('better-sqlite3');
const db = new Database('prisma/cotecmar.db');

const rows = db.prepare("SELECT * FROM projects WHERE id = 'businu'").all();
console.log(rows);
db.close();
