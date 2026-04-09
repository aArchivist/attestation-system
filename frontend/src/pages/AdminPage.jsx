import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import ActionIcon from '../components/ActionIcon';
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

function toTeacherForm(teacher) {
  return {
    fullName: teacher.fullName ?? '',
    positionId: teacher.positionId ? String(teacher.positionId) : '',
    categoryId: teacher.categoryId ? String(teacher.categoryId) : '',
    pedagogicalTitle: teacher.pedagogicalTitle ?? '',
    lastAttestationDate: teacher.lastAttestationDate ?? '',
    attestationNote: teacher.attestationNote ?? '',
    disciplines: teacher.disciplines?.join(', ') ?? '',
  };
}

function toUserForm(user) {
  return {
    username: user.username ?? '',
    password: '',
    role: user.role ?? 'TEACHER',
    teacherId: user.teacherId ? String(user.teacherId) : '',
  };
}

export default function AdminPage() {
  const { logout } = useAuth();
  const teacherFormRef = useRef(null);
  const userFormRef = useRef(null);
  const teacherListRef = useRef(null);
  const userListRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teacherCategories, setTeacherCategories] = useState([]);
  const [teacherForm, setTeacherForm] = useState(emptyTeacher);
  const [userForm, setUserForm] = useState(emptyUser);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    setSuccessMessage('');
    try {
      const payload = {
        ...teacherForm,
        positionId: Number(teacherForm.positionId),
        categoryId: Number(teacherForm.categoryId),
        nextAttestationDate: null,
        disciplines: teacherForm.disciplines
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      };
      if (editingTeacherId) {
        await api.put(`/teachers/${editingTeacherId}`, payload);
      } else {
        await api.post('/teachers', payload);
      }
      setTeacherForm(emptyTeacher);
      setEditingTeacherId(null);
      await loadData();
      setSuccessMessage(editingTeacherId ? 'Дані викладача успішно оновлено' : 'Викладача успішно створено');
      if (editingTeacherId) {
        requestAnimationFrame(() => {
          teacherListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося зберегти викладача');
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    if (userForm.role === 'TEACHER' && !userForm.teacherId) {
      setError('Для користувача з роллю TEACHER потрібно обрати викладача');
      return;
    }
    try {
      const payload = {
        ...userForm,
        teacherId: userForm.role === 'TEACHER' && userForm.teacherId ? Number(userForm.teacherId) : null,
      };
      if (editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, {
          username: payload.username,
          role: payload.role,
          teacherId: payload.teacherId,
        });
      } else {
        await api.post('/admin/users', payload);
      }
      setUserForm(emptyUser);
      setEditingUserId(null);
      await loadData();
      setSuccessMessage(editingUserId ? 'Користувача успішно оновлено' : 'Користувача успішно створено');
      if (editingUserId) {
        requestAnimationFrame(() => {
          userListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося зберегти користувача');
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
      setSuccessMessage('Пароль успішно змінено');
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося змінити пароль');
    }
  };

  const toggleActive = async (userId) => {
    setError('');
    setSuccessMessage('');
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      await loadData();
      setSuccessMessage('Статус користувача успішно змінено');
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося змінити статус');
    }
  };

  const startTeacherEdit = (teacher) => {
    setError('');
    setSuccessMessage('');
    setEditingTeacherId(teacher.id);
    setTeacherForm(toTeacherForm(teacher));
    requestAnimationFrame(() => {
      teacherFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const cancelTeacherEdit = () => {
    setEditingTeacherId(null);
    setTeacherForm(emptyTeacher);
    requestAnimationFrame(() => {
      teacherListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const deleteTeacher = async (teacherId) => {
    if (!window.confirm('Видалити цього викладача?')) {
      return;
    }
    setError('');
    setSuccessMessage('');
    try {
      await api.delete(`/teachers/${teacherId}`);
      if (editingTeacherId === teacherId) {
        cancelTeacherEdit();
      }
      await loadData();
      setSuccessMessage('Викладача успішно видалено');
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося видалити викладача');
    }
  };

  const startUserEdit = (user) => {
    setError('');
    setSuccessMessage('');
    setEditingUserId(user.id);
    setUserForm(toUserForm(user));
    requestAnimationFrame(() => {
      userFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const cancelUserEdit = () => {
    setEditingUserId(null);
    setUserForm(emptyUser);
    requestAnimationFrame(() => {
      userListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Видалити цього користувача?')) {
      return;
    }
    setError('');
    setSuccessMessage('');
    try {
      await api.delete(`/admin/users/${userId}`);
      if (editingUserId === userId) {
        cancelUserEdit();
      }
      await loadData();
      setSuccessMessage('Користувача успішно видалено');
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося видалити користувача');
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
      {successMessage ? <p className="form-success">{successMessage}</p> : null}

      <section className="admin-grid">
        <article className="panel" ref={teacherFormRef}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Викладачі</p>
              <h2>{editingTeacherId ? 'Редагувати профіль викладача' : 'Створити профіль викладача'}</h2>
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
            <div className="form-actions">
              {editingTeacherId ? (
                <button type="button" className="ghost-button" onClick={cancelTeacherEdit}>Скасувати</button>
              ) : null}
              <button type="submit" className="primary-button">
                {editingTeacherId ? 'Зберегти зміни' : 'Створити викладача'}
              </button>
            </div>
          </form>
        </article>

        <article className="panel" ref={userFormRef}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Облікові записи</p>
              <h2>{editingUserId ? 'Редагувати користувача' : 'Створити користувача'}</h2>
            </div>
          </div>

          <form className="stack-form" onSubmit={createUser}>
            <label>
              Username
              <input value={userForm.username} onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))} required />
            </label>
            {!editingUserId ? (
              <label>
                Password
                <input type="password" value={userForm.password} onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))} required />
              </label>
            ) : null}
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
            <div className="form-actions">
              {editingUserId ? (
                <button type="button" className="ghost-button" onClick={cancelUserEdit}>Скасувати</button>
              ) : null}
              <button type="submit" className="primary-button">
                {editingUserId ? 'Зберегти зміни' : 'Створити користувача'}
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="panel" ref={teacherListRef}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Викладачі</p>
            <h2>Список викладачів</h2>
          </div>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>ПІБ</th>
                <th>Посада</th>
                <th>Категорія</th>
                <th>Педагогічне звання</th>
                <th>Остання атестація</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.fullName}</td>
                  <td>{teacher.positionName}</td>
                  <td>{teacher.categoryName}</td>
                  <td>{teacher.pedagogicalTitle || '-'}</td>
                  <td>{teacher.lastAttestationDate}</td>
                  <td>
                    <button type="button" className="inline-button" onClick={() => startTeacherEdit(teacher)} title="Редагувати" aria-label="Редагувати">
                      <ActionIcon name="edit" />
                    </button>
                    <button type="button" className="inline-button" onClick={() => deleteTeacher(teacher.id)} title="Видалити" aria-label="Видалити">
                      <ActionIcon name="delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" ref={userListRef}>
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
                    <button type="button" className="inline-button" onClick={() => resetPassword(user.id)} title="Скинути пароль" aria-label="Скинути пароль">
                      <ActionIcon name="key" />
                    </button>
                    <button type="button" className="inline-button" onClick={() => startUserEdit(user)} title="Редагувати" aria-label="Редагувати">
                      <ActionIcon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="inline-button"
                      onClick={() => toggleActive(user.id)}
                      title={user.active ? 'Активний користувач' : 'Заблокований користувач'}
                      aria-label={user.active ? 'Активний користувач' : 'Заблокований користувач'}
                    >
                      <ActionIcon name={user.active ? 'unlock' : 'lock'} />
                    </button>
                    <button type="button" className="inline-button" onClick={() => deleteUser(user.id)} title="Видалити" aria-label="Видалити">
                      <ActionIcon name="delete" />
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
