-- ── Datos iniciales ──
-- 1) Cambia el correo del admin por el tuyo antes de correr esto.
INSERT INTO usuarios (nombre_completo, correo, puesto, area, rol, estado, fecha_alta)
VALUES ('Ángel Jared Vázquez Román', 'desarrollo.sistemas@uhipocrates.edu.mx',
        'Desarrollador de Software', 'Coord. de Sistemas, Redes y Desarrollo Tecnológico',
        'admin', 'alta', CURDATE())
ON DUPLICATE KEY UPDATE rol='admin';

-- 2) Sistemas base
INSERT INTO sistemas (nombre, descripcion, url_destino, orden) VALUES
('Mi Escuela (SAE)', 'App web de administración escolar: inscripciones, calificaciones y expedientes.', 'https://www.mi-escuelamx.com/UHIPOCRATES/', 1),
('Correo institucional', 'Google Workspace: correo, calendario y Drive.', 'https://mail.google.com', 2),
('SIADUH', 'Sistema de información y administración de la universidad.', 'https://siaduh.uhipocrates.edu.mx', 3);

-- 3) Manual del SAE (el PDF ya viene en /manuales)
INSERT INTO manuales (sistema_id, titulo, codigo, archivo_path, total_paginas, version)
SELECT id, 'Manual de funcionamiento del Sistema de Administración Escolar (SAE)',
       'SGCUH-CSRDT-M-001', 'SGCUH-CSRDT-M-001.pdf', 54, 'V00'
FROM sistemas WHERE nombre = 'Mi Escuela (SAE)' LIMIT 1;

-- 4) Asigna todos los sistemas al admin (para que pruebes la vista de empleado)
INSERT IGNORE INTO asignaciones (usuario_id, sistema_id, asignado_por)
SELECT u.id, s.id, u.id FROM usuarios u CROSS JOIN sistemas s
WHERE u.correo = 'desarrollo.sistemas@uhipocrates.edu.mx';
