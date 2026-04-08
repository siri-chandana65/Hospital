CREATE DATABASE IF NOT EXISTS queue_system;
USE queue_system;

CREATE TABLE IF NOT EXISTS tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_number INT NOT NULL,
  status ENUM('waiting', 'serving', 'done') DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
