import StatusPage from './StatusPage.jsx';

export default function NotFound() {
  return (
    <StatusPage
      icon="bi-signpost-split"
      code="404"
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
    />
  );
}
