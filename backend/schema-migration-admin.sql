-- Phase 1 admin module — run in phpMyAdmin after selecting your database.
-- Safe to re-run: skips columns that already exist (MySQL 8+ / MariaDB 10.3+).

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS status ENUM('new','contacted','visit_scheduled','booked','closed') NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;
