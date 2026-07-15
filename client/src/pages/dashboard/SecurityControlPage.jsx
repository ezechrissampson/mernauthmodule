import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import RequirePermission from '../../components/common/RequirePermission.jsx';
import SecurityControlTab from '../../components/dashboard/SecurityControlTab.jsx';

export default function SecurityControlPage() {
  return (
    <RequirePermission perm="security.manage">
      <DashboardLayout>
        <SecurityControlTab />
      </DashboardLayout>
    </RequirePermission>
  );
}
