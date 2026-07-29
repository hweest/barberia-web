// backend/src/controllers/bookingController.js
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");

// ============================================
// CREAR UNA NUEVA RESERVA
// ============================================
exports.createBooking = async (req, res) => {
  try {
    const { nombre, telefono, servicio, fecha, hora, mensaje } = req.body;

    // Verificar que todos los campos estén presentes
    if (!nombre || !telefono || !servicio || !fecha || !hora) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    // Crear la reserva
    const booking = await Booking.create({
      nombre,
      telefono,
      servicio,
      fecha,
      hora,
      mensaje: mensaje || "",
    });

    // Enviar notificación por correo (opcional)
    await sendEmailNotification(booking);

    res.status(201).json({
      success: true,
      message: "✅ Reserva creada exitosamente",
      data: booking,
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la reserva",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER TODAS LAS RESERVAS
// ============================================
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las reservas",
    });
  }
};

// ============================================
// OBTENER UNA RESERVA POR ID
// ============================================
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error al obtener reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la reserva",
    });
  }
};

// ============================================
// ACTUALIZAR ESTADO DE UNA RESERVA
// ============================================
exports.updateBookingStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Estado actualizado correctamente",
      data: booking,
    });
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la reserva",
    });
  }
};

// ============================================
// ELIMINAR UNA RESERVA
// ============================================
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada",
      });
    }
    res.status(200).json({
      success: true,
      message: "✅ Reserva eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la reserva",
    });
  }
};

// ============================================
// ENVIAR NOTIFICACIÓN POR CORREO
// ============================================
async function sendEmailNotification(booking) {
  try {
    // Configurar el transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `📋 Nueva Reserva - ${booking.nombre}`,
      html: `
        <h2>📋 Nueva Reserva en la Barbería</h2>
        <p><strong>👤 Nombre:</strong> ${booking.nombre}</p>
        <p><strong>📱 Teléfono:</strong> ${booking.telefono}</p>
        <p><strong>✂️ Servicio:</strong> ${booking.servicio}</p>
        <p><strong>📅 Fecha:</strong> ${new Date(booking.fecha).toLocaleDateString("es-ES")}</p>
        <p><strong>🕐 Hora:</strong> ${booking.hora}</p>
        <p><strong>💬 Mensaje:</strong> ${booking.mensaje || "Sin mensaje"}</p>
        <hr>
        <p><strong>🆔 ID:</strong> ${booking._id}</p>
        <p><small>📅 Creado: ${new Date(booking.created_at).toLocaleString("es-ES")}</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Correo enviado para ${booking.nombre}`);
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
  }
}
