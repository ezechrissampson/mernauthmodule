import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import RequirePermission from '../../components/common/RequirePermission.jsx';
import AnalyticsTab from '../../components/dashboard/AnalyticsTab.jsx';

export default function AnalyticsPage() {
  return (
    <RequirePermission perm="analytics.view">
      <DashboardLayout>
        <AnalyticsTab />
      </DashboardLayout>
    </RequirePermission>
  );
}
