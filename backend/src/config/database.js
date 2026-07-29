// backend/src/config/database.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Conecta a MongoDB Atlas
 * Usa la variable de entorno MONGODB_URI
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);

    // Crear usuario por defecto después de conectar
    await createDefaultUser();

    return conn;
  } catch (error) {
    console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Crear usuario por defecto (solo si no existe)
 * Mantiene la misma funcionalidad que tenías en SQLite
 */
const createDefaultUser = async () => {
  try {
    const User = require("../models/User");
    const defaultEmail = "hectorpedraza624@gmail.com";
    const defaultPassword = "Admin123!";

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: defaultEmail });

    if (!existingUser) {
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      // Crear usuario
      const user = new User({
        email: defaultEmail,
        password: hashedPassword,
      });

      await user.save();

      console.log("✅ Usuario por defecto creado:");
      console.log(`   📧 Email: ${defaultEmail}`);
      console.log(`   🔑 Contraseña: ${defaultPassword}`);
    } else {
      console.log("✅ Usuario por defecto ya existe");
    }
  } catch (error) {
    console.error("❌ Error al crear usuario por defecto:", error);
  }
};

module.exports = connectDB;
