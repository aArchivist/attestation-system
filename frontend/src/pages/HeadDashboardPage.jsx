import { useEffect, useState } from 'react';
import api from '../api/axios';
import DeadlineTable from '../components/DeadlineTable';
import { useAuth } from '../context/AuthContext';

export default function HeadDashboardPage() {
  const { logout } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const loadTeachers = async (endpoint = '/teachers') => {
    try {
      const { data } = await api.get(endpoint);
      setTeachers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося завантажити список викладачів');
    }
  };

  const loadCourses = async (teacherId) => {
    try {
      const { data } = await api.get(`/courses/teacher/${teacherId}`);
      setCourses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося завантажити курси');
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const confirmCourse = async (courseId) => {
    try {
      await api.put(`/courses/${courseId}/confirm`);
      if (selectedTeacher) {
        await Promise.all([loadTeachers(year ? `/reports/attestation-year?year=${year}` : '/teachers'), loadCourses(selectedTeacher.id)]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося підтвердити курс');
    }
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Панель голови ЦК</p>
          <h1>Контроль дедлайнів атестації</h1>
        </div>
        <button type="button" className="ghost-button" onClick={logout}>Вийти</button>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="panel">
        <div className="toolbar">
          <label>
            Рік атестації
            <select
              value={year}
              onChange={async (event) => {
                const nextYear = event.target.value;
                setYear(nextYear);
                if (nextYear) {
                  await loadTeachers(`/reports/attestation-year?year=${nextYear}`);
                } else {
                  await loadTeachers();
                }
              }}
            >
              <option value="">Усі</option>
              {[2024, 2025, 2026, 2027, 2028].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <button type="button" className="ghost-button" onClick={() => loadTeachers('/reports/red-list')}>
            Червоний список
          </button>
          <button type="button" className="ghost-button" onClick={() => {
            setYear('');
            loadTeachers('/teachers');
          }}>
            Скинути фільтри
          </button>
        </div>

        <DeadlineTable
          teachers={teachers}
          onSelect={(teacher) => {
            setSelectedTeacher(teacher);
            loadCourses(teacher.id);
          }}
        />
      </section>

      {selectedTeacher ? (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Деталі викладача</p>
              <h2>{selectedTeacher.fullName}</h2>
            </div>
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Назва</th>
                  <th>Організатор</th>
                  <th>Дата</th>
                  <th>Години</th>
                  <th>Категорія</th>
                  <th>Статус</th>
                  <th>Дія</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.institution}</td>
                    <td>{course.issueDate}</td>
                    <td>{course.hours}</td>
                    <td>{course.categoryName}</td>
                    <td>{course.confirmed ? 'Підтверджено' : 'Очікує'}</td>
                    <td>
                      {!course.confirmed ? (
                        <button type="button" className="inline-button" onClick={() => confirmCourse(course.id)}>
                          Підтвердити
                        </button>
                      ) : 'Готово'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
