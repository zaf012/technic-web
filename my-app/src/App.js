import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './Layout';
import CariHesaplar from './pages/CariHesaplar';
import CariGrupTanimlari from './pages/CariGrupTanimlari';
import Teklifler from './pages/Teklifler';
import Personeller from './pages/Personeller';
import UserTypes from './pages/UserTypes';
import Sites from './pages/Sites';
import Blocks from './pages/Blocks';
import Squares from './pages/Squares';
import Systems from './pages/Systems';
import ProductInventoryCategories from "./pages/ProductInventoryCategories";
import ProductInventoryDetail from "./pages/ProductInventoryDetail";
import SiteProductInventoryDetail from "./pages/SiteProductInventoryDetail";
import ServiceCases from "./pages/ServiceCases";
import MaintenancePdf from "./pages/MaintenancePdf";

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
          <Route path="/siteler" element={<Sites />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/squares" element={<Squares />} />
          <Route path="/sistemler" element={<Systems />} />
          <Route path="/urun-envanter-kategoriler" element={<ProductInventoryCategories />} />
          <Route path="/urun-envanter-listesi" element={<ProductInventoryDetail />} />
          <Route path="/site-cihaz-envanteri" element={<SiteProductInventoryDetail />} />
          <Route path="/hizmet-kosullari" element={<ServiceCases />} />
          <Route path="/bakim-pdf-yonetimi" element={<MaintenancePdf />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
