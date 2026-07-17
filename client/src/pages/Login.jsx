import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import '../styles/Auth.css';

export default function Login() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await auth.login({ accessCode });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || '로그인 실패');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>학원 숙제 관리</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="접속번호"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
          />
          <button type="submit">로그인</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="info-text">
          💡 관리자에게 접속번호를 받아주세요
        </p>
      </div>
    </div>
  );
}
