import mysql from 'mysql2/promise';
import 'dotenv/config';

// Un seul compte technique côté serveur (pas de comptes MySQL individuels
// par patient — l'identification se fait via le champ "login" en base,
// pas via une authentification MySQL séparée).
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sante_vaisseau',
  waitForConnections: true,
  connectionLimit: 10,
});
