import { useEffect, useState } from 'react';
import { postsApi } from '../../api/featureApi.js';
import { useToast } from '../../hooks/useToast.jsx';

const POST_ACTIONS = ['unpublish', 'archive', 'reject', 'flag', 'restore'];
const COMMENT_ACTIONS = ['flag', 'unpublish', 'archive', 'restore'];

export default function ModerationTab() {
  const { showToast } = useToast();
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'posts') {
        const { data } = await postsApi.moderationList({ limit: 100 });
        setPosts(data.data.posts);
      } else {
        const { data } = await postsApi.moderationComments({});
        setComments(data.data.comments);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handlePostAction = async (id, action) => {
    try {
      await postsApi.moderate(id, action);
      showToast(`Post ${action}ed`, 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'danger');
    }
  };

  const handlePostDelete = async (id) => {
    if (!window.confirm('Permanently delete this post?')) return;
    try {
      await postsApi.moderateDelete(id);
      showToast('Post deleted', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  const handleCommentAction = async (id, action) => {
    try {
      await postsApi.moderateComment(id, action);
      showToast(`Comment ${action}ed`, 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'danger');
    }
  };

  const handleCommentDelete = async (id) => {
    if (!window.confirm('Permanently delete this comment?')) return;
    try {
      await postsApi.moderateDeleteComment(id);
      showToast('Comment deleted', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  return (
    <div className="auth-card p-4">
      <h5 className="mb-3">Moderation</h5>
      <ul className="nav nav-pills mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
            Posts
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'comments' ? 'active' : ''}`} onClick={() => setTab('comments')}>
            Comments
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" />
        </div>
      ) : tab === 'posts' ? (
        !posts.length ? (
          <p className="text-secondary">No posts.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {posts.map((post) => (
              <li key={post._id} className="list-group-item px-0">
                <div className="fw-semibold">
                  {post.title} <span className="badge bg-secondary-subtle text-secondary text-capitalize ms-1">{post.status}</span>
                </div>
                <div className="text-secondary small mb-2">by {post.author?.fullName || post.author?.username}</div>
                <p className="small">{post.body}</p>
                <div className="d-flex gap-2 flex-wrap">
                  {POST_ACTIONS.map((action) => (
                    <button key={action} className="btn btn-sm btn-outline-secondary text-capitalize" onClick={() => handlePostAction(post._id, action)}>
                      {action}
                    </button>
                  ))}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handlePostDelete(post._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : !comments.length ? (
        <p className="text-secondary">No comments.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {comments.map((comment) => (
            <li key={comment._id} className="list-group-item px-0">
              <div className="small text-secondary mb-1">
                {comment.author?.fullName || comment.author?.username} on <em>{comment.post?.title}</em>{' '}
                <span className="badge bg-secondary-subtle text-secondary text-capitalize ms-1">{comment.status}</span>
              </div>
              <p className="mb-2">{comment.body}</p>
              <div className="d-flex gap-2 flex-wrap">
                {COMMENT_ACTIONS.map((action) => (
                  <button key={action} className="btn btn-sm btn-outline-secondary text-capitalize" onClick={() => handleCommentAction(comment._id, action)}>
                    {action}
                  </button>
                ))}
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleCommentDelete(comment._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
