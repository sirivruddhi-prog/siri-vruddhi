-- CMS site content — run in phpMyAdmin after selecting your database.

CREATE TABLE IF NOT EXISTS site_content (
  section_key VARCHAR(64) PRIMARY KEY,
  content_json JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
