import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import { postsApi } from '../api/featureApi.js';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi
      .listPublished({ limit: 20 })
      .then(({ data }) => setPosts(data.data.posts))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container py-5" style={{ maxWidth: 720 }}>
        <h2 className="fw-bold mb-4">Latest Posts</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : !posts.length ? (
          <p className="text-secondary">No posts published yet.</p>
        ) : (
          posts.map((post) => (
            <Link key={post._id} to={`/posts/${post._id}`} className="text-decoration-none text-reset">
              <div className="auth-card p-4 mb-3">
                <h5 className="mb-1">{post.title}</h5>
                <p className="text-secondary small mb-2">
                  by {post.author?.fullName || post.author?.username} &middot; {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-0">{post.body.slice(0, 200)}{post.body.length > 200 ? '…' : ''}</p>
                <div className="text-secondary small mt-2">
                  <i className="bi bi-eye me-1" />
                  {post.viewCount} &middot; <i className="bi bi-chat me-1" />
                  {post.commentCount}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
