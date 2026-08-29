-- ─────────────────────────────────────────────────────────────
-- Agrega el rol "th" (Talento Humano) a una base de datos que ya existe.
-- db/schema.sql ya lo incluye para instalaciones nuevas (npm run db:setup);
-- corre este archivo solo si tu base de datos se creó ANTES de este cambio.
--
-- Cómo correrlo:
--   - phpMyAdmin (XAMPP/Hostinger): pestaña SQL de tu base, pega y ejecuta.
--   - o por terminal:  mysql -u TU_USUARIO -p TU_BASE < db/migrations/2026-08-29_rol_th.sql
-- ─────────────────────────────────────────────────────────────
ALTER TABLE usuarios
  MODIFY rol ENUM('usuario','admin','th') NOT NULL DEFAULT 'usuario';
