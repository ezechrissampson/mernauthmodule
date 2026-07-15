import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-shell-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="app-content">
          <div className="container-fluid">{children}</div>
        </main>
      </div>
    </div>
  );
}
