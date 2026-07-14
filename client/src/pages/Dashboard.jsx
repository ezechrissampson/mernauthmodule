import { useMemo, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import { useAuth } from '../hooks/useAuth.js';

import ProfileTab from '../components/dashboard/ProfileTab.jsx';
import TraderApplyTab from '../components/dashboard/TraderApplyTab.jsx';
import ContentTab from '../components/dashboard/ContentTab.jsx';
import ModerationTab from '../components/dashboard/ModerationTab.jsx';
import ApprovalsTab from '../components/dashboard/ApprovalsTab.jsx';
import SupportTab from '../components/dashboard/SupportTab.jsx';
import AnalyticsTab from '../components/dashboard/AnalyticsTab.jsx';
import BillingTab from '../components/dashboard/BillingTab.jsx';
import SecurityControlTab from '../components/dashboard/SecurityControlTab.jsx';
import UsersTab from '../components/dashboard/UsersTab.jsx';

/**
 * ONE dashboard route for every role. The tab set rendered is entirely driven by the
 * signed-in user's permissions — this is what makes "assigning a role changes the
 * dashboard" true without maintaining N separate dashboard pages. Every tab's data request
 * is independently re-authorized server-side regardless of what's shown here.
 */
export default function Dashboard() {
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = useMemo(() => {
    if (!user) return [];
    const list = [{ key: 'profile', label: 'Profile', icon: 'bi-person', component: ProfileTab }];

    if (user.role === 'user') {
      list.push({ key: 'trader', label: 'Verified Trader', icon: 'bi-patch-check', component: TraderApplyTab });
    }
    if (can('content.create')) {
      list.push({ key: 'content', label: 'My Content', icon: 'bi-pencil-square', component: ContentTab });
    }
    if (can('content.moderate')) {
      list.push({ key: 'moderation', label: 'Moderation', icon: 'bi-flag', component: ModerationTab });
    }
    if (can('approvals.manage')) {
      list.push({ key: 'approvals', label: 'Approvals', icon: 'bi-check2-square', component: ApprovalsTab });
    }
    if (can('support.manage')) {
      list.push({ key: 'support', label: 'Support Tickets', icon: 'bi-headset', component: SupportTab });
    }
    if (can('analytics.view')) {
      list.push({ key: 'analytics', label: 'Analytics', icon: 'bi-bar-chart', component: AnalyticsTab });
    }
    if (can('billing.manage')) {
      list.push({ key: 'billing', label: 'Billing', icon: 'bi-cash-coin', component: BillingTab });
    }
    if (can('users.manage')) {
      list.push({ key: 'users', label: 'Users', icon: 'bi-people', component: UsersTab });
    }
    if (can('security.manage')) {
      list.push({ key: 'security', label: 'Security Control', icon: 'bi-shield-fill-check', component: SecurityControlTab });
    }
    return list;
  }, [user, can]);

  if (!user) return null;

  const ActiveComponent = tabs.find((t) => t.key === activeTab)?.component || tabs[0]?.component || ProfileTab;

  return (
    <DashboardLayout>
      <ul className="nav nav-pills mb-4 flex-wrap gap-1">
        {tabs.map((tab) => (
          <li className="nav-item" key={tab.key}>
            <button className={`nav-link d-flex align-items-center gap-1 ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
              <i className={`bi ${tab.icon}`} />
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <ActiveComponent />
    </DashboardLayout>
  );
}
