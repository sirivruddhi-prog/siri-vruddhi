CREATE DATABASE IF NOT EXISTS siri_vruddhi;
USE siri_vruddhi;

CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(192) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  event_type VARCHAR(128) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional seed data
INSERT INTO inquiries (name, email, phone, event_type, message)
VALUES
('Anita Sharma', 'anita@example.com', '9988776655', 'Wedding', 'Please share venue availability for next March.'),
('Rohan Kumar', 'rohan@example.com', '9876543210', 'Baby Shower', 'Looking for a weekend booking for a close family event.');
