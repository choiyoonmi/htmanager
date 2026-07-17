import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { homework, academy } from '../services/api';
import ProgressCard from '../components/ProgressCard';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [homeworks, setHomeworks] = useState([]);
  const [allHomeworks, setAllHomeworks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [filters, setFilters] = useState({
    dateFilter: 'all',
    subjectFilter: 'all',
    statusFilter: 'all'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const subjects = ['국어', '영어', '수학'];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // 선생님의 첫 번째 학원 ID 직접 사용
    if (user?.academies && user.academies.length > 0) {
      const firstAcademyId = user.academies[0];
      setSelectedAcademy(firstAcademyId);
      loadHomeworks(firstAcademyId);
      loadStudents(firstAcademyId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadHomeworks = async (academyId) => {
    if (!academyId) return;
    try {
      const response = await homework.getByAcademy(academyId);
      setAllHomeworks(response.data);
      applyFilters(response.data, filters);
    } catch (err) {
      console.error('Failed to load homeworks:', err);
    }
  };

  const loadStudents = async (academyId) => {
    try {
      const response = await academy.getStudents(academyId);
      setStudents(response.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (hwList, currentFilters) => {
    let filtered = hwList;

    if (currentFilters.dateFilter !== 'all') {
      const today = new Date();
      const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

      filtered = filtered.filter(hw => {
        const dueDate = new Date(hw.dueDate);
        if (currentFilters.dateFilter === 'week') {
          return dueDate >= today && dueDate <= oneWeekLater;
        } else if (currentFilters.dateFilter === 'month') {
          return dueDate >= today && dueDate <= oneMonthLater;
        } else if (currentFilters.dateFilter === 'urgent') {
          return dueDate >= today && dueDate <= oneWeekLater && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        }
        return true;
      });
    }

    if (currentFilters.subjectFilter !== 'all') {
      filtered = filtered.filter(hw => hw.subject === currentFilters.subjectFilter);
    }

    if (currentFilters.statusFilter !== 'all') {
      filtered = filtered.filter(hw => {
        if (currentFilters.statusFilter === 'completed') {
          return hw.submittedBy.includes(user._id);
        } else if (currentFilters.statusFilter === 'pending') {
          return !hw.submittedBy.includes(user._id) && new Date(hw.dueDate) > new Date();
        } else if (currentFilters.statusFilter === 'overdue') {
          return !hw.submittedBy.includes(user._id) && new Date(hw.dueDate) <= new Date();
        }
        return true;
      });
    }

    setHomeworks(filtered);
  };

  const handleAcademyChange = (academyId) => {
    setSelectedAcademy(academyId);
    setFilters({ dateFilter: 'all', subjectFilter: 'all', statusFilter: 'all' });
    loadHomeworks(academyId);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(allHomeworks, newFilters);
  };

  const calculateStats = () => {
    const completed = allHomeworks.filter(hw => hw.submittedBy.includes(user._id)).length;
    const pending = allHomeworks.filter(hw =>
      !hw.submittedBy.includes(user._id) && new Date(hw.dueDate) > new Date()
    ).length;
    const overdue = allHomeworks.filter(hw =>
      !hw.submittedBy.includes(user._id) && new Date(hw.dueDate) <= new Date()
    ).length;

    return { completed, pending, overdue, total: allHomeworks.length };
  };

  const stats = calculateStats();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteHomework = async (hwId, studentId) => {
    if (window.confirm('이 숙제를 삭제하시겠습니까?')) {
      try {
        // studentId가 있으면 해당 학생만 제거
        if (studentId) {
          await homework.delete(hwId + `?studentId=${studentId}`);
        } else {
          await homework.delete(hwId);
        }

        // 숙제 목록 업데이트
        const updated = allHomeworks.map(hw => {
          if (hw._id === hwId && studentId) {
            // 해당 학생을 assignedTo에서 제거
            return {
              ...hw,
              assignedTo: hw.assignedTo.filter(id => id !== studentId)
            };
          }
          return hw;
        }).filter(hw => !(hw._id === hwId && studentId && hw.assignedTo.length === 0));

        setAllHomeworks(updated);
        applyFilters(updated, filters);
      } catch (err) {
        alert('숙제 삭제에 실패했습니다');
        console.error('Failed to delete homework:', err);
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <img src="/logo.svg" alt="해피트리 로고" className="academy-logo" />
          <h1>해피트리 관리자</h1>
        </div>
        <div className="user-info">
          <span>{user?.name}</span>
          {user?.role === 'teacher' && (
            <button onClick={() => navigate('/student/registration')} className="student-register-btn">
              👥 학생등록
            </button>
          )}
          {user?.role === 'teacher' && (
            <button onClick={() => navigate('/class/management')} className="student-register-btn">
              🗂️ 반 관리
            </button>
          )}
          {user?.role === 'teacher' && (
            <button onClick={() => navigate('/textbook/management')} className="student-register-btn">
              📚 교재 관리
            </button>
          )}
          {user?.role === 'teacher' && (
            <button onClick={() => navigate('/textbook-order/new')} className="student-register-btn">
              📖 교재주문
            </button>
          )}
          <button onClick={() => navigate('/curriculum')} className="stats-btn">
            🧭 학습커리큘럼
          </button>
          <button onClick={() => navigate('/statistics')} className="stats-btn">
            📊 통계
          </button>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <main className="dashboard-content">
        {selectedAcademy && (
          <>
            {loading ? (
              <p className="loading">로딩 중...</p>
            ) : students.length === 0 ? (
              <p className="empty-state">등록된 학생이 없습니다</p>
            ) : (
              <div className="students-grid">
                {students.map(student => {
                  const studentHomeworks = allHomeworks.filter(hw =>
                    hw.assignedTo && hw.assignedTo.includes(student._id)
                  );
                  const homeworksBySubject = {
                    국어: studentHomeworks.filter(hw => hw.subject === '국어'),
                    영어: studentHomeworks.filter(hw => hw.subject === '영어'),
                    수학: studentHomeworks.filter(hw => hw.subject === '수학')
                  };

                  return (
                    <div key={student._id} className="student-card">
                      <h3 className="student-card-name">👤 {student.name}</h3>
                      <div className="subject-homeworks">
                        {['국어', '영어', '수학'].map(subject => (
                          <div key={subject} className="subject-item">
                            <span className="subject-label">📚 {subject}:</span>
                            <div className="homework-content">
                              {homeworksBySubject[subject].length > 0 ? (
                                <div className="homework-list-inline">
                                  {homeworksBySubject[subject].map(hw => (
                                    <div key={hw._id} className="homework-item">
                                      <span>{hw.description}</span>
                                      {user?.role === 'teacher' && (
                                        <button
                                          className="delete-hw-btn"
                                          onClick={() => handleDeleteHomework(hw._id, student._id)}
                                          title="삭제"
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span>없음</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {user?.role === 'teacher' && (
          <button
            className="add-button"
            onClick={() => navigate('/homework/new')}
          >
            + 숙제 추가
          </button>
        )}
      </main>
    </div>
  );
}
