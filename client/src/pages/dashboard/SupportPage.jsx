import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import RequirePermission from '../../components/common/RequirePermission.jsx';
import SupportTab from '../../components/dashboard/SupportTab.jsx';

export default function SupportPage() {
  return (
    <RequirePermission perm="support.manage">
      <DashboardLayout>
        <SupportTab />
      </DashboardLayout>
    </RequirePermission>
  );
}
