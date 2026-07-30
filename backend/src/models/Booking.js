// backend/src/models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    telefono: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
      trim: true,
    },
    servicio: {
      type: String,
      required: [true, "El servicio es obligatorio"],
      trim: true,
    },
    fecha: {
      type: Date,
      required: [true, "La fecha es obligatoria"],
    },
    hora: {
      type: String,
      required: [true, "La hora es obligatoria"],
    },
    mensaje: {
      type: String,
      default: "",
    },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "completada", "cancelada"],
      default: "pendiente",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
