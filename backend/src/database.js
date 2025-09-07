import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'termo_game',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create words table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS words (
        id INT AUTO_INCREMENT PRIMARY KEY,
        word VARCHAR(5) NOT NULL UNIQUE,
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_word (word)
      )
    `);
    
    // Create game_stats table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS game_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        word VARCHAR(5) NOT NULL,
        attempts INT NOT NULL,
        won BOOLEAN NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_word (word),
        INDEX idx_played_at (played_at)
      )
    `);
    
    connection.release();
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
}

// Word operations
async function getRandomWord() {
  try {
    const connection = await pool.getConnection();
    
    // Get random word from database
    const [rows] = await connection.execute(
      'SELECT word, source FROM words ORDER BY RAND() LIMIT 1'
    );
    
    connection.release();
    
    if (rows.length > 0) {
      return {
        word: rows[0].word,
        source: rows[0].source || 'Database'
      };
    }
    
    // Fallback to hardcoded words if database is empty
    const fallbackWords = [
      { word: 'amigo', source: 'Fallback' },
      { word: 'canto', source: 'Fallback' },
      { word: 'dente', source: 'Fallback' },
      { word: 'festa', source: 'Fallback' },
      { word: 'gente', source: 'Fallback' }
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackWords.length);
    return fallbackWords[randomIndex];
    
  } catch (error) {
    console.error('❌ Error getting random word:', error.message);
    
    // Fallback to hardcoded words
    const fallbackWords = [
      { word: 'amigo', source: 'Fallback' },
      { word: 'canto', source: 'Fallback' },
      { word: 'dente', source: 'Fallback' },
      { word: 'festa', source: 'Fallback' },
      { word: 'gente', source: 'Fallback' }
    ];
    
    const randomIndex = Math.floor(Math.random() * fallbackWords.length);
    return fallbackWords[randomIndex];
  }
}

async function saveGameStats(word, attempts, won) {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(
      'INSERT INTO game_stats (word, attempts, won) VALUES (?, ?, ?)',
      [word, attempts, won]
    );
    
    connection.release();
    console.log('✅ Game stats saved');
  } catch (error) {
    console.error('❌ Error saving game stats:', error.message);
  }
}

async function getGameStats() {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        COUNT(*) as total_games,
        SUM(CASE WHEN won = 1 THEN 1 ELSE 0 END) as games_won,
        AVG(CASE WHEN won = 1 THEN attempts ELSE NULL END) as avg_attempts_won,
        AVG(attempts) as avg_attempts_total
      FROM game_stats
    `);
    
    connection.release();
    
    return rows[0] || {
      total_games: 0,
      games_won: 0,
      avg_attempts_won: 0,
      avg_attempts_total: 0
    };
    
  } catch (error) {
    console.error('❌ Error getting game stats:', error.message);
    return {
      total_games: 0,
      games_won: 0,
      avg_attempts_won: 0,
      avg_attempts_total: 0
    };
  }
}

// Close pool
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
}

export {
  pool,
  testConnection,
  initializeDatabase,
  getRandomWord,
  saveGameStats,
  getGameStats,
  closePool
};
