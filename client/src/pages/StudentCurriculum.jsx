import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { academy, learningHistory } from '../services/api';
import '../styles/StudentCurriculum.css';

export default function StudentCurriculum() {
  const { studentId: paramStudentId } = useParams();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(paramStudentId || '');
  const [curriculum, setCurriculum] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'student') {
      setSelectedStudentId(user._id);
      loadCurriculum(user._id);
    } else if (user?.academies && user.academies.length > 0) {
      loadStudents(user.academies[0]);
      if (paramStudentId) {
        loadCurriculum(paramStudentId);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadStudents = async (acaId) => {
    try {
      const response = await academy.getStudents(acaId);
      setStudents(response.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const loadCurriculum = async (studentId) => {
    setLoading(true);
    try {
      const response = await learningHistory.getByStudent(studentId);
      setCurriculum(response.data || {});
    } catch (err) {
      console.error('Failed to load curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (e) => {
    const id = e.target.value;
    setSelectedStudentId(id);
    if (id) {
      loadCurriculum(id);
    } else {
      setCurriculum({});
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const subjects = Object.keys(curriculum);

  return (
    <div className="curriculum-container">
      <div className="curriculum-card">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← 돌아가기</button>
        <h1>🧭 학습 커리큘럼</h1>

        {user?.role !== 'student' && (
          <div className="student-select-group">
            <label htmlFor="studentSelect">학생 선택</label>
            <select id="studentSelect" value={selectedStudentId} onChange={handleStudentSelect}>
              <option value="">학생 선택...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <p className="loading">로딩 중...</p>
        ) : !selectedStudentId ? (
          <p className="hint-text">학생을 선택해주세요</p>
        ) : subjects.length === 0 ? (
          <p className="hint-text">학습이력이 없습니다</p>
        ) : (
          <div className="curriculum-tracks">
            {subjects.map(subject => (
              <div key={subject} className="curriculum-track">
                <h2 className="track-title">📚 {subject}</h2>
                <div className="track-steps">
                  {curriculum[subject].map((item, idx) => (
                    <div key={item.textbookId} className="track-step">
                      <div className="step-marker">
                        <div className="step-dot" />
                        {idx < curriculum[subject].length - 1 && <div className="step-line" />}
                      </div>
                      <div className="step-content">
                        <div className="step-series">{item.seriesName}</div>
                        <div className="step-name">{item.name}</div>
                        <div className="step-date">완료일: {formatDate(item.completedAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
