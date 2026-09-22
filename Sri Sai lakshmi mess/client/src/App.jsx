import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import MenuPage from './pages/Menu';
import AboutPage from './pages/About';
import GalleryPage from './pages/Gallery';
import OrderEnquiry from './pages/OrderEnquiry';
import ContactPage from './pages/Contact';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OrderTracking from './pages/OrderTracking';
import Admin from './pages/Admin';
import CustomerDashboard from './pages/CustomerDashboard';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Auth pages (no layout wrapper) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Main site with layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="order" element={<OrderEnquiry />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="track-order" element={<OrderTracking />} />
            <Route path="admin" element={<Admin />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

        {/* Global Slide-over Food Cart & Checkout Drawer */}
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  );
}
