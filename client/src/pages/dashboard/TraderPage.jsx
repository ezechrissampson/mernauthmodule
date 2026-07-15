import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import TraderApplyTab from '../../components/dashboard/TraderApplyTab.jsx';
import { Navigate } from 'react-router-dom';

export default function TraderPage() {
  const { user } = useAuth();
  if (user?.role !== 'user') return <Navigate to="/dashboard" replace />;
  return (
    <DashboardLayout>
      <TraderApplyTab />
    </DashboardLayout>
  );
}
