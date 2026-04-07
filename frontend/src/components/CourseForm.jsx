import { useEffect, useState } from 'react';
import api from '../api/axios';

function calculateEcts(hoursValue) {
  const hours = Number(hoursValue);
  if (!Number.isFinite(hours) || hours <= 0) {
    return '';
  }
  return (Math.floor(hours / 3) / 10).toFixed(1);
}

const initialState = {
  title: '',
  institution: '',
  issueDate: '',
  hours: 1,
  ectsCredits: '0.0',
  categoryId: '',
  driveUrl: '',
};

export default function CourseForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/categories')
      .then(({ data }) => setCategories(data))
      .catch((err) => setError(err.response?.data?.message || 'Не вдалося завантажити категорії'));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      if (name === 'hours') {
        return {
          ...prev,
          hours: value,
          ectsCredits: calculateEcts(value),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/courses', {
        ...form,
        hours: Number(form.hours),
        categoryId: Number(form.categoryId),
        ectsCredits: form.ectsCredits ? Number(form.ectsCredits) : null,
      });
      setForm(initialState);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Не вдалося зберегти курс');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Назва
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Організатор
          <input name="institution" value={form.institution} onChange={handleChange} required />
        </label>
        <label>
          Дата
          <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} required />
        </label>
        <label>
          Години
          <input type="number" min="1" name="hours" value={form.hours} onChange={handleChange} required />
        </label>
        <label>
          ECTS
          <input type="number" step="0.1" name="ectsCredits" value={form.ectsCredits} readOnly />
        </label>
        <label>
          Категорія
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
            <option value="">Оберіть категорію</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Посилання на Google Drive
        <input name="driveUrl" value={form.driveUrl} onChange={handleChange} placeholder="https://drive.google.com/..." />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="button" className="ghost-button" onClick={onCancel}>Скасувати</button>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Збереження...' : 'Додати курс'}
        </button>
      </div>
    </form>
  );
}
