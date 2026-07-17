import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AcademyManagement.css';

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

export default function AcademyManagement() {
  const [academies, setAcademies] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    accessCode: ''
  });
  const [bulkStudents, setBulkStudents] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const subjects = ['국어', '영어', '수학'];

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }
    loadAcademies();
  }, []);

  const loadAcademies = async () => {
    try {
      setLoading(true);
      const response = await API.get('/enrollment/my-academies');
      setAcademies(response.data);
      if (response.data.length > 0) {
        setSelectedAcademy(response.data[0]._id);
        loadStudents(response.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load academies:', err);
      setError('학원 정보를 불러올 수 없습니다');
      setLoading(false);
    }
  };

  const loadStudents = async (academyId) => {
    try {
      const response = await API.get(`/admin/academy/${academyId}/students`);
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.accessCode) {
      setError('모든 항목을 입력해주세요');
      return;
    }

    try {
      setError('');
      const response = await API.post('/admin/create-students', {
        academyId: selectedAcademy,
        students: [formData]
      });

      if (response.data.success) {
        setSuccess(`${formData.name} 학생 계정이 생성되었습니다`);
        setFormData({ name: '', accessCode: '' });
        setShowAddForm(false);
        loadStudents(selectedAcademy);

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || '학생 추가 실패');
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkStudents.trim()) {
      setError('학생 정보를 입력해주세요');
      return;
    }

    try {
      setError('');
      const lines = bulkStudents.trim().split('\n');
      const studentsList = lines.map(line => {
        const [name, accessCode] = line.split(',').map(s => s.trim());
        return { name, accessCode };
      });

      const response = await API.post('/admin/create-students', {
        academyId: selectedAcademy,
        students: studentsList
      });

      if (response.data.success) {
        setSuccess(`${response.data.created}명의 학생 계정이 생성되었습니다`);
        setBulkStudents('');
        loadStudents(selectedAcademy);

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || '일괄 추가 실패');
    }
  };

  if (loading) {
    return <div className="management-container">로딩 중...</div>;
  }

  return (
    <div className="management-container">
      <header className="management-header">
        <h1>과목선택</h1>
        <button onClick={() => navigate('/dashboard')}>대시보드로</button>
      </header>

      <main className="management-content">
        <section className="academy-section">
          <h2>학원 선택</h2>
          <select
            value={selectedAcademy || ''}
            onChange={(e) => {
              setSelectedAcademy(e.target.value);
              loadStudents(e.target.value);
            }}
          >
            {academies.map(academy => (
              <option key={academy._id} value={academy._id}>
                {academy.name}
              </option>
            ))}
          </select>
        </section>

        <section className="academy-section">
          <h2>과목 선택</h2>
          <div className="subject-buttons">
            {subjects.map(subject => (
              <button
                key={subject}
                className={`subject-btn ${selectedSubject === subject ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
          {selectedSubject && (
            <p className="selected-subject">
              선택된 과목: <strong>{selectedSubject}</strong>
            </p>
          )}
        </section>

        {selectedAcademy && (
          <>
            <section className="add-students-section">
              <h2>학생 계정 추가</h2>

              <div className="add-methods">
                <button
                  className={`method-btn ${!showAddForm ? 'active' : ''}`}
                  onClick={() => setShowAddForm(false)}
                >
                  일괄 추가
                </button>
                <button
                  className={`method-btn ${showAddForm ? 'active' : ''}`}
                  onClick={() => setShowAddForm(true)}
                >
                  개별 추가
                </button>
              </div>

              {!showAddForm ? (
                <div className="bulk-add">
                  <p className="info">형식: 이름,접속번호 (한 줄에 한 명)</p>
                  <textarea
                    value={bulkStudents}
                    onChange={(e) => setBulkStudents(e.target.value)}
                    placeholder="김철수,2024001&#10;이영희,2024002"
                    rows="6"
                  />
                  <button onClick={handleBulkAdd} className="add-btn">
                    일괄 추가
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddStudent} className="single-add">
                  <input
                    type="text"
                    placeholder="학생명"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="접속번호"
                    value={formData.accessCode}
                    onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                  />
                  <button type="submit" className="add-btn">
                    추가
                  </button>
                </form>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
            </section>

            <section className="students-list-section">
              <h2>등록된 학생 ({students.length}명)</h2>
              <div className="students-table-wrapper">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>이름</th>
                      <th>접속번호</th>
                      <th>등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty">
                          등록된 학생이 없습니다
                        </td>
                      </tr>
                    ) : (
                      students.map((student, idx) => (
                        <tr key={student.id}>
                          <td>{idx + 1}</td>
                          <td>{student.name}</td>
                          <td><strong>{student.accessCode}</strong></td>
                          <td>{new Date(student.enrolledAt).toLocaleDateString('ko-KR')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="guide-section">
              <h3>📋 학생에게 전달할 로그인 정보</h3>
              <div className="guide-box">
                <p><strong>로그인 주소:</strong> {window.location.origin}</p>
                <p><strong>접속번호:</strong> 위 표에 표시된 번호</p>
                <p style={{ color: '#e74c3c' }}>
                  ⚠️ 학생들은 할당받은 접속번호로만 로그인하세요
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
