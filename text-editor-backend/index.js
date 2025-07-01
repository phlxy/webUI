import express from 'express';
import cors from 'cors';
import { getConnection } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API สำหรับดึงข้อมูล summary_json จากตาราง DOC
app.get('/api/doc', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT doc_id, summary_json, validation_status FROM DOC');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching doc:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/doc/:id', async (req, res) => {
  try {
    const { summary_json, validation_status } = req.body;
    const pool = await getConnection();
    await pool.request()
      .input('summary_json', summary_json)
      .input('validation_status', validation_status)
      .input('doc_id', req.params.id)
      .query('UPDATE DOC SET summary_json = @summary_json, validation_status = @validation_status WHERE doc_id = @doc_id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
