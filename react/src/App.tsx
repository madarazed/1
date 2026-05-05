import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Catalogo from './pages/Catalogo';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import AdminCatalog from './pages/AdminCatalog';
import AdminInventory from './pages/AdminInventory';
import Logistica from './pages/Logistica';
import LogisticsNav from './pages/LogisticsNav';
import LogisticsDrivers from './pages/LogisticsDrivers';
import FleetManagement from './pages/FleetManagement';
import LogisticsAdmin from './pages/LogisticsAdmin';
import UserManagement from './pages/UserManagement';
import ReportCenter from './pages/ReportCenter';
import DashboardOverview from './pages/DashboardOverview';
import SettingsManager from './pages/SettingsManager';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas Públicas */}
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/catalogo" element={<Catalogo />} />
      </Route>

      <Route path="/repartidor/checkin" element={<Logistica />} />

      {/* Rutas Privadas Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="catalogo" element={<AdminCatalog />} />
        <Route path="inventario" element={<AdminInventory />} />
        <Route path="logistica" element={<LogisticsNav />} />
        <Route path="logistica/repartidores" element={<LogisticsDrivers />} />
        <Route path="logistica/repartidor/:id" element={<Logistica />} />
        <Route path="logistica/vehiculos" element={<FleetManagement />} />
        <Route path="logistica/vehiculo/:placa" element={<div className="p-8">Detalle del Vehículo en Construcción</div>} />
        
        <Route path="torre-control" element={<LogisticsAdmin />} />
        <Route path="usuarios" element={<UserManagement />} />
        <Route path="reportes" element={<ReportCenter />} />
        <Route path="contabilidad" element={<div className="p-8 text-center font-bold text-gray-400 uppercase tracking-widest animate-pulse">Módulo de Contabilidad en Construcción</div>} />
        <Route path="configuracion" element={<SettingsManager />} />
      </Route>
    </Routes>
  );
}

export default App;
