import StatusPage from './StatusPage.jsx';

export default function Unauthorized() {
  return (
    <StatusPage
      icon="bi-lock-fill"
      code="401"
      title="Authentication Required"
      message="You need to be logged in to view this page."
      actionLabel="Log In"
      actionTo="/login"
    />
  );
}
