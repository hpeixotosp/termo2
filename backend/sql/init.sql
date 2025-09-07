-- Create database if not exists
CREATE DATABASE IF NOT EXISTS termo_game;
USE termo_game;

-- Create words table
CREATE TABLE IF NOT EXISTS words (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(5) NOT NULL UNIQUE,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_word (word)
);

-- Create game_stats table
CREATE TABLE IF NOT EXISTS game_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(5) NOT NULL,
    attempts INT NOT NULL,
    won BOOLEAN NOT NULL,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_word (word),
    INDEX idx_played_at (played_at)
);

-- Insert some sample words (we'll populate this via the backend)
INSERT IGNORE INTO words (word, source) VALUES 
('amigo', 'Dicio'),
('canto', 'Dicio'),
('dente', 'Dicio'),
('festa', 'Dicio'),
('gente', 'Dicio'),
('hotel', 'Dicio'),
('idade', 'Dicio'),
('junto', 'Dicio'),
('livro', 'Dicio'),
('mundo', 'Dicio');
