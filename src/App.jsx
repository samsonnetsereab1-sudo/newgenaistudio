// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './layout/AppShell';
import DashboardHome from './pages/DashboardHome';
import BuilderView from './pages/BuilderView';
import SupportDesk from './pages/SupportDesk';
import PluginMarketplace from './components/PluginMarketplace';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<DashboardHome />} />
          <Route path="build" element={<BuilderView />} />
          <Route path="plugins" element={<PluginMarketplace />} />
          <Route path="support" element={<SupportDesk />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
