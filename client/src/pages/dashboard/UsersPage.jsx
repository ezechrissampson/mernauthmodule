import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import RequirePermission from '../../components/common/RequirePermission.jsx';
import UsersTab from '../../components/dashboard/UsersTab.jsx';

export default function UsersPage() {
  return (
    <RequirePermission perm="users.manage">
      <DashboardLayout>
        <UsersTab />
      </DashboardLayout>
    </RequirePermission>
  );
}
