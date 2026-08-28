// Ejecuta schema.sql + seed.sql contra tu MySQL.  Uso:  npm run db:setup
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, multipleStatements: true,
  });
  for (const file of ["schema.sql", "seed.sql"]) {
    const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
    await conn.query(sql);
    console.log("✓ ejecutado", file);
  }
  await conn.end();
  console.log("Base de datos lista.");
}
run().catch((e) => { console.error(e); process.exit(1); });
