import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const redirectByRole = {
  TEACHER: '/profile',
  HEAD: '/dashboard',
  ADMIN: '/admin',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const role = await login(form.username, form.password);
      navigate(redirectByRole[role] || '/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Помилка авторизації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <p className="eyebrow">Освітня аналітика</p>
        <h1>Система атестації викладачів</h1>
        <p>Єдиний простір для курсів підвищення кваліфікації, контролю дедлайнів і управління ролями.</p>
      </section>

      <section className="auth-card panel">
        <h2>Вхід у систему</h2>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Логін
            <input
              name="username"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              required
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>
      </section>
    </main>
  );
}
