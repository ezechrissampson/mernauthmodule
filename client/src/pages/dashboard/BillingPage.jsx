import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import RequirePermission from '../../components/common/RequirePermission.jsx';
import BillingTab from '../../components/dashboard/BillingTab.jsx';

export default function BillingPage() {
  return (
    <RequirePermission perm="billing.manage">
      <DashboardLayout>
        <BillingTab />
      </DashboardLayout>
    </RequirePermission>
  );
}
