// Todas las consultas a la base de datos viven aquí.
import { q } from "@/lib/db";

// ── Usuarios / auth ──
export async function getUsuarioByCorreo(correo) {
  const rows = await q("SELECT * FROM usuarios WHERE correo = ? LIMIT 1", [correo]);
  return rows[0] || null;
}
export async function touchUltimoAcceso(usuarioId) {
  await q("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?", [usuarioId]);
}

// ── Actividad (log) ──
export async function logActividad(usuarioId, tipoEvento, objetoId, detalle, metadata = null) {
  await q(
    "INSERT INTO actividades (usuario_id, tipo_evento, objeto_id, detalle, metadata) VALUES (?,?,?,?,?)",
    [usuarioId, tipoEvento, objetoId, detalle, metadata ? JSON.stringify(metadata) : null]
  );
}
export async function listActividades(limite = 200) {
  return q(
    `SELECT a.*, u.nombre_completo, u.correo
     FROM actividades a JOIN usuarios u ON u.id = a.usuario_id
     ORDER BY a.fecha_hora DESC LIMIT ?`,
    [limite]
  );
}

// ── Sistemas asignados a un empleado (con estado de lectura/visita) ──
export async function getSistemasDeUsuario(usuarioId) {
  return q(
    `SELECT s.id, s.nombre, s.descripcion, s.url_destino,
            m.id AS manual_id, m.titulo AS manual_titulo, m.codigo AS manual_codigo,
            m.total_paginas, m.archivo_path,
            CASE
              WHEN LOWER(m.archivo_path) REGEXP '\\.(mp4|webm|ogg|mov|m4v)$' THEN 'video'
              WHEN m.archivo_path IS NULL THEN NULL
              ELSE 'pdf'
            END AS material_tipo,
            m.requiere_confirmacion,
            (p.leido = 1) AS leido,
            EXISTS(SELECT 1 FROM quizzes qz WHERE qz.manual_id = m.id AND qz.activo=1) AS tiene_quiz,
            EXISTS(SELECT 1 FROM actividades a
                   WHERE a.usuario_id = ? AND a.tipo_evento='click_sistema' AND a.objeto_id = s.id) AS visitado
     FROM asignaciones asig
     JOIN sistemas s ON s.id = asig.sistema_id AND s.activo = 1
     LEFT JOIN manuales m ON m.sistema_id = s.id
     LEFT JOIN progreso_usuario p ON p.manual_id = m.id AND p.usuario_id = ?
     WHERE asig.usuario_id = ?
     ORDER BY s.orden, s.id`,
    [usuarioId, usuarioId, usuarioId]
  );
}

export async function getManualDeSistema(sistemaId) {
  const rows = await q("SELECT * FROM manuales WHERE sistema_id = ? LIMIT 1", [sistemaId]);
  return rows[0] || null;
}
export async function usuarioTieneSistema(usuarioId, sistemaId) {
  const rows = await q(
    "SELECT 1 FROM asignaciones WHERE usuario_id = ? AND sistema_id = ? LIMIT 1",
    [usuarioId, sistemaId]
  );
  return rows.length > 0;
}

// ── Marcar manual como leído ──
export async function marcarManualLeido(usuarioId, manualId, paginasVistas, version) {
  await q(
    `INSERT INTO progreso_usuario (usuario_id, manual_id, leido, paginas_vistas, version_leida, fecha_leido)
     VALUES (?,?,1,?,?,NOW())
     ON DUPLICATE KEY UPDATE leido=1, paginas_vistas=VALUES(paginas_vistas),
       version_leida=VALUES(version_leida), fecha_leido=NOW()`,
    [usuarioId, manualId, paginasVistas, version]
  );
}

// ── Admin: alta / baja / listado ──
export async function altaUsuario(d) {
  const r = await q(
    `INSERT INTO usuarios (nombre_completo, correo, puesto, area, num_reloj_checador, rol, estado, fecha_alta)
     VALUES (?,?,?,?,?,?, 'alta', CURDATE())`,
    [d.nombre_completo, d.correo.toLowerCase(), d.puesto, d.area, d.num_reloj_checador, d.rol || "usuario"]
  );
  return r.insertId;
}
export async function bajaUsuario(usuarioId) {
  await q("UPDATE usuarios SET estado='baja', fecha_baja=CURDATE() WHERE id=?", [usuarioId]);
}
export async function listUsuarios() {
  return q("SELECT * FROM usuarios ORDER BY estado, nombre_completo");
}
export async function listSistemas() {
  return q("SELECT * FROM sistemas ORDER BY orden, id");
}

