const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'queue_system'
};

let pool;

async function initDb() {
  try {
    pool = await mysql.createPool(dbConfig);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token_number INT NOT NULL,
        status ENUM('waiting', 'serving', 'done') DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query('DELETE FROM tokens');
    await pool.query('ALTER TABLE tokens AUTO_INCREMENT = 1');

    console.log("✅ Database connected & tokens reset");
  } catch (err) {
    console.error("❌ DB Error:", err);
  }
}
initDb();

app.post('/token', async (req, res) => {
  try {
    const [serving] = await pool.query(
      'SELECT * FROM tokens WHERE status="serving"'
    );

    const [rows] = await pool.query(
      'SELECT MAX(token_number) as maxToken FROM tokens'
    );

    let nextToken = (rows[0].maxToken || 0) + 1;

    let status = serving.length === 0 ? "serving" : "waiting";

    await pool.query(
      'INSERT INTO tokens (token_number, status) VALUES (?, ?)',
      [nextToken, status]
    );

    res.json({ token_number: nextToken, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/current', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tokens WHERE status="serving" LIMIT 1'
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/waiting', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM tokens WHERE status="waiting" ORDER BY id ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/next', async (req, res) => {
  try {
    await pool.query(
      'UPDATE tokens SET status="done" WHERE status="serving"'
    );

    const [rows] = await pool.query(
      'SELECT * FROM tokens WHERE status="waiting" ORDER BY id ASC LIMIT 1'
    );

    if (rows.length === 0) {
      return res.json({ message: "No tokens" });
    }

    const next = rows[0];

    await pool.query(
      'UPDATE tokens SET status="serving" WHERE id=?',
      [next.id]
    );

    res.json(next);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/reset', async (req, res) => {
  try {
    await pool.query('DELETE FROM tokens');
    await pool.query('ALTER TABLE tokens AUTO_INCREMENT = 1');
    res.json({ message: "Tokens reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});