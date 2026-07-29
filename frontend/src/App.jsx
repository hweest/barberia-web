// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import BookingForm from "./components/BookingForm";
import WhatsAppButton from "./components/WhatsAppButton";
import AdminPanel from "./components/AdminPanel";
import ResetPassword from "./components/ResetPassword"; // ← IMPORTAR
import "./styles/App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Services />
                <Gallery />
                <Testimonials />
              </>
            }
          />
          <Route path="/reservar" element={<BookingForm />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/reset-password" element={<ResetPassword />} />{" "}
          {/* ← NUEVA RUTA */}
        </Routes>
        <Footer />
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;
