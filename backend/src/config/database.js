// backend/src/config/database.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ============================================
// MODELOS (definidos aquí para mantener todo junto)
// ============================================

// Modelo de Reservas
const bookingSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    servicio: {
      type: String,
      required: true,
      enum: [
        "Corte de Cabello",
        "Arreglo de Barba",
        "Combo Completo",
        "Teñido",
        "Ceremonia de Afeitado",
      ],
    },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    mensaje: { type: String, default: "" },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "completada", "cancelada"],
      default: "pendiente",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Modelo de Galería
const gallerySchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    orden: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Modelo de Usuarios
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    reset_token: { type: String, default: null },
    reset_token_expires: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Método para comparar contraseña
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Crear los modelos
const Booking = mongoose.model("Booking", bookingSchema);
const Gallery = mongoose.model("Gallery", gallerySchema);
const User = mongoose.model("User", userSchema);

// ============================================
// FUNCIÓN PARA CREAR USUARIO POR DEFECTO
// ============================================
const createDefaultUser = async () => {
  try {
    const defaultEmail = "hectorpedraza624@gmail.com";
    const defaultPassword = "Admin123!";

    const existingUser = await User.findOne({ email: defaultEmail });

    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const newUser = new User({
        email: defaultEmail,
        password: hashedPassword,
      });

      await newUser.save();

      console.log("✅ Usuario por defecto creado:");
      console.log(`   📧 Email: ${defaultEmail}`);
      console.log(`   🔑 Contraseña: ${defaultPassword}`);
    } else {
      console.log("ℹ️ Usuario por defecto ya existe");
    }
  } catch (error) {
    console.error("❌ Error al crear usuario por defecto:", error.message);
  }
};

// ============================================
// FUNCIÓN PRINCIPAL DE CONEXIÓN
// ============================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);

    // Crear usuario por defecto automáticamente
    await createDefaultUser();

    return conn;
  } catch (error) {
    console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// ============================================
// EXPORTAR TODO (¡ESTA ES LA CLAVE!)
// ============================================
module.exports = {
  connectDB,
  Booking,
  Gallery,
  User,
  createDefaultUser,
};
