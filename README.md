# Portal de Capacitación · Universidad Hipócrates

Sistema de onboarding y capacitación del personal administrativo.
Los empleados leen los manuales (PDF) de cada sistema que se les asigna y desbloquean el
acceso; el administrador da de alta usuarios, asigna sistemas y ve el registro de actividad.

## Stack
- **Next.js 14** (App Router) + React
- **MySQL** (base de datos)
- **Auth.js (NextAuth v5)** con Google, restringido al dominio + allowlist
- **PDF.js / react-pdf** para el visor de manuales página por página
- **Nodemailer (SMTP)** para avisar al admin cuando alguien termina un manual

## 1. Requisitos
- Node.js 18.18+ (ideal 20 LTS)
- Una base de datos MySQL (local o de Hostinger)
- Un proyecto en Google Cloud Console con credenciales OAuth
- Una cuenta de correo para enviar avisos (SMTP)

## 2. Instalación local
```bash
npm install
cp .env.example .env.local     # y rellena tus credenciales
npm run db:setup               # crea tablas y datos iniciales (usa .env.local)
npm run dev                    # http://localhost:3000
```

> Antes de `db:setup`, edita `db/seed.sql` y pon **tu** correo como administrador.

## 3. Credenciales (todo va en .env.local)
Ver `.env.example`. Necesitas:
- **MySQL**: host, puerto, usuario, contraseña, nombre de la BD.
- **Google OAuth**: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
- **AUTH_SECRET**: genéralo con `npx auth secret`.
- **SMTP**: host, puerto, usuario, contraseña y `ADMIN_EMAIL` (a dónde llegan los avisos).

### Configurar Google OAuth
1. Google Cloud Console → APIs y servicios → Pantalla de consentimiento (tipo **Interno** si el
   Workspace lo permite).
2. Credenciales → Crear credenciales → **ID de cliente de OAuth** (tipo *Aplicación web*).
3. En **URIs de redirección autorizados** agrega:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://TU-DOMINIO/api/auth/callback/google` (producción)
4. Copia el Client ID y el Secret al `.env.local`.

## 4. Cómo funciona el acceso
- Solo entran correos **@uhipocrates.edu.mx** que además existan en la tabla `usuarios`
  con estado `alta` (la *allowlist*). La validación es **en el servidor** (`auth.js`).
- Un sistema **sin manual** deja el acceso **abierto**. Con manual, el acceso se **desbloquea
  al marcar el manual como leído** (tras llegar a la última página).
- Al marcar un manual como leído se registra en `progreso_usuario` + `actividades` y se
  **envía un correo al administrador**.

## 5. Manuales (PDF)
- Los PDF viven en la carpeta `/manuales` (fuera de `public`, se sirven por una ruta protegida
  `GET /api/manual/[sistemaId]` que valida sesión y asignación).
- El manual del SAE ya viene incluido: `manuales/SGCUH-CSRDT-M-001.pdf`.
- Para un manual nuevo: sube el PDF a `/manuales` y crea su registro en la tabla `manuales`
  (o desde la pantalla de administración cuando se agregue el formulario de subida).

## 6. Estructura
```
auth.js                    Config de Auth.js (dominio + allowlist)
middleware… (no se usa)    La protección se hace en cada página (Node runtime, por MySQL)
db/schema.sql              Tablas
db/seed.sql                Datos iniciales (admin, sistemas, manual SAE)
db/setup.js                Ejecuta schema + seed
lib/db.js                  Pool MySQL
lib/queries.js             Todas las consultas
lib/mailer.js              Aviso por correo al admin
lib/guard.js               requireUser / requireAdmin
app/login                  Pantalla de Google
app/dashboard              Panel del empleado (+ visor PDF)
app/admin                  Panel del administrador
app/api/*                  Rutas: actividad, progreso, asignaciones, usuarios, manual
manuales/                  PDFs privados
```

## 7. Despliegue en Hostinger (Node.js Hosting)
1. Sube el repo a GitHub.
2. En hPanel → **Node.js**: conecta el repositorio, comando de build `npm run build`,
   comando de inicio `npm start`.
3. Crea la base de datos MySQL en hPanel y corre `db/schema.sql` + `db/seed.sql`
   (desde phpMyAdmin o `npm run db:setup`).
4. Carga las mismas variables del `.env.local` en el panel de variables de entorno de Hostinger,
   cambiando `AUTH_URL` a tu dominio real.
5. Agrega en Google Cloud la URI de redirección de producción.
6. Apunta el subdominio (p.ej. `capacitacion.uhipocrates.edu.mx`) y activa SSL.

## Notas / siguientes pasos
- Formulario de subida de manuales y CRUD de sistemas desde el admin (la BD ya lo soporta).
- Reportes con exportación a Excel/CSV y filtros.
- Versionado de manuales (re-lectura obligatoria al actualizar).
- Endurecer el visor: exigir tiempo mínimo y registrar todas las páginas, no solo la última.

---

---

## v3 · Juego capturado por el administrador (sin IA, sin preguntas)

Esta versión **no usa ninguna API de pago**. El admin captura a mano solo las palabras clave del
manual y elige con qué juego se practican; no hay banco de preguntas que mantener.

- **Juego por manual**: el admin elige entre **sopa de letras** o **ahorcado** y captura las
  palabras clave (3 a 12 letras, sin acentos, máximo 10). El colaborador lo juega justo después
  de terminar de leer el manual — es una práctica ligera, no un examen con calificación.
- **Aviso al admin**: al marcar el manual como leído se registra en `progreso_usuario` y se envía
  el correo, igual que antes.

### Cómo configurar el juego (admin)
1. Pestaña **Sistemas** → crea el sistema si no existe.
2. Pestaña **Manuales y juegos** → sube el PDF.
3. En la lista del manual, botón **Configurar juego** → elige sopa de letras o ahorcado, agrega las
   palabras → **Guardar**.
4. Asigna el sistema al personal en **Asignaciones**.

### Sin credenciales de IA
Ya **no** se necesita `ANTHROPIC_API_KEY`. El `.env.local` solo requiere MySQL, Auth/Google y SMTP.

### Tablas usadas
`quizzes` (guarda el tipo de juego en la columna `modelo`) y `palabras_clave`, ya incluidas en
`db/schema.sql`. Las tablas `preguntas` e `intentos_quiz` quedan en el esquema por compatibilidad
pero ya no las usa la aplicación.
