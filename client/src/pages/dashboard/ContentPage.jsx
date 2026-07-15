import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import RequirePermission from '../../components/common/RequirePermission.jsx';
import ContentTab from '../../components/dashboard/ContentTab.jsx';

export default function ContentPage() {
  return (
    <RequirePermission perm="content.create">
      <DashboardLayout>
        <ContentTab />
      </DashboardLayout>
    </RequirePermission>
  );
}
