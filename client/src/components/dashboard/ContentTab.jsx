import { useEffect, useState } from 'react';
import { postsApi } from '../../api/featureApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function ContentTab() {
  const { user, can } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState('');

  const canEditAny = can('content.editAny');

  const load = async () => {
    setLoading(true);
    try {
      // Editors see every post (they can edit anyone's); Authors see only their own.
      const { data } = canEditAny ? await postsApi.allForEditing() : await postsApi.mine();
      setPosts(data.data.posts);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load posts', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      await postsApi.create({ title, body });
      showToast('Post published', 'success');
      setTitle('');
      setBody('');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish post', 'danger');
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setEditBody(post.body);
  };

  const saveEdit = async (id) => {
    try {
      await postsApi.update(id, { body: editBody });
      showToast('Post updated', 'success');
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update post', 'danger');
    }
  };

  const canEditPost = (post) => canEditAny || String(post.author?._id || post.author) === String(user._id);

  return (
    <div>
      <div className="auth-card p-4 mb-4">
        <h5 className="mb-3">Write a Post</h5>
        <input className="form-control mb-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        <textarea
          className="form-control mb-3"
          rows={4}
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={20000}
        />
        <button className="btn btn-primary" onClick={handlePost} disabled={posting || !title.trim() || !body.trim()}>
          {posting ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-send me-1" />}
          Post
        </button>
      </div>

      <div className="auth-card p-4">
        <h5 className="mb-3">{canEditAny ? 'All Posts' : 'My Posts'}</h5>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" />
          </div>
        ) : !posts.length ? (
          <p className="text-secondary">No posts yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {posts.map((post) => (
              <li key={post._id} className="list-group-item px-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                      {post.title} <span className="badge bg-secondary-subtle text-secondary text-capitalize ms-1">{post.status}</span>
                    </div>
                    {canEditAny && <div className="text-secondary small">by {post.author?.fullName || post.author?.username}</div>}
                    {editingId === post._id ? (
                      <div className="mt-2">
                        <textarea className="form-control mb-2" rows={3} value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                        <button className="btn btn-sm btn-primary me-2" onClick={() => saveEdit(post._id)}>
                          Save
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="mb-0 mt-1 small">{post.body}</p>
                    )}
                  </div>
                  {canEditPost(post) && editingId !== post._id && (
                    <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => startEdit(post)}>
                      <i className="bi bi-pencil" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
