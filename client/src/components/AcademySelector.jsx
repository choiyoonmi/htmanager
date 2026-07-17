import { useEffect, useState } from 'react';
import { enrollment } from '../services/api';
import '../styles/AcademySelector.css';

export default function AcademySelector({ selectedAcademy, onAcademyChange }) {
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAcademies();
  }, []);

  const loadAcademies = async () => {
    try {
      const response = await enrollment.getMyAcademies();
      setAcademies(response.data);
      if (response.data.length > 0 && !selectedAcademy) {
        onAcademyChange(response.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load academies:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="academy-selector">로딩 중...</div>;
  }

  return (
    <div className="academy-selector">
      <label htmlFor="academy-select">학원 선택:</label>
      <select
        id="academy-select"
        value={selectedAcademy || ''}
        onChange={(e) => onAcademyChange(e.target.value)}
        className="academy-dropdown"
      >
        <option value="">학원 선택...</option>
        {academies.map((academy) => (
          <option key={academy._id} value={academy._id}>
            {academy.name}
          </option>
        ))}
      </select>
    </div>
  );
}
