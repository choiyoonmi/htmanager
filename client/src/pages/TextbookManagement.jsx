import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { textbook } from '../services/api';
import '../styles/TextbookManagement.css';

export default function TextbookManagement() {
  const [academyId, setAcademyId] = useState('');
  const [textbooks, setTextbooks] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    seriesName: '',
    name: '',
    order: ''
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
      loadTextbooks(firstAcademyId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadTextbooks = async (acaId) => {
    try {
      const response = await textbook.getByAcademy(acaId);
      setTextbooks(response.data || []);
    } catch (err) {
      console.error('Failed to load textbooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.seriesName || !formData.name || formData.order === '') {
      setError('모든 항목을 입력해주세요');
      return;
    }
    try {
      await textbook.create({
        academy: academyId,
        subject: formData.subject,
        seriesName: formData.seriesName,
        name: formData.name,
        order: Number(formData.order)
      });
      setFormData({ subject: '', seriesName: '', name: '', order: '' });
      setError('');
      loadTextbooks(academyId);
    } catch (err) {
      setError('교재 등록에 실패했습니다');
      console.error('Failed to create textbook:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 교재를 삭제하시겠습니까?')) return;
    try {
      await textbook.delete(id);
      loadTextbooks(academyId);
    } catch (err) {
      console.error('Failed to delete textbook:', err);
    }
  };

  if (loading) {
    return <div className="textbook-management-container">로딩 중...</div>;
  }

  return (
    <div className="textbook-management-container">
      <div className="textbook-card">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← 돌아가기</button>
        <h1>📖 교재 마스터 관리</h1>

        <form onSubmit={handleAdd} className="textbook-form">
          <div className="form-row">
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
              <label htmlFor="seriesName">시리즈명 *</label>
              <input
                id="seriesName"
                type="text"
                name="seriesName"
                placeholder="예: 리딩게이트"
                value={formData.seriesName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group name-field">
              <label htmlFor="name">교재명 *</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="예: 리딩게이트 Level 3"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group order-field">
              <label htmlFor="order">순서 *</label>
              <input
                id="order"
                type="number"
                name="order"
                placeholder="1"
                value={formData.order}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="add-btn">교재 등록</button>
        </form>

        <div className="textbooks-section">
          <h2>등록된 교재 ({textbooks.length}권)</h2>
          <div className="textbooks-table-wrapper">
            <table className="textbooks-table">
              <thead>
                <tr>
                  <th>과목</th>
                  <th>시리즈</th>
                  <th>교재명</th>
                  <th>순서</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {textbooks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">등록된 교재가 없습니다</td>
                  </tr>
                ) : (
                  textbooks.map(tb => (
                    <tr key={tb._id}>
                      <td>{tb.subject}</td>
                      <td>{tb.seriesName}</td>
                      <td>{tb.name}</td>
                      <td>{tb.order}</td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDelete(tb._id)}>삭제</button>
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
