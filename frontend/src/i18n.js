// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Traducciones
const resources = {
  es: {
    translation: {
      // Navbar
      nav: {
        home: "Inicio",
        services: "Servicios",
        gallery: "Galería",
        testimonials: "Testimonios",
        book: "Reservar Cita",
      },
      // Hero
      hero: {
        title: "Estilo y Elegancia para Ti",
        subtitle:
          "Cortes de cabello y arreglo de barba con los mejores estilistas. Transforma tu look con nosotros.",
        button: "Reservar por WhatsApp",
        viewServices: "Ver Servicios",
        features: {
          modern: "Cortes Modernos",
          modernDesc: "Estilos actuales y personalizados",
          beard: "Arreglo de Barba",
          beardDesc: "Diseño y mantenimiento profesional",
          experts: "Expertos",
          expertsDesc: "Barberos con años de experiencia",
        },
      },
      // Services
      services: {
        title: "Nuestros Servicios",
        subtitle:
          "Ofrecemos servicios de primera calidad para realzar tu estilo",
        book: "Reservar por WhatsApp",
      },
      // Gallery
      gallery: {
        title: "Nuestra Galería",
        subtitle: "Mira algunos de nuestros mejores trabajos",
      },
      // Testimonials
      testimonials: {
        title: "Lo que dicen nuestros clientes",
      },
      // Footer
      footer: {
        about:
          "Transformamos tu estilo con cortes modernos y arreglo de barba profesional. Calidad y elegancia en cada servicio.",
        quickLinks: "Enlaces Rápidos",
        contact: "Contacto",
        schedule: "Horario",
        weekdays: "Lunes - Viernes: 9:00 - 20:00",
        saturday: "Sábados: 9:00 - 18:00",
        sunday: "Domingos: Cerrado",
        rights: "Todos los derechos reservados.",
      },
      // Booking
      booking: {
        title: "Reserva tu Cita",
        subtitle: "Completa el formulario y te contactaremos por WhatsApp",
        name: "Nombre Completo *",
        namePlaceholder: "Ej: Juan Pérez",
        phone: "Teléfono *",
        phonePlaceholder: "+53 51028354",
        service: "Servicio *",
        servicePlaceholder: "Selecciona un servicio",
        date: "Fecha *",
        time: "Hora *",
        message: "Mensaje Adicional (Opcional)",
        messagePlaceholder: "Comentarios o requerimientos especiales...",
        button: "Enviar por WhatsApp",
        success: "¡Reserva Enviada!",
        successText: "Tu mensaje ha sido enviado a nuestro WhatsApp.",
        successSub: "Te contactaremos en breve para confirmar tu cita.",
        back: "Volver al Inicio",
      },
      // WhatsApp Button
      whatsapp: {
        tooltip: "¡Escríbenos por WhatsApp!",
      },
    },
  },
  en: {
    translation: {
      // Navbar
      nav: {
        home: "Home",
        services: "Services",
        gallery: "Gallery",
        testimonials: "Testimonials",
        book: "Book Appointment",
      },
      // Hero
      hero: {
        title: "Style and Elegance for You",
        subtitle:
          "Haircuts and beard grooming with the best stylists. Transform your look with us.",
        button: "Book via WhatsApp",
        viewServices: "View Services",
        features: {
          modern: "Modern Cuts",
          modernDesc: "Current and personalized styles",
          beard: "Beard Grooming",
          beardDesc: "Professional design and maintenance",
          experts: "Experts",
          expertsDesc: "Barbers with years of experience",
        },
      },
      // Services
      services: {
        title: "Our Services",
        subtitle: "We offer top quality services to enhance your style",
        book: "Book via WhatsApp",
      },
      // Gallery
      gallery: {
        title: "Our Gallery",
        subtitle: "Check out some of our best work",
      },
      // Testimonials
      testimonials: {
        title: "What our clients say",
      },
      // Footer
      footer: {
        about:
          "We transform your style with modern cuts and professional beard grooming. Quality and elegance in every service.",
        quickLinks: "Quick Links",
        contact: "Contact",
        schedule: "Schedule",
        weekdays: "Monday - Friday: 9:00 - 20:00",
        saturday: "Saturdays: 9:00 - 18:00",
        sunday: "Sundays: Closed",
        rights: "All rights reserved.",
      },
      // Booking
      booking: {
        title: "Book Your Appointment",
        subtitle: "Fill out the form and we will contact you via WhatsApp",
        name: "Full Name *",
        namePlaceholder: "Ex: John Doe",
        phone: "Phone *",
        phonePlaceholder: "+53 51028354",
        service: "Service *",
        servicePlaceholder: "Select a service",
        date: "Date *",
        time: "Time *",
        message: "Additional Message (Optional)",
        messagePlaceholder: "Special comments or requirements...",
        button: "Send via WhatsApp",
        success: "Booking Sent!",
        successText: "Your message has been sent to our WhatsApp.",
        successSub: "We will contact you shortly to confirm your appointment.",
        back: "Back to Home",
      },
      // WhatsApp Button
      whatsapp: {
        tooltip: "Write us on WhatsApp!",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es", // idioma por defecto
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
