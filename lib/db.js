// Pool de conexiones MySQL (reutilizado en todo el servidor).
import mysql from "mysql2/promise";

const globalForDb = globalThis;

export const pool =
  globalForDb._mysqlPool ||
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
  });

if (process.env.NODE_ENV !== "production") globalForDb._mysqlPool = pool;

export async function q(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
