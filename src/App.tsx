import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import PublicLayout from '@/components/PublicLayout';
import Hero from './sections/Hero';
import About from './sections/About';
import StayReasons from './sections/StayReasons';
import Rooms from './sections/Rooms';
import Amenities from './sections/Amenities';
import Gallery from './sections/Gallery';
import Testimonials from './sections/Testimonials';
import Contact from './sections/Contact';
import { Seo, lodgingStructuredData, websiteStructuredData } from './lib/seo';
import { useProductStore, useRoomStore } from './stores/store';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const CheckBookingPage = lazy(() => import('./pages/CheckBookingPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RoomsPage = lazy(() => import('./pages/RoomsPage'));
const RoomDetailPage = lazy(() => import('./pages/RoomDetailPage'));
const SeoLandingPage = lazy(() => import('./pages/SeoLandingPage'));
const TermsAndPrivacy = lazy(() => import('./pages/TermsAndPrivacy'));

function LandingPage() {
  const { fetchRooms } = useRoomStore();
  const { fetchProducts } = useProductStore();

  useEffect(() => {
    fetchRooms();
    fetchProducts();
  }, [fetchProducts, fetchRooms]);

  return (
    <main className="min-h-screen">
      <Seo
        title="Yada Homestay | ญาดาโฮมสเตย์ ที่พักเพชรบุรี"
        description="จองที่พักเพชรบุรีสไตล์โฮมสเตย์ที่ Yada Homestay ห้องพักสะอาด บรรยากาศสงบ ใกล้ธรรมชาติ เหมาะกับคู่รัก ครอบครัว และทริปพักผ่อน"
        path="/"
        image="/images/hero-bg.jpg"
        structuredData={[lodgingStructuredData, websiteStructuredData]}
      />
      <Hero />
      <About />
      <StayReasons />
      <Rooms />
      <Amenities />
      <Gallery />
      <Testimonials />
      <Contact />
    </main>
  );
}

function RouteFallback() {
  return <div className="min-h-screen bg-yada-sand" aria-label="กำลังโหลด" />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors closeButton />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/rooms" element={<PublicRoute><RoomsPage /></PublicRoute>} />
          <Route path="/rooms/:slug" element={<PublicRoute><RoomDetailPage /></PublicRoute>} />
          <Route path="/booking" element={<PublicRoute><BookingPage /></PublicRoute>} />
          <Route path="/check-booking" element={<PublicRoute><CheckBookingPage /></PublicRoute>} />
          <Route path="/phetchaburi-homestay" element={<PublicRoute><SeoLandingPage slug="phetchaburi-homestay" /></PublicRoute>} />
          <Route path="/family-room-phetchaburi" element={<PublicRoute><SeoLandingPage slug="family-room-phetchaburi" /></PublicRoute>} />
          <Route path="/pool-villa-phetchaburi" element={<PublicRoute><SeoLandingPage slug="pool-villa-phetchaburi" /></PublicRoute>} />
          <Route path="/nearby-attractions" element={<PublicRoute><SeoLandingPage slug="nearby-attractions" /></PublicRoute>} />
          <Route path="/terms" element={<PublicRoute><TermsAndPrivacy /></PublicRoute>} />
          <Route path="/privacy" element={<PublicRoute><TermsAndPrivacy /></PublicRoute>} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<PublicRoute><NotFound /></PublicRoute>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
