import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { pool?: mysql.Pool };

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "angora",
    connectionLimit: 10,
    connectTimeout: 3000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;
