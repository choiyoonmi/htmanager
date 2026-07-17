import '../styles/ProgressCard.css';

export default function ProgressCard({ completed, total, pending, overdue }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const drawCircularProgress = () => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <svg width="120" height="120" className="progress-svg">
        <circle cx="60" cy="60" r={radius} className="progress-bg" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="progress-fill"
          style={{ strokeDashoffset: offset, strokeDasharray: circumference }}
        />
        <text x="60" y="60" className="progress-text">
          {percentage}%
        </text>
      </svg>
    );
  };

  return (
    <div className="progress-card">
      <div className="progress-circle-container">
        {drawCircularProgress()}
      </div>
      <div className="progress-info">
        <h3>학습 현황</h3>
        <div className="stat-item">
          <span className="label">완료됨</span>
          <span className="value completed">{completed}</span>
        </div>
        <div className="stat-item">
          <span className="label">대기 중</span>
          <span className="value pending">{pending}</span>
        </div>
        <div className="stat-item">
          <span className="label">기한 초과</span>
          <span className="value overdue">{overdue}</span>
        </div>
        <div className="stat-item total">
          <span className="label">전체</span>
          <span className="value">{total}</span>
        </div>
      </div>
    </div>
  );
}
