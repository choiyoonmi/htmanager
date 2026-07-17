import { useState } from 'react';
import { homework as homeworkApi } from '../services/api';
import '../styles/HomeworkCard.css';

export default function HomeworkCard({ homework }) {
  const [submitted, setSubmitted] = useState(
    homework.submittedBy?.some(id => id === localStorage.getItem('userId'))
  );

  const handleSubmit = async () => {
    try {
      await homeworkApi.submit(homework._id);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysLeft(homework.dueDate);
  const isPriority = homework.priority === 'high';
  const isOverdue = daysLeft < 0;

  return (
    <div className={`homework-card ${isPriority ? 'priority' : ''} ${isOverdue ? 'overdue' : ''}`}>
      <div className="card-header">
        <h3>{homework.title}</h3>
        <span className={`status ${homework.status}`}>{homework.status}</span>
      </div>

      <div className="card-body">
        <p className="subject">{homework.subject}</p>
        <p className="description">{homework.description}</p>

        {homework.assignedTo && homework.assignedTo.length > 0 && (
          <p className="assigned-students">
            👥 대상: {homework.assignedTo.length}명
          </p>
        )}

        <div className="card-footer">
          <span className={`due-date ${isOverdue ? 'overdue' : daysLeft <= 3 ? 'urgent' : ''}`}>
            {isOverdue ? `${Math.abs(daysLeft)}일 지남` : `${daysLeft}일 남음`}
          </span>

          {!submitted && (
            <button
              className="submit-button"
              onClick={handleSubmit}
            >
              제출하기
            </button>
          )}
          {submitted && (
            <span className="submitted">✓ 제출됨</span>
          )}
        </div>
      </div>
    </div>
  );
}
