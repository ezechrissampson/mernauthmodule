import StatusPage from './StatusPage.jsx';

export default function Forbidden() {
  return (
    <StatusPage
      icon="bi-shield-exclamation"
      code="403"
      title="Access Forbidden"
      message="You don't have permission to access this resource."
      actionLabel="Go to Dashboard"
      actionTo="/dashboard"
    />
  );
}
