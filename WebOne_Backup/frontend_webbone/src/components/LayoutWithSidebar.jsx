



import React from 'react';
import Sidebar from './Sidebar.jsx';
import { Outlet, useLocation } from 'react-router-dom';
import PageTransition from './PageTransition.jsx';

const LayoutWithSidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 shadow-md flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
      {/* Main content */}
      <main className={`flex-1 min-w-0 p-6 md:p-10 bg-slate-50 transition-all duration-200`}>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
};

export default LayoutWithSidebar;
