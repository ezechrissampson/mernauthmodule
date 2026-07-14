import { useState } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import { supportApi } from '../api/featureApi.js';
import { useAuth } from '../hooks/useAuth.js';

export default function ContactSupportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.fullName || '', email: user?.email || '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await supportApi.submit(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-5" style={{ maxWidth: 560 }}>
        <h2 className="fw-bold mb-1">Contact Support</h2>
        <p className="text-secondary mb-4">Have a question or issue? Send us a message and our support team will get back to you.</p>

        {submitted ? (
          <div className="alert alert-success">
            <i className="bi bi-check-circle-fill me-1" /> Message sent. We'll get back to you soon.
          </div>
        ) : (
          <form className="auth-card p-4" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Name</label>
              <input className="form-control" value={form.name} onChange={handleChange('name')} required maxLength={100} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input type="email" className="form-control" value={form.email} onChange={handleChange('email')} required maxLength={254} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Subject</label>
              <input className="form-control" value={form.subject} onChange={handleChange('subject')} required maxLength={150} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Message</label>
              <textarea className="form-control" rows={4} value={form.message} onChange={handleChange('message')} required maxLength={3000} />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? <span className="spinner-border spinner-border-sm me-1" /> : null}
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
