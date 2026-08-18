import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { admin, academy } from '../services/api';
import '../styles/StudentRegistration.css';

export default function StudentRegistration() {
  const [academyId, setAcademyId] = useState('');
  const [formData, setFormData] = useState({ name: '', grade: '', accessCode: '' });
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', grade: '', accessCode: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const grades = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년', '중1', '중2', '중3', '고1', '고2', '고3'];
  const studentId = (student) => student.id || student._id;

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }
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
      setError('학생 명단을 불러오지 못했습니다');
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
    if (students.some(s => s.accessCode === formData.accessCode)) {
      setError('이미 사용 중인 접속번호입니다');
      return;
    }

    try {
      const response = await admin.createStudents(academyId, [{
        name: formData.name,
        grade: formData.grade,
        accessCode: formData.accessCode
      }]);

      if (response.data.success && response.data.students.length > 0) {
        const newStudent = response.data.students[0];
        setStudents(prev => [...prev, {
          id: newStudent.id,
          name: newStudent.name,
          grade: newStudent.grade || formData.grade,
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

  const startEditing = (student) => {
    setEditingId(studentId(student));
    setEditData({
      name: student.name || '',
      grade: student.grade || '',
      accessCode: student.accessCode || ''
    });
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({ name: '', grade: '', accessCode: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const saveStudent = async (id) => {
    if (!editData.name.trim() || !editData.grade || !editData.accessCode.trim()) {
      setError('이름, 학년, 접속번호를 모두 입력해주세요');
      return;
    }
    if (students.some(s => studentId(s) !== id && s.accessCode === editData.accessCode.trim())) {
      setError('이미 사용 중인 접속번호입니다');
      return;
    }

    setSaving(true);
    try {
      const response = await admin.updateStudent(academyId, id, {
        name: editData.name.trim(),
        grade: editData.grade,
        accessCode: editData.accessCode.trim()
      });
      setStudents(prev => prev.map(student =>
        studentId(student) === id ? { ...student, ...response.data } : student
      ));
      setEditingId(null);
      setSuccess(`${response.data.name} 학생 정보가 수정되었습니다`);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update student:', err);
      setError(err.response?.data?.error || '학생 정보 수정에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = (id) => {
    setStudents(students.filter(s => studentId(s) !== id));
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
            <input id="name" type="text" name="name" placeholder="학생 이름을 입력하세요"
              value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="grade">학년 *</label>
            <select id="grade" name="grade" value={formData.grade} onChange={handleChange} required>
              <option value="">학년 선택...</option>
              {grades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="accessCode">접속번호 *</label>
            <input id="accessCode" type="text" name="accessCode" placeholder="예: 2024001"
              value={formData.accessCode} onChange={handleChange} required />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button type="submit" className="add-btn">추가</button>
        </form>

        <div className="students-section">
          <h2>등록된 학생 ({students.length}명)</h2>
          <p className="edit-help">수정 버튼을 누르면 이름·학년·접속번호를 변경할 수 있습니다.</p>
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr><th>#</th><th>이름</th><th>학년</th><th>접속번호</th><th>액션</th></tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan="5" className="empty">등록된 학생이 없습니다</td></tr>
                ) : students.map((student, idx) => {
                  const id = studentId(student);
                  const isEditing = editingId === id;
                  return (
                    <tr key={id}>
                      <td>{idx + 1}</td>
                      <td>{isEditing
                        ? <input className="table-input" name="name" value={editData.name} onChange={handleEditChange} aria-label="학생 이름" />
                        : student.name}</td>
                      <td>{isEditing
                        ? <select className="table-input" name="grade" value={editData.grade} onChange={handleEditChange} aria-label="학년">
                            <option value="">학년 선택...</option>
                            {grades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                          </select>
                        : (student.grade || '-')}</td>
                      <td>{isEditing
                        ? <input className="table-input access-code-input" name="accessCode" value={editData.accessCode} onChange={handleEditChange} aria-label="접속번호" />
                        : <strong>{student.accessCode}</strong>}</td>
                      <td>
                        <div className="row-actions">
                          {isEditing ? (
                            <>
                              <button className="save-btn" type="button" disabled={saving} onClick={() => saveStudent(id)}>
                                {saving ? '저장 중' : '저장'}
                              </button>
                              <button className="cancel-btn" type="button" disabled={saving} onClick={cancelEditing}>취소</button>
                            </>
                          ) : (
                            <>
                              <button className="edit-btn" type="button" onClick={() => startEditing(student)}>수정</button>
                              <button className="delete-btn" type="button" onClick={() => handleDeleteStudent(id)}>삭제</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
