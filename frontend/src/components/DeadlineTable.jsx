const rowColors = {
  CRITICAL: '#fee2e2',
  WARNING: '#fef9c3',
  OK: 'transparent',
};

const statusLabels = {
  CRITICAL: 'Критично',
  WARNING: 'Увага',
  OK: 'Норма',
};

export default function DeadlineTable({ teachers, onSelect }) {
  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            <th>ПІБ</th>
            <th>Категорія</th>
            <th>Посада</th>
            <th>Остання атестація</th>
            <th>Наступна атестація</th>
            <th>Підтверджені год / 150</th>
            <th>Статус</th>
            <th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id} style={{ background: rowColors[teacher.deadlineStatus] }} onClick={() => onSelect(teacher)}>
              <td>{teacher.fullName}</td>
              <td>{teacher.categoryName}</td>
              <td>{teacher.positionName}</td>
              <td>{teacher.lastAttestationDate}</td>
              <td>{teacher.nextAttestationDate}</td>
              <td>{teacher.confirmedHours} / {teacher.requiredHours}</td>
              <td>{statusLabels[teacher.deadlineStatus]}</td>
              <td>
                <button type="button" className="inline-button" onClick={(event) => {
                  event.stopPropagation();
                  onSelect(teacher);
                }}>
                  Деталі
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
