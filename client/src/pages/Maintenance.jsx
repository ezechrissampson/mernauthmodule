import StatusPage from './StatusPage.jsx';

export default function Maintenance() {
  return (
    <StatusPage
      icon="bi-tools"
      title="Scheduled Maintenance"
      message="We're performing some quick maintenance. We'll be back online shortly — thanks for your patience."
      actionLabel="Refresh"
      actionTo="/"
    />
  );
}
