import StatusPage from './StatusPage.jsx';

export default function ServerError() {
  return (
    <StatusPage
      icon="bi-exclamation-octagon"
      code="500"
      title="Something Went Wrong"
      message="An unexpected error occurred on our end. Please try again shortly."
    />
  );
}
