import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import '../styles/Statistics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

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

export default function Statistics() {
  const [personalStats, setPersonalStats] = useState(null);
  const [academyStats, setAcademyStats] = useState(null);
  const [selectedAcademy, setSelectedAcademy] = useState(null);
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const statsResponse = await API.get('/stats/personal');
      setPersonalStats(statsResponse.data);

      const enrollmentResponse = await API.get('/enrollment/my-academies');
      setAcademies(enrollmentResponse.data);

      if (enrollmentResponse.data.length > 0) {
        setSelectedAcademy(enrollmentResponse.data[0]._id);
        loadAcademyStats(enrollmentResponse.data[0]._id);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setLoading(false);
    }
  };

  const loadAcademyStats = async (academyId) => {
    try {
      const response = await API.get(`/stats/academy/${academyId}`);
      setAcademyStats(response.data);
    } catch (err) {
      console.error('Failed to load academy stats:', err);
    }
  };

  const handleAcademyChange = (academyId) => {
    setSelectedAcademy(academyId);
    loadAcademyStats(academyId);
  };

  if (loading) {
    return <div className="statistics-container">로딩 중...</div>;
  }

  const personalChartData = personalStats ? {
    labels: ['완료', '대기', '기한초과'],
    datasets: [{
      data: [personalStats.completed, personalStats.pending, personalStats.overdue],
      backgroundColor: ['#28a745', '#ffc107', '#e74c3c']
    }]
  } : null;

  const academyChartData = academyStats ? {
    labels: Object.keys(academyStats.subjectStats),
    datasets: [{
      label: '완료됨',
      data: Object.values(academyStats.subjectStats).map(s => s.completed),
      backgroundColor: '#667eea'
    }, {
      label: '미완료',
      data: Object.values(academyStats.subjectStats).map(s => s.total - s.completed),
      backgroundColor: '#e0e0e0'
    }]
  } : null;

  return (
    <div className="statistics-container">
      <header className="stats-header">
        <h1>통계</h1>
        <button onClick={() => navigate('/dashboard')}>대시보드로</button>
      </header>

      <main className="stats-content">
        <section className="personal-stats">
          <h2>개인 통계</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value completed">{personalStats?.completed || 0}</div>
              <div className="stat-label">완료한 숙제</div>
            </div>
            <div className="stat-card">
              <div className="stat-value pending">{personalStats?.pending || 0}</div>
              <div className="stat-label">대기 중</div>
            </div>
            <div className="stat-card">
              <div className="stat-value overdue">{personalStats?.overdue || 0}</div>
              <div className="stat-label">기한 초과</div>
            </div>
            <div className="stat-card">
              <div className="stat-value total">{personalStats?.completionRate || 0}%</div>
              <div className="stat-label">완료율</div>
            </div>
          </div>

          {personalChartData && (
            <div className="chart-container">
              <Pie data={personalChartData} options={{ responsive: true }} />
            </div>
          )}
        </section>

        {user?.role === 'teacher' && academies.length > 0 && (
          <section className="academy-stats">
            <h2>학원 통계</h2>
            <select value={selectedAcademy || ''} onChange={(e) => handleAcademyChange(e.target.value)}>
              {academies.map(academy => (
                <option key={academy._id} value={academy._id}>
                  {academy.name}
                </option>
              ))}
            </select>

            {academyStats && (
              <>
                <div className="academy-info">
                  <p>전체 숙제: <strong>{academyStats.totalHomeworks}</strong></p>
                  <p>완료된 숙제: <strong>{academyStats.completedHomeworks}</strong></p>
                  <p>완료율: <strong>{academyStats.completionRate}%</strong></p>
                </div>

                {academyChartData && academyChartData.labels.length > 0 && (
                  <div className="chart-container">
                    <h3>교과별 진행도</h3>
                    <Bar data={academyChartData} options={{ responsive: true }} />
                  </div>
                )}

                <div className="student-stats">
                  <h3>학생별 진행도</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>학생명</th>
                        <th>완료/전체</th>
                        <th>완료율</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academyStats.studentStats.map(stat => (
                        <tr key={stat.student._id}>
                          <td>{stat.student.name}</td>
                          <td>{stat.completed}/{stat.total}</td>
                          <td>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${stat.rate}%` }}>
                                {stat.rate}%
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
