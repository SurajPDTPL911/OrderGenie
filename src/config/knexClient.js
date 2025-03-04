import dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();

const db = knex({
client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  pool: { min: 2, max: 10 }
});

export default db;

