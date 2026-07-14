import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import { postsApi } from '../api/featureApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';

export default function PostDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([postsApi.get(id), postsApi.comments(id)]);
      setPost(postRes.data.data.post);
      setComments(commentsRes.data.data.comments);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleComment = async () => {
    if (!commentBody.trim()) return;
    setPosting(true);
    try {
      await postsApi.addComment(id, commentBody);
      setCommentBody('');
      const { data } = await postsApi.comments(id);
      setComments(data.data.comments);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'danger');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div>
        <Navbar />
        <div className="container py-5 text-center">
          <p className="text-secondary">Post not found.</p>
          <Link to="/posts">Back to posts</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container py-5" style={{ maxWidth: 720 }}>
        <div className="auth-card p-4 mb-4">
          <h2 className="fw-bold mb-1">{post.title}</h2>
          <p className="text-secondary small mb-3">
            by {post.author?.fullName || post.author?.username} &middot; {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <p style={{ whiteSpace: 'pre-wrap' }}>{post.body}</p>
        </div>

        <div className="auth-card p-4">
          <h5 className="mb-3">Comments ({comments.length})</h5>

          {isAuthenticated ? (
            <div className="mb-4">
              <textarea className="form-control mb-2" rows={2} placeholder="Add a comment..." value={commentBody} onChange={(e) => setCommentBody(e.target.value)} maxLength={2000} />
              <button className="btn btn-primary btn-sm" onClick={handleComment} disabled={posting || !commentBody.trim()}>
                {posting ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Comment
              </button>
            </div>
          ) : (
            <div className="alert alert-light border small mb-4">
              <Link to="/login">Log in</Link> to leave a comment.
            </div>
          )}

          {!comments.length ? (
            <p className="text-secondary small">No comments yet.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {comments.map((c) => (
                <li key={c._id} className="list-group-item px-0">
                  <div className="fw-semibold small">{c.author?.fullName || c.author?.username}</div>
                  <p className="mb-0 small">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
