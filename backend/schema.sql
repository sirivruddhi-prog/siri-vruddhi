-- Hostinger: select database u914954551_sirivruddhi_db in phpMyAdmin first, then import.
-- Do NOT use CREATE DATABASE — shared hosting users cannot create new databases.

CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(192) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