// ── Admin: asignaciones ──
export async function getAsignacionesDe(usuarioId) {
  const rows = await q("SELECT sistema_id FROM asignaciones WHERE usuario_id=?", [usuarioId]);
  return rows.map((r) => r.sistema_id);
}
export async function setAsignacion(usuarioId, sistemaId, activar, adminId) {
  if (activar) {
    await q(
      "INSERT IGNORE INTO asignaciones (usuario_id, sistema_id, asignado_por) VALUES (?,?,?)",
      [usuarioId, sistemaId, adminId]
    );
  } else {
    await q("DELETE FROM asignaciones WHERE usuario_id=? AND sistema_id=?", [usuarioId, sistemaId]);
  }
}

// ── v2: Quizzes / evaluación ──
export async function guardarQuiz(manualId, evaluacion) {
  await q("UPDATE quizzes SET activo=0 WHERE manual_id=?", [manualId]);
  const r = await q("INSERT INTO quizzes (manual_id, modelo, min_aprobar, activo) VALUES (?,?,?,1)",
    [manualId, evaluacion.modelo || "manual", evaluacion.min_aprobar || 60]);
  const quizId = r.insertId;
  let orden = 0;
  for (const p of evaluacion.preguntas) {
    await q(
      "INSERT INTO preguntas (quiz_id, texto, tipo, opciones, respuesta_correcta, explicacion, orden) VALUES (?,?,?,?,?,?,?)",
      [quizId, p.texto, p.tipo, JSON.stringify(p.opciones), p.respuesta_correcta, p.explicacion, orden++]
    );
  }
  await q("DELETE FROM palabras_clave WHERE manual_id=?", [manualId]);
  for (const w of evaluacion.palabras_clave) {
    await q("INSERT INTO palabras_clave (manual_id, palabra) VALUES (?,?)", [manualId, w]);
  }
  return quizId;
}

// Quiz para el empleado (sin revelar la respuesta correcta).
export async function getQuizParaUsuario(sistemaId) {
  const manuales = await q("SELECT id FROM manuales WHERE sistema_id=? LIMIT 1", [sistemaId]);
  if (!manuales[0]) return null;
  const quizzes = await q("SELECT * FROM quizzes WHERE manual_id=? AND activo=1 LIMIT 1", [manuales[0].id]);
  if (!quizzes[0]) return null;
  const preguntas = await q("SELECT id, texto, tipo, opciones FROM preguntas WHERE quiz_id=? ORDER BY orden", [quizzes[0].id]);
  const palabras = await q("SELECT palabra FROM palabras_clave WHERE manual_id=?", [manuales[0].id]);
  return {
    quizId: quizzes[0].id,
    minAprobar: quizzes[0].min_aprobar,
    preguntas: preguntas.map((p) => ({ id: p.id, texto: p.texto, tipo: p.tipo, opciones: parseJSON(p.opciones) })),
    palabras: palabras.map((w) => w.palabra),
  };
}

// Califica en el servidor (nunca en el cliente).
export async function calificarIntento(usuarioId, quizId, respuestas) {
  const preguntas = await q("SELECT id, respuesta_correcta, explicacion FROM preguntas WHERE quiz_id=? ORDER BY orden", [quizId]);
  const quiz = (await q("SELECT * FROM quizzes WHERE id=? LIMIT 1", [quizId]))[0];
  let correctas = 0;
  const detalle = preguntas.map((p) => {
    const dada = respuestas[p.id];
    const ok = Number(dada) === Number(p.respuesta_correcta);
    if (ok) correctas++;
    return { preguntaId: p.id, correcta: p.respuesta_correcta, dada, ok, explicacion: p.explicacion };
  });
  const puntaje = Math.round((correctas / preguntas.length) * 100);
  const aprobado = puntaje >= (quiz?.min_aprobar || 60);
  await q("INSERT INTO intentos_quiz (usuario_id, quiz_id, puntaje, aprobado, respuestas) VALUES (?,?,?,?,?)",
    [usuarioId, quizId, puntaje, aprobado ? 1 : 0, JSON.stringify(respuestas)]);
  return { puntaje, aprobado, correctas, total: preguntas.length, detalle, manualId: quiz?.manual_id };
}

