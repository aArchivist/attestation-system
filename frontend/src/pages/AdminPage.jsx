import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyTeacher = {
  fullName: '',
  positionId: '',
  categoryId: '',
  pedagogicalTitle: '',
  lastAttestationDate: '',
  attestationNote: '',
  disciplines: '',
};

const emptyUser = {
  username: '',
  password: '',
  role: 'TEACHER',
  teacherId: '',
};

export default function AdminPage() {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teacherCategories, setTeacherCategories] = useState([]);
  const [teacherForm, setTeacherForm] = useState(emptyTeacher);
  const [userForm, setUserForm] = useState(emptyUser);
  const [error, setError] = useState('');
  const nextAttestationPreview = teacherForm.lastAttestationDate
    ? (() => {
        const [year, month, day] = teacherForm.lastAttestationDate.split('-').map(Number);
        if (!year || !month || !day) {
          return '';
        }
        return `${year + 5}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      })()
    : '';

  const loadData = async () => {
    try {
      const [usersRes, teachersRes, positionsRes, teacherCategoriesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/teachers'),
        api.get('/admin/positions'),
        api.get('/admin/users-categories'),
      ]);
      setUsers(usersRes.data);
      setTeachers(teachersRes.data);
      setPositions(positionsRes.data);
      setTeacherCategories(teacherCategoriesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося завантажити панель адміністратора');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createTeacher = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/teachers', {
        ...teacherForm,
        positionId: Number(teacherForm.positionId),
        categoryId: Number(teacherForm.categoryId),
        nextAttestationDate: null,
        disciplines: teacherForm.disciplines
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      });
      setTeacherForm(emptyTeacher);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося створити викладача');
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    setError('');
    if (userForm.role === 'TEACHER' && !userForm.teacherId) {
      setError('Для користувача з роллю TEACHER потрібно обрати викладача');
      return;
    }
    try {
      await api.post('/admin/users', {
        ...userForm,
        teacherId: userForm.teacherId ? Number(userForm.teacherId) : null,
      });
      setUserForm(emptyUser);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося створити користувача');
    }
  };

  const resetPassword = async (userId) => {
    const newPassword = window.prompt('Новий пароль');
    if (!newPassword) {
      return;
    }
    try {
      await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося змінити пароль');
    }
  };

  const toggleActive = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося змінити статус');
    }
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Панель адміністратора</p>
          <h1>Користувачі та структура довідників</h1>
        </div>
        <button type="button" className="ghost-button" onClick={logout}>Вийти</button>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="admin-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Викладачі</p>
              <h2>Створити профіль викладача</h2>
            </div>
          </div>

          <form className="stack-form" onSubmit={createTeacher}>
            <div className="form-grid">
              <label>
                ПІБ
                <input value={teacherForm.fullName} onChange={(event) => setTeacherForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
              </label>
              <label>
                Посада
                <select value={teacherForm.positionId} onChange={(event) => setTeacherForm((prev) => ({ ...prev, positionId: event.target.value }))} required>
                  <option value="">Оберіть</option>
                  {positions.map((position) => (
                    <option key={position.id} value={position.id}>{position.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Категорія
                <select value={teacherForm.categoryId} onChange={(event) => setTeacherForm((prev) => ({ ...prev, categoryId: event.target.value }))} required>
                  <option value="">Оберіть</option>
                  {teacherCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Педагогічне звання
                <select value={teacherForm.pedagogicalTitle} onChange={(event) => setTeacherForm((prev) => ({ ...prev, pedagogicalTitle: event.target.value }))}>
                  <option value="">Не вказано</option>
                  <option value="Старший викладач">Старший викладач</option>
                  <option value="Викладач-методист">Викладач-методист</option>
                </select>
              </label>
              <label>
                Остання атестація
                <input type="date" value={teacherForm.lastAttestationDate} onChange={(event) => setTeacherForm((prev) => ({ ...prev, lastAttestationDate: event.target.value }))} required />
              </label>
              <label>
                Наступна атестація
                <input type="date" value={nextAttestationPreview} readOnly />
              </label>
            </div>
            <label>
              Дисципліни
              <input value={teacherForm.disciplines} onChange={(event) => setTeacherForm((prev) => ({ ...prev, disciplines: event.target.value }))} placeholder="Через кому" />
            </label>
            <label>
              Примітка
              <textarea value={teacherForm.attestationNote} onChange={(event) => setTeacherForm((prev) => ({ ...prev, attestationNote: event.target.value }))} rows="3" />
            </label>
            <button type="submit" className="primary-button">Створити викладача</button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Облікові записи</p>
              <h2>Створити користувача</h2>
            </div>
          </div>

          <form className="stack-form" onSubmit={createUser}>
            <label>
              Username
              <input value={userForm.username} onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))} required />
            </label>
            <label>
              Password
              <input type="password" value={userForm.password} onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))} required />
            </label>
            <label>
              Role
              <select value={userForm.role} onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}>
                <option value="TEACHER">TEACHER</option>
                <option value="HEAD">HEAD</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
            <label>
              Teacher
              <select
                value={userForm.teacherId}
                onChange={(event) => setUserForm((prev) => ({ ...prev, teacherId: event.target.value }))}
                required={userForm.role === 'TEACHER'}
              >
                <option value="">Не прив&apos;язувати</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="primary-button">Створити користувача</button>
          </form>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Доступ</p>
            <h2>Список користувачів</h2>
          </div>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Teacher ID</th>
                <th>Active</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>{user.teacherId || '-'}</td>
                  <td>{user.active ? 'Активний' : 'Заблокований'}</td>
                  <td>
                    <button type="button" className="inline-button" onClick={() => resetPassword(user.id)}>
                      Скинути пароль
                    </button>
                    <button type="button" className="inline-button" onClick={() => toggleActive(user.id)}>
                      {user.active ? 'Заблокувати' : 'Активувати'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
