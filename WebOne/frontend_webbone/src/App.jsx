import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

import ProductsPage from './pages/ProductsPage';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsAdminPage from './pages/AdminProductsPage';
import ClientFilesPage from './pages/ClientFilesPage.jsx';
import ClientFolderPage from './pages/ClientFolderPage.jsx';
import AdminClientsPage from './pages/AdminClientsPage.jsx';
import AdminGroupsPage from './pages/AdminGroupsPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminSettingsPage from './pages/AdminSettingsPage.jsx';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import DataVisualizer from "./pages/DataVizualizer";
import RailProfilePage from "./pages/RailProfilePage";
import TGMVisualizer from "./pages/tgm/components/DataVisualizerClient";
import TGMConfiguration from "./pages/tgm/components/ConfigurationPage";
import GeneralConfigurationPage from "./pages/general-configuration/GeneralConfigurationPage";
import MaintenancePage from "./pages/maintenance/MaintenancePage";
import TaipeiScaffoldPage from "./pages/taipei/TaipeiScaffoldPage";

function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Tutte le route protette con sidebar persistente */}
      <Route element={<LayoutWithSidebar />}>
        <Route path="/admin/users" element={<ProtectedRoute roles={["superadmin","admin","cliente"]}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/groups" element={<ProtectedRoute roles={["superadmin","admin","cliente"]}><AdminGroupsPage /></ProtectedRoute>} />
        <Route path="/admin/clients" element={<ProtectedRoute roles={["superadmin"]}><AdminClientsPage /></ProtectedRoute>} />
  <Route path="/admin/settings" element={<ProtectedRoute roles={["superadmin"]}><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
        <Route path='/Dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path='/product/:id' element={<ProtectedRoute><ProductDetail/></ProtectedRoute>}/>
        <Route path='/productedit' element={<ProtectedRoute><ProductsAdminPage/></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><ClientFilesPage level="project" /></ProtectedRoute>} />
        <Route path="/files/:project" element={<ProtectedRoute><ClientFilesPage level="system" /></ProtectedRoute>} />
        <Route path="/files/:project/:system" element={<ProtectedRoute><ClientFolderPage /></ProtectedRoute>} />
        <Route path="/visualizer" element={<ProtectedRoute><DataVisualizer /></ProtectedRoute>} />
        <Route path="/visualizer/:fileId" element={<ProtectedRoute><DataVisualizer /></ProtectedRoute>} />
        <Route path="/railprofile" element={<ProtectedRoute><RailProfilePage /></ProtectedRoute>} />
        <Route path="/tgm" element={<ProtectedRoute><TGMVisualizer /></ProtectedRoute>} />
        <Route path="/tgm/configuration" element={<ProtectedRoute><TGMConfiguration /></ProtectedRoute>} />
        <Route path="/general-configuration" element={<ProtectedRoute roles={["superadmin", "admin"]}><GeneralConfigurationPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
        <Route path="/taipei" element={<ProtectedRoute><TaipeiScaffoldPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
