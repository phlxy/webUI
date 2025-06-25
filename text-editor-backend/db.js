import sql from 'mssql';

const config = {
  user: '',
  password: '',
  server: '',
  //port: ,
  database: '',
  options: {
    encrypt: false, // For local dev/testing
    trustServerCertificate: true
  }
};

export async function getConnection() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

export default sql;