export async function manualTieneQuiz(manualId) {
  const r = await q("SELECT 1 FROM quizzes WHERE manual_id=? AND activo=1 LIMIT 1", [manualId]);
  return r.length > 0;
}

// ── v2: Admin — crear sistema / registrar manual ──
export async function crearSistema(d) {
  const r = await q(
    "INSERT INTO sistemas (nombre, descripcion, url_destino, orden) VALUES (?,?,?,?)",
    [d.nombre, d.descripcion || null, d.url_destino || null, d.orden || 0]
  );
  return r.insertId;
}
export async function registrarManual(d) {
  const r = await q(
    "INSERT INTO manuales (sistema_id, titulo, codigo, archivo_path, total_paginas, version) VALUES (?,?,?,?,?,?)",
    [d.sistema_id, d.titulo, d.codigo || null, d.archivo_path, d.total_paginas || 1, d.version || "V00"]
  );
  return r.insertId;
}
export async function getManualPorId(manualId) {
  const r = await q("SELECT * FROM manuales WHERE id=? LIMIT 1", [manualId]);
  return r[0] || null;
}

// ── v2: Reporte de avance (para exportar) ──
export async function reporteAvance() {
  return q(
    `SELECT u.nombre_completo, u.correo, u.area, s.nombre AS sistema,
            CASE WHEN p.leido=1 THEN 'Leído' ELSE 'Pendiente' END AS estado_manual,
            p.fecha_leido,
            (SELECT MAX(iq.puntaje) FROM intentos_quiz iq
               JOIN quizzes qz ON qz.id=iq.quiz_id
               WHERE iq.usuario_id=u.id AND qz.manual_id=m.id) AS mejor_puntaje
     FROM asignaciones asig
     JOIN usuarios u ON u.id=asig.usuario_id
     JOIN sistemas s ON s.id=asig.sistema_id
     LEFT JOIN manuales m ON m.sistema_id=s.id
     LEFT JOIN progreso_usuario p ON p.manual_id=m.id AND p.usuario_id=u.id
     ORDER BY u.nombre_completo, s.nombre`
  );
}

function parseJSON(v) { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; } }

export async function listManuales() {
  return q(
    `SELECT m.id, m.titulo, m.codigo, m.version, m.total_paginas, m.sistema_id, m.archivo_path,
            CASE
              WHEN LOWER(m.archivo_path) REGEXP '\\.(mp4|webm|ogg|mov|m4v)$' THEN 'video'
              ELSE 'pdf'
            END AS material_tipo,
            s.nombre AS sistema_nombre,
            EXISTS(SELECT 1 FROM quizzes qz WHERE qz.manual_id=m.id AND qz.activo=1) AS tiene_quiz
     FROM manuales m JOIN sistemas s ON s.id=m.sistema_id
     ORDER BY s.nombre`
  );
}

// ── v3: Editor manual de evaluaciones (admin) ──
export async function getQuizAdmin(manualId) {
  const quizzes = await q("SELECT * FROM quizzes WHERE manual_id=? AND activo=1 LIMIT 1", [manualId]);
  const palabras = await q("SELECT palabra FROM palabras_clave WHERE manual_id=?", [manualId]);
  if (!quizzes[0]) return { quizId: null, minAprobar: 60, preguntas: [], palabras: palabras.map((w) => w.palabra) };
  const preguntas = await q("SELECT texto, tipo, opciones, respuesta_correcta, explicacion FROM preguntas WHERE quiz_id=? ORDER BY orden", [quizzes[0].id]);
  return {
    quizId: quizzes[0].id,
    minAprobar: quizzes[0].min_aprobar,
    preguntas: preguntas.map((p) => ({ texto: p.texto, tipo: p.tipo, opciones: parseJSON2(p.opciones), respuesta_correcta: p.respuesta_correcta, explicacion: p.explicacion })),
    palabras: palabras.map((w) => w.palabra),
  };
}
function parseJSON2(v) { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; } }
