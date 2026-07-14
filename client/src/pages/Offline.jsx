import StatusPage from './StatusPage.jsx';

export default function Offline() {
  return (
    <StatusPage
      icon="bi-wifi-off"
      title="You're Offline"
      message="Check your internet connection and try again."
      actionLabel="Retry"
      actionTo="/"
    />
  );
}
