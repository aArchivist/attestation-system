import { useEffect, useState } from 'react';
import api from '../api/axios';
import ActionIcon from '../components/ActionIcon';
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
  const [editingCourse, setEditingCourse] = useState(null);
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

  const startCourseEdit = (course) => {
    setError('');
    if (course.confirmed) {
      setError('Підтверджений курс не можна редагувати');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSelectedUrl('');
    setEditingCourse(course);
    setShowForm(true);
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
          <p className="eyebrow">Наступна атестація</p>
          <h3>{profile?.nextAttestationDate || '...'}</h3>
        </article>
        <article>
          <p className="eyebrow">Остання атестація</p>
          <h3>{profile?.lastAttestationDate || '...'}</h3>
        </article>
        <article>
          <p className="eyebrow">Категорія</p>
          <h3>{profile?.categoryName || '...'}</h3>
        </article>
        <article>
          <p className="eyebrow">Посада</p>
          <h3>{profile?.positionName || '...'}</h3>
        </article>
        <article>
          <p className="eyebrow">Педагогічне звання</p>
          <h3>{profile?.pedagogicalTitle || 'Не вказано'}</h3>
        </article>
        <article>
          <p className="eyebrow">Дисципліни</p>
          <h3>{profile?.disciplines?.length ? profile.disciplines.join(', ') : 'Не вказано'}</h3>
        </article>
        <article className="info-card-wide">
          <p className="eyebrow">Примітка</p>
          <h3>{profile?.attestationNote || 'Без приміток'}</h3>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Підвищення кваліфікації</p>
            <h2>Мої курси</h2>
          </div>
          <button
            type="button"
            className="primary-button icon-button add-course-button"
            onClick={() => {
              setError('');
              setEditingCourse(null);
              setShowForm(true);
            }}
            title="Додати курс"
            aria-label="Додати курс"
          >
            <ActionIcon name="add" className="add-icon" />
          </button>
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
                <th className="action-column">Сертифікат</th>
                <th className="action-column">Дії</th>
                <th className="action-column">Видалення</th>
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
                  <td className="action-cell">
                    <button
                      type="button"
                      className="inline-button icon-button"
                      onClick={() => setSelectedUrl(course.driveUrl)}
                      title="Переглянути сертифікат"
                      aria-label="Переглянути сертифікат"
                    >
                      <ActionIcon name="view" />
                    </button>
                  </td>
                  <td className="action-cell">
                    <button
                      type="button"
                      className="inline-button icon-button"
                      onClick={() => startCourseEdit(course)}
                      title={course.confirmed ? 'Підтверджений курс не можна редагувати' : 'Редагувати курс'}
                      aria-label={course.confirmed ? 'Підтверджений курс не можна редагувати' : 'Редагувати курс'}
                    >
                      <ActionIcon name="edit" />
                    </button>
                  </td>
                  <td className="action-cell">
                    <button
                      type="button"
                      className="inline-button icon-button danger-link"
                      disabled={course.confirmed}
                      onClick={() => deleteCourse(course.id)}
                      title={course.confirmed ? 'Підтверджений курс не можна видаляти' : 'Видалити курс'}
                      aria-label={course.confirmed ? 'Підтверджений курс не можна видаляти' : 'Видалити курс'}
                    >
                      <ActionIcon name="delete" />
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
                <p className="eyebrow">{editingCourse ? 'Редагування' : 'Новий запис'}</p>
                <h3>{editingCourse ? 'Редагувати курс' : 'Додати курс'}</h3>
              </div>
            </div>
            <CourseForm
              initialCourse={editingCourse}
              onCancel={() => {
                setShowForm(false);
                setEditingCourse(null);
              }}
              onSuccess={() => {
                setShowForm(false);
                setEditingCourse(null);
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
