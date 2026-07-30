// backend/src/models/Price.js
const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema(
  {
    servicio: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    precio: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      default: "",
    },
    icono: {
      type: String,
      default: "✂️",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

module.exports = mongoose.model("Price", priceSchema);
