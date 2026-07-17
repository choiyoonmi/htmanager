import '../styles/FilterBar.css';

export default function FilterBar({ filters, onFiltersChange, subjects }) {
  const dateFilterOptions = [
    { value: 'all', label: '모든 숙제' },
    { value: 'week', label: '이번주' },
    { value: 'month', label: '이번달' },
    { value: 'urgent', label: '기한 임박' }
  ];

  const defaultSubjects = ['국어', '영어', '수학'];

  const statusFilterOptions = [
    { value: 'all', label: '전체' },
    { value: 'pending', label: '대기 중' },
    { value: 'completed', label: '완료' },
    { value: 'overdue', label: '기한 초과' }
  ];

  const handleDateChange = (value) => {
    onFiltersChange({ ...filters, dateFilter: value });
  };

  const handleSubjectChange = (value) => {
    onFiltersChange({ ...filters, subjectFilter: value });
  };

  const handleStatusChange = (value) => {
    onFiltersChange({ ...filters, statusFilter: value });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>날짜</label>
        <select value={filters.dateFilter || 'all'} onChange={(e) => handleDateChange(e.target.value)}>
          {dateFilterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>교과</label>
        <select value={filters.subjectFilter || 'all'} onChange={(e) => handleSubjectChange(e.target.value)}>
          <option value="all">전체</option>
          {(subjects && subjects.length > 0 ? subjects : defaultSubjects).map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>상태</label>
        <select value={filters.statusFilter || 'all'} onChange={(e) => handleStatusChange(e.target.value)}>
          {statusFilterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
