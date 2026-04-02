import { useEffect, useState } from 'react';
import api from '../api/axios';
import CourseForm from '../components/CourseForm';
import DrivePreview from '../components/DrivePreview';
import HoursCounter from '../components/HoursCounter';
import { useAuth } from '../context/AuthContext';

export default function TeacherProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [teacherRes, coursesRes] = await Promise.all([
        api.get('/teachers/me'),
        api.get('/courses/my'),
      ]);
      setProfile(teacherRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося завантажити профіль');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const deleteCourse = async (courseId) => {
    try {
      await api.delete(`/courses/${courseId}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося видалити курс');
    }
  };

  const confirmedHours = profile?.confirmedHours ?? 0;
  const totalHours = profile?.totalHours ?? 0;

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Кабінет викладача</p>
          <h1>{profile?.fullName || 'Завантаження...'}</h1>
        </div>
        <button type="button" className="ghost-button" onClick={logout}>Вийти</button>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      <HoursCounter confirmed={confirmedHours} total={totalHours} required={profile?.requiredHours ?? 150} />

      <section className="panel info-grid">
        <article>
          <p className="eyebrow">Атестація</p>
          <h3>{profile?.nextAttestationDate || '...'}</h3>
          <p>Наступна дата атестації</p>
        </article>
        <article>
          <p className="eyebrow">Категорія</p>
          <h3>{profile?.categoryName || '...'}</h3>
          <p>{profile?.positionName || '...'}</p>
        </article>
        <article>
          <p className="eyebrow">Примітка</p>
          <h3>{profile?.attestationNote || 'Без приміток'}</h3>
          <p>Коментар до графіку атестації</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Підвищення кваліфікації</p>
            <h2>Мої курси</h2>
          </div>
          <button type="button" className="primary-button" onClick={() => setShowForm(true)}>Додати курс</button>
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
                <th>Сертифікат</th>
                <th>Видалити</th>
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
                    <button type="button" className="inline-button" onClick={() => setSelectedUrl(course.driveUrl)}>
                      Переглянути
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="inline-button danger-link"
                      disabled={course.confirmed}
                      onClick={() => deleteCourse(course.id)}
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showForm ? (
        <div className="modal-backdrop">
          <div className="modal-card panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Новий запис</p>
                <h3>Додати курс</h3>
              </div>
            </div>
            <CourseForm
              onCancel={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                loadData();
              }}
            />
          </div>
        </div>
      ) : null}

      {selectedUrl ? (
        <div className="modal-backdrop" onClick={() => setSelectedUrl('')}>
          <div className="modal-card panel wide-modal" onClick={(event) => event.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Сертифікат</p>
                <h3>Перегляд документа</h3>
              </div>
              <button type="button" className="ghost-button" onClick={() => setSelectedUrl('')}>Закрити</button>
            </div>
            <DrivePreview url={selectedUrl} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
