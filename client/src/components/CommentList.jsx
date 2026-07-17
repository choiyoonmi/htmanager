import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/CommentList.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

const API = axios.create({
  baseURL: API_BASE_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function CommentList({ homeworkId, refresh }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadComments();
  }, [refresh]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/homework/${homeworkId}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await API.delete(`/comment/${commentId}`);
      loadComments();
    } catch (err) {
      alert('댓글 삭제 실패');
    }
  };

  if (loading) {
    return <div className="comment-list">로딩 중...</div>;
  }

  return (
    <div className="comment-list">
      {comments.length === 0 ? (
        <p className="empty">댓글이 없습니다</p>
      ) : (
        comments.map(comment => (
          <div
            key={comment._id}
            className={`comment-item ${comment.isTeacherFeedback ? 'feedback' : ''}`}
          >
            <div className="comment-header">
              <strong>{comment.author.name}</strong>
              {comment.isTeacherFeedback && <span className="badge">피드백</span>}
              <small>{new Date(comment.createdAt).toLocaleString('ko-KR')}</small>
            </div>

            <p className="comment-content">{comment.content}</p>

            {comment.attachments && comment.attachments.length > 0 && (
              <div className="attachments">
                {comment.attachments.map(file => (
                  <a
                    key={file._id}
                    href={`${SERVER_URL}${file.url}`}
                    className="attachment"
                    download
                  >
                    📎 {file.originalName}
                  </a>
                ))}
              </div>
            )}

            {user._id === comment.author._id && (
              <button
                className="delete-btn"
                onClick={() => handleDelete(comment._id)}
              >
                삭제
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
