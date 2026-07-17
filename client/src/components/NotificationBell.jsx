import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/NotificationBell.css';

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

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await API.get('/notifications');
      setNotifications(response.data);
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notification/${id}/read`);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notification/${id}`);
      loadNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'due_soon': return '⏰';
      case 'overdue': return '❌';
      case 'new_homework': return '📝';
      case 'new_comment': return '💬';
      case 'submitted': return '✅';
      default: return '📢';
    }
  };

  return (
    <div className="notification-bell">
      <button
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>알림</h3>
            <button className="close-btn" onClick={() => setShowDropdown(false)}>×</button>
          </div>

          <div className="notification-list">
            {loading ? (
              <p className="empty">로딩 중...</p>
            ) : notifications.length === 0 ? (
              <p className="empty">알림이 없습니다</p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                >
                  <span className="icon">{getTypeIcon(notif.type)}</span>
                  <div className="content">
                    <p>{notif.message}</p>
                    <small>{new Date(notif.createdAt).toLocaleString('ko-KR')}</small>
                  </div>
                  <div className="actions">
                    {!notif.read && (
                      <button onClick={() => handleMarkAsRead(notif._id)} title="읽음">
                        ✓
                      </button>
                    )}
                    <button onClick={() => handleDelete(notif._id)} title="삭제">
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
