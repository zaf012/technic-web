import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './Layout';
import CariHesaplar from './pages/CariHesaplar';
import CariGrupTanimlari from './pages/CariGrupTanimlari';
import Teklifler from './pages/Teklifler';
import Personeller from './pages/Personeller';
import UserTypes from './pages/UserTypes';
import Firms from './pages/Firms';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/cari-hesaplar" element={<CariHesaplar />} />
          <Route path="/cari-grup-tanimlari" element={<CariGrupTanimlari />} />
          <Route path="/teklifler" element={<Teklifler />} />
          <Route path="/personeller" element={<Personeller />} />
          <Route path="/kullanici-tipleri" element={<UserTypes />} />
          <Route path="/firmalar" element={<Firms />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App; 