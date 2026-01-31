import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Rooms from './sections/Rooms';
import Amenities from './sections/Amenities';
import Gallery from './sections/Gallery';
import Testimonials from './sections/Testimonials';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import AdminDashboard from './pages/AdminDashboard';
import BookingPage from './pages/BookingPage';
import CheckBookingPage from './pages/CheckBookingPage';
import NotFound from './pages/NotFound';
import TermsAndPrivacy from './pages/TermsAndPrivacy';
import { useRoomStore, useProductStore } from './stores/supabaseStore';

// Landing Page Component
function LandingPage() {
  const { fetchRooms } = useRoomStore();
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    fetchRooms();
    fetchProducts();
  }, [fetchRooms, fetchProducts]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Rooms />
      <Amenities />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/check-booking" element={<CheckBookingPage />} />
        <Route path="/terms" element={<TermsAndPrivacy />} />
        <Route path="/privacy" element={<TermsAndPrivacy />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
