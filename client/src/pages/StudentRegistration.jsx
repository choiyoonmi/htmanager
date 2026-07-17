import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { admin, academy } from '../services/api';
import '../styles/StudentRegistration.css';

export default function StudentRegistration() {
  const [academyId, setAcademyId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    accessCode: ''
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const grades = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년', '중1', '중2', '중3', '고1', '고2', '고3'];

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }
    // 선생님의 첫 번째 학원 ID 사용
    if (user?.academies && user.academies.length > 0) {
      const firstAcademyId = user.academies[0];
      setAcademyId(firstAcademyId);
      loadExistingStudents(firstAcademyId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadExistingStudents = async (acaId) => {
    try {
      const response = await academy.getStudents(acaId);
      setStudents(response.data || []);
    } catch (err) {
      console.error('Failed to load existing students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.grade || !formData.accessCode) {
      setError('모든 항목을 입력해주세요');
      return;
    }

    if (!academyId) {
      setError('학원 정보를 불러올 수 없습니다. 다시 시도해주세요.');
      return;
    }

    // Check for duplicate access code in current list
    if (students.some(s => s.accessCode === formData.accessCode)) {
      setError('이미 사용 중인 접속번호입니다');
      return;
    }

    try {
      // Send to API
      const response = await admin.createStudents(academyId, [
        {
          name: formData.name,
          accessCode: formData.accessCode
        }
      ]);

      if (response.data.success && response.data.students.length > 0) {
        const newStudent = response.data.students[0];
        setStudents([...students, {
          id: newStudent.id,
          name: newStudent.name,
          grade: formData.grade,
          accessCode: newStudent.accessCode,
          enrolledAt: new Date().toISOString()
        }]);
        setSuccess(`${formData.name} 학생이 추가되었습니다`);
        setFormData({ name: '', grade: '', accessCode: '' });
        setError('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to add student:', err);
      setError(err.response?.data?.error || '학생 추가에 실패했습니다');
    }
  };

  const handleDeleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  if (loading) {
    return <div className="student-registration-container">로딩 중...</div>;
  }

  return (
    <div className="student-registration-container">
      <div className="registration-card">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← 돌아가기</button>

        <h1>👥 학생 등록</h1>

        <form onSubmit={handleAddStudent} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">학생 이름 *</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="학생 이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="grade">학년 *</label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
            >
              <option value="">학년 선택...</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="accessCode">접속번호 *</label>
            <input
              id="accessCode"
              type="text"
              name="accessCode"
              placeholder="예: 2024001"
              value={formData.accessCode}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="add-btn">추가</button>
        </form>

        <div className="students-section">
          <h2>등록된 학생 ({students.length}명)</h2>
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>이름</th>
                  <th>학년</th>
                  <th>접속번호</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">등록된 학생이 없습니다</td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={student.id}>
                      <td>{idx + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.grade}</td>
                      <td><strong>{student.accessCode}</strong></td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
