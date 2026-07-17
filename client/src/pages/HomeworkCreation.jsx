import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { homework, academy } from '../services/api';
import '../styles/HomeworkCreation.css';

export default function HomeworkCreation() {
  const [formData, setFormData] = useState({
    content: '',
    dueDate: '',
    selectedStudents: [],
    subject: ''
  });
  const [academyId, setAcademyId] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const subjects = ['국어', '영어', '수학'];

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }

    // 헤더에서 선택한 과목이 있으면 설정
    if (location.state?.subject) {
      setFormData(prev => ({ ...prev, subject: location.state.subject }));
    }

    // 선생님의 첫 번째 학원 ID 직접 사용
    if (user?.academies && user.academies.length > 0) {
      const firstAcademyId = user.academies[0];
      setAcademyId(firstAcademyId);
      loadStudents(firstAcademyId);
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
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content || !formData.subject || !formData.dueDate) {
      setError('필수 항목을 모두 입력해주세요');
      return;
    }

    if (formData.selectedStudents.length === 0) {
      setError('최소 1명 이상의 학생을 선택해주세요');
      return;
    }

    try {
      await homework.create({
        title: formData.subject,
        description: formData.content,
        subject: formData.subject,
        academy: academyId,
        dueDate: formData.dueDate,
        priority: 'medium',
        assignedTo: formData.selectedStudents
      });
      navigate('/dashboard');
    } catch (err) {
      setError('숙제를 등록할 수 없습니다');
      console.error('Failed to create homework:', err);
    }
  };

  if (loading) {
    return <div className="homework-creation-container">로딩 중...</div>;
  }

  return (
    <div className="homework-creation-container">
      <div className="creation-card">
        <h1>📚 숙제 등록</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subject">과목 *</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">과목 선택...</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">과제 내용 *</label>
            <textarea
              id="content"
              name="content"
              placeholder="과제 내용을 입력하세요"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <div className="student-header">
              <label>대상 학생 * ({formData.selectedStudents.length}명 선택)</label>
              {formData.subject === '영어' && (
                <button
                  type="button"
                  className="select-all-btn"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    selectedStudents: formData.selectedStudents.length === students.length
                      ? []
                      : students.map(s => s._id)
                  }))}
                >
                  {formData.selectedStudents.length === students.length ? '전체 해제' : '전체 선택'}
                </button>
              )}
            </div>
            <div className="student-list">
              {students.length > 0 ? (
                students.map(student => (
                  <div key={student._id} className="student-checkbox">
                    <input
                      type="checkbox"
                      id={`student-${student._id}`}
                      checked={formData.selectedStudents.includes(student._id)}
                      onChange={() => handleStudentToggle(student._id)}
                    />
                    <label htmlFor={`student-${student._id}`}>{student.name}</label>
                  </div>
                ))
              ) : (
                <p className="no-students">등록된 학생이 없습니다</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">기한 *</label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button type="submit" className="submit-button">등록</button>
            <button type="button" className="cancel-button" onClick={() => navigate('/dashboard')}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
