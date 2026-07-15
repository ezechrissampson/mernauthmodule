import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import RequirePermission from '../../components/common/RequirePermission.jsx';
import ApprovalsTab from '../../components/dashboard/ApprovalsTab.jsx';

export default function ApprovalsPage() {
  return (
    <RequirePermission perm="approvals.manage">
      <DashboardLayout>
        <ApprovalsTab />
      </DashboardLayout>
    </RequirePermission>
  );
}
