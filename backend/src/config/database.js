// backend/src/config/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "../../barberia.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error al conectar con SQLite:", err.message);
  } else {
    console.log("✅ Conectado a SQLite (barberia.db)");
  }
});

// ============================================
// TABLA DE RESERVAS
// ============================================
db.run(
  `
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    servicio TEXT NOT NULL,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    mensaje TEXT,
    estado TEXT DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Error al crear tabla bookings:", err.message);
    } else {
      console.log('✅ Tabla "bookings" lista');
    }
  },
);

// ============================================
// TABLA DE GALERÍA
// ============================================
db.run(
  `
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    orden INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Error al crear tabla gallery:", err.message);
    } else {
      console.log('✅ Tabla "gallery" lista');
    }
  },
);

// ============================================
// TABLA DE USUARIOS (NUEVA)
// ============================================
db.run(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Error al crear tabla users:", err.message);
    } else {
      console.log('✅ Tabla "users" lista');

      // Crear usuario por defecto (solo si no existe)
      const defaultEmail = "hectorpedraza624@gmail.com";
      const defaultPassword = "Admin123!";

      db.get(
        "SELECT * FROM users WHERE email = ?",
        [defaultEmail],
        (err, row) => {
          if (err) {
            console.error("❌ Error al verificar usuario:", err);
            return;
          }

          if (!row) {
            // Encriptar contraseña
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(defaultPassword, salt);

            db.run(
              "INSERT INTO users (email, password) VALUES (?, ?)",
              [defaultEmail, hashedPassword],
              (err) => {
                if (err) {
                  console.error("❌ Error al crear usuario por defecto:", err);
                } else {
                  console.log("✅ Usuario por defecto creado:");
                  console.log(`   📧 Email: ${defaultEmail}`);
                  console.log(`   🔑 Contraseña: ${defaultPassword}`);
                }
              },
            );
          }
        },
      );
    }
  },
);

module.exports = db;
