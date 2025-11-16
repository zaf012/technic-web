import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './Layout';
import CariHesaplar from './pages/CariHesaplar';
import CariGrupTanimlari from './pages/CariGrupTanimlari';
import Teklifler from './pages/Teklifler';
import Personeller from './pages/Personeller';
import UserTypes from './pages/UserTypes';
import Firms from './pages/Firms';
import Projects from './pages/Projects';
import Sites from './pages/Sites';
import Blocks from './pages/Blocks';
import Squares from './pages/Squares';
import Systems from './pages/Systems';
import InventoryCategory from './pages/InventoryCategory';
import SiteDeviceInventory from './pages/SiteDeviceInventory';

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
          <Route path="/projeler" element={<Projects />} />
          <Route path="/siteler" element={<Sites />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/squares" element={<Squares />} />
          <Route path="/sistemler" element={<Systems />} />
          <Route path="/urun-envanter" element={<InventoryCategory />} />
          <Route path="/site-cihaz-envanteri" element={<SiteDeviceInventory />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
