-- ─────────────────────────────────────────────────────────────
-- Portal de Capacitación · Universidad Hipócrates · Esquema MySQL
-- ─────────────────────────────────────────────────────────────
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo   VARCHAR(160) NOT NULL,
  correo            VARCHAR(160) NOT NULL UNIQUE,
  puesto            VARCHAR(160),
  area              VARCHAR(160),
  num_reloj_checador VARCHAR(40),
  rol               ENUM('usuario','admin','th') NOT NULL DEFAULT 'usuario',
  estado            ENUM('alta','baja') NOT NULL DEFAULT 'alta',
  fecha_alta        DATE,
  fecha_baja        DATE,
  ultimo_acceso     DATETIME NULL,
  creado_en         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sistemas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(160) NOT NULL,
  descripcion   VARCHAR(400),
  url_destino   VARCHAR(400),
  icono         VARCHAR(40),
  orden         INT DEFAULT 0,
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  creado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS manuales (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  sistema_id           INT NOT NULL,
  titulo               VARCHAR(200) NOT NULL,
  codigo               VARCHAR(80),
  archivo_path         VARCHAR(300) NOT NULL,   -- p.ej. SGCUH-CSRDT-M-001.pdf (dentro de /manuales)
  total_paginas        INT NOT NULL DEFAULT 1,
  version              VARCHAR(20) NOT NULL DEFAULT 'V00',
  requiere_confirmacion TINYINT(1) NOT NULL DEFAULT 0,
  creado_en            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sistema_id) REFERENCES sistemas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asignaciones (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT NOT NULL,
  sistema_id       INT NOT NULL,
  obligatorio      TINYINT(1) NOT NULL DEFAULT 1,
  asignado_por     INT NULL,
  fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_asig (usuario_id, sistema_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (sistema_id) REFERENCES sistemas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS progreso_usuario (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id     INT NOT NULL,
  manual_id      INT NOT NULL,
  leido          TINYINT(1) NOT NULL DEFAULT 0,
  paginas_vistas INT NOT NULL DEFAULT 0,
  tiempo_segundos INT NOT NULL DEFAULT 0,
  version_leida  VARCHAR(20),
  fecha_leido    DATETIME NULL,
  UNIQUE KEY uq_prog (usuario_id, manual_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (manual_id)  REFERENCES manuales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS actividades (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT NOT NULL,
  tipo_evento  ENUM('login','ver_manual','marcar_leido','click_sistema','descargar_manual','admin','quiz') NOT NULL,
  objeto_id    INT NULL,               -- id de sistema o manual segun el evento
  detalle      VARCHAR(400),
  metadata     JSON NULL,
  fecha_hora   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_act_user (usuario_id),
  INDEX idx_act_fecha (fecha_hora),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- v2: Evaluaciones (quiz generado por IA) y minijuego
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  manual_id    INT NOT NULL,
  modelo       VARCHAR(60),
  min_aprobar  INT NOT NULL DEFAULT 60,   -- % mínimo para aprobar
  activo       TINYINT(1) NOT NULL DEFAULT 1,
  generado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manual_id) REFERENCES manuales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS preguntas (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id           INT NOT NULL,
  texto             VARCHAR(500) NOT NULL,
  tipo              ENUM('opcion','vf') NOT NULL DEFAULT 'opcion',
  opciones          JSON NOT NULL,           -- ["A","B","C","D"]
  respuesta_correcta INT NOT NULL,           -- índice de la opción correcta
  explicacion       VARCHAR(500),
  orden             INT DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS palabras_clave (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  manual_id  INT NOT NULL,
  palabra    VARCHAR(40) NOT NULL,
  FOREIGN KEY (manual_id) REFERENCES manuales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS intentos_quiz (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  quiz_id     INT NOT NULL,
  puntaje     INT NOT NULL,                  -- % obtenido
  aprobado    TINYINT(1) NOT NULL DEFAULT 0,
  respuestas  JSON,
  fecha       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_intento_user (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
