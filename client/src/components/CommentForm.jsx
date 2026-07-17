import { useState } from 'react';
import axios from 'axios';
import '../styles/CommentForm.css';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function CommentForm({ homeworkId, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError('');

      await API.post(`/homework/${homeworkId}/comments`, { content });
      setContent('');

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError(err.response?.data?.error || '댓글 작성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <span className="user-badge">{user?.name}</span>
        {user?.role === 'teacher' && <span className="teacher-badge">선생님</span>}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요..."
        rows="3"
        disabled={submitting}
      />

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? '작성 중...' : '댓글 작성'}
        </button>
      </div>
    </form>
  );
}
