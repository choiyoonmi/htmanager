import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classApi, academy, textbook, textbookOrder, learningHistory } from '../services/api';
import '../styles/TextbookOrderForm.css';

export default function TextbookOrderForm() {
  const [academyId, setAcademyId] = useState('');
  const [mode, setMode] = useState('class');
  const [classes, setClasses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [subject, setSubject] = useState('');
  const [textbooks, setTextbooks] = useState([]);
  const [completionMap, setCompletionMap] = useState({});
  const [checkedTextbookIds, setCheckedTextbookIds] = useState([]);
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
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
      setAllStudents(response.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const getTargetStudentIds = () => {
    if (mode === 'class') {
      const cls = classes.find(c => c._id === selectedClassId);
      return cls ? cls.students.map(s => s._id) : [];
    }
    return selectedStudentIds;
  };

  useEffect(() => {
    const targetIds = getTargetStudentIds();
    if (!subject || targetIds.length === 0) {
      setTextbooks([]);
      setCompletionMap({});
      setCheckedTextbookIds([]);
      return;
    }
    loadTextbooksAndCompletion(targetIds);
  }, [subject, selectedClassId, selectedStudentIds, classes]);

  const loadTextbooksAndCompletion = async (targetIds) => {
    try {
      const tbResponse = await textbook.getByAcademy(academyId, subject);
      const tbList = tbResponse.data || [];
      setTextbooks(tbList);

      const tbIds = tbList.map(tb => tb._id);
      if (tbIds.length === 0) {
        setCompletionMap({});
        return;
      }
      const checkResponse = await learningHistory.check(targetIds, tbIds);
      const map = {};
      checkResponse.data.forEach(({ studentId, textbookId }) => {
        if (!map[textbookId]) map[textbookId] = new Set();
        map[textbookId].add(studentId);
      });
      setCompletionMap(map);
      setCheckedTextbookIds([]);
    } catch (err) {
      console.error('Failed to load textbooks/completion:', err);
    }
  };

  const handleTextbookToggle = (textbookId) => {
    setCheckedTextbookIds(prev =>
      prev.includes(textbookId)
        ? prev.filter(id => id !== textbookId)
        : [...prev, textbookId]
    );
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const targetIds = getTargetStudentIds();
    if (targetIds.length === 0) {
      setError(mode === 'class' ? '반을 선택해주세요' : '학생을 1명 이상 선택해주세요');
      return;
    }
    if (checkedTextbookIds.length === 0) {
      setError('교재를 1권 이상 선택해주세요');
      return;
    }

    try {
      const payload = {
        academy: academyId,
        textbookIds: checkedTextbookIds,
        memo
      };
      if (mode === 'class') {
        payload.classId = selectedClassId;
      } else {
        payload.studentIds = selectedStudentIds;
      }

      const response = await textbookOrder.create(payload);
      setResult(response.data);
      setCheckedTextbookIds([]);
      loadTextbooksAndCompletion(targetIds);
    } catch (err) {
      setError('신청서 제출에 실패했습니다');
      console.error('Failed to create order:', err);
    }
  };

  if (loading) {
    return <div className="order-form-container">로딩 중...</div>;
  }

  const targetIds = getTargetStudentIds();

  return (
    <div className="order-form-container">
      <div className="order-card">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← 돌아가기</button>
        <h1>📖 교재주문 신청서</h1>

        <div className="mode-toggle">
          <button
            type="button"
            className={mode === 'class' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => { setMode('class'); setResult(null); }}
          >
            반별 신청
          </button>
          <button
            type="button"
            className={mode === 'individual' ? 'mode-btn active' : 'mode-btn'}
            onClick={() => { setMode('individual'); setResult(null); }}
          >
            개별 신청
          </button>
        </div>

        <form onSubmit={handleSubmit} className="order-form">
          {mode === 'class' ? (
            <div className="form-group">
              <label htmlFor="classSelect">반 선택 *</label>
              <select
                id="classSelect"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">반 선택...</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.subject}, {cls.students?.length || 0}명)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>대상 학생 * ({selectedStudentIds.length}명 선택)</label>
              <div className="student-list">
                {allStudents.length > 0 ? (
                  allStudents.map(student => (
                    <div key={student._id} className="student-checkbox">
                      <input
                        type="checkbox"
                        id={`order-student-${student._id}`}
                        checked={selectedStudentIds.includes(student._id)}
                        onChange={() => handleStudentToggle(student._id)}
                      />
                      <label htmlFor={`order-student-${student._id}`}>{student.name}</label>
                    </div>
                  ))
                ) : (
                  <p className="no-students">등록된 학생이 없습니다</p>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="subject">과목 *</label>
            <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">과목 선택...</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>교재 선택 ({checkedTextbookIds.length}권 선택)</label>
            <div className="textbook-list">
              {targetIds.length === 0 || !subject ? (
                <p className="hint-text">먼저 대상과 과목을 선택해주세요</p>
              ) : textbooks.length === 0 ? (
                <p className="hint-text">해당 과목에 등록된 교재가 없습니다</p>
              ) : (
                textbooks.map(tb => {
                  const completedStudents = completionMap[tb._id] || new Set();
                  const completedCount = targetIds.filter(id => completedStudents.has(id)).length;
                  const isFullyCompleted = completedCount === targetIds.length && targetIds.length > 0;

                  return (
                    <div key={tb._id} className={isFullyCompleted ? 'textbook-row completed' : 'textbook-row'}>
                      <input
                        type="checkbox"
                        id={`tb-${tb._id}`}
                        checked={isFullyCompleted || checkedTextbookIds.includes(tb._id)}
                        disabled={isFullyCompleted}
                        onChange={() => handleTextbookToggle(tb._id)}
                      />
                      <label htmlFor={`tb-${tb._id}`}>
                        <span className="tb-series">{tb.seriesName}</span> {tb.name}
                      </label>
                      {isFullyCompleted && <span className="badge badge-done">학습완료</span>}
                      {!isFullyCompleted && completedCount > 0 && (
                        <span className="badge badge-partial">{completedCount}/{targetIds.length}명 완료</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="memo">메모</label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows="3"
              placeholder="선택 입력"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {result && (
            <div className="result-message">
              <p>✅ {result.createdCount}건 신청 완료</p>
              {result.skipped.length > 0 && (
                <ul className="skipped-list">
                  {result.skipped.map((s, idx) => (
                    <li key={idx}>{s.studentName} - {s.textbookName} (이미 학습완료라 제외됨)</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button type="submit" className="submit-btn">신청서 제출</button>
        </form>
      </div>
    </div>
  );
}
