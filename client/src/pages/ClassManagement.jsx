import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classApi, academy } from '../services/api';
import '../styles/ClassManagement.css';

export default function ClassManagement() {
  const [academyId, setAcademyId] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    students: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const subjects = ['국어', '영어', '수학'];

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }
    if (user?.academies && user.academies.length > 0) {
      const firstAcademyId = user.academies[0];
      setAcademyId(firstAcademyId);
      loadClasses(firstAcademyId);
      loadStudents(firstAcademyId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadClasses = async (acaId) => {
    try {
      const response = await classApi.getByAcademy(acaId);
      setClasses(response.data || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (acaId) => {
    try {
      const response = await academy.getStudents(acaId);
      setStudents(response.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.includes(studentId)
        ? prev.students.filter(id => id !== studentId)
        : [...prev.students, studentId]
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) {
      setError('반 이름과 과목을 입력해주세요');
      return;
    }
    try {
      await classApi.create({
        academy: academyId,
        name: formData.name,
        subject: formData.subject,
        students: formData.students
      });
      setFormData({ name: '', subject: '', students: [] });
      setError('');
      loadClasses(academyId);
    } catch (err) {
      setError('반 생성에 실패했습니다');
      console.error('Failed to create class:', err);
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('이 반을 삭제하시겠습니까?')) return;
    try {
      await classApi.delete(classId);
      loadClasses(academyId);
    } catch (err) {
      console.error('Failed to delete class:', err);
    }
  };

  if (loading) {
    return <div className="class-management-container">로딩 중...</div>;
  }

  return (
    <div className="class-management-container">
      <div className="class-card">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← 돌아가기</button>
        <h1>🗂️ 반 관리</h1>

        <form onSubmit={handleCreate} className="class-form">
          <div className="form-group">
            <label htmlFor="name">반 이름 *</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="예: 중2-A반"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">과목 *</label>
            <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
              <option value="">과목 선택...</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>소속 학생 ({formData.students.length}명 선택)</label>
            <div className="student-list">
              {students.length > 0 ? (
                students.map(student => (
                  <div key={student._id} className="student-checkbox">
                    <input
                      type="checkbox"
                      id={`class-student-${student._id}`}
                      checked={formData.students.includes(student._id)}
                      onChange={() => handleStudentToggle(student._id)}
                    />
                    <label htmlFor={`class-student-${student._id}`}>{student.name}</label>
                  </div>
                ))
              ) : (
                <p className="no-students">등록된 학생이 없습니다</p>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="add-btn">반 생성</button>
        </form>

        <div className="classes-section">
          <h2>등록된 반 ({classes.length}개)</h2>
          <div className="classes-list">
            {classes.length === 0 ? (
              <p className="empty-state">등록된 반이 없습니다</p>
            ) : (
              classes.map(cls => (
                <div key={cls._id} className="class-item">
                  <div className="class-item-header">
                    <strong>{cls.name}</strong>
                    <span className="class-subject-badge">{cls.subject}</span>
                    <button className="delete-btn" onClick={() => handleDelete(cls._id)}>삭제</button>
                  </div>
                  <div className="class-item-students">
                    학생 {cls.students?.length || 0}명: {cls.students?.map(s => s.name).join(', ') || '없음'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
