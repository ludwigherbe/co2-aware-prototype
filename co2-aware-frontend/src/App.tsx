// co2-aware-frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import CartPage from './pages/CartPage.tsx';
import MainLayout from './layouts/MainLayout.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routen, die das Hauptlayout (mit Header etc.) verwenden */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/warenkorb" element={<CartPage />} />
        </Route>

        {/* Routen ohne das Hauptlayout, z.B. für einen fokussierten Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Fallback für unbekannte Routen */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;