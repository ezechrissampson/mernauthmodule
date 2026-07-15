import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import RequirePermission from '../../components/common/RequirePermission.jsx';
import ModerationTab from '../../components/dashboard/ModerationTab.jsx';

export default function ModerationPage() {
  return (
    <RequirePermission perm="content.moderate">
      <DashboardLayout>
        <ModerationTab />
      </DashboardLayout>
    </RequirePermission>
  );
}
