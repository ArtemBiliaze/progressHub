import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function SendReport() {
  const [formData, setFormData] = useState({
    weight: '',
    steps: '',
    reflection: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await api.post('/reports', formData);
      setMessage({ text: '✅ Отчет успешно отправлен!', type: 'success' });
      
      // Перенаправляем на дашборд через 1.5 секунды, чтобы юзер успел увидеть успех
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage({ 
        text: '❌ Ошибка при отправке: ' + (err.response?.data?.error || 'Сервер недоступен'), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Новый отчет о прогрессе</h2>
        <p style={styles.subtitle}>Заполни данные за сегодня, чтобы тренер мог дать обратную связь.</p>

        {message.text && (
          <div style={{ 
            ...styles.alert, 
            backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#065f46' : '#991b1b'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Текущий вес (кг)</label>
            <input
              type="number"
              step="0.1"
              name="weight"
              required
              placeholder="Например: 75.5"
              value={formData.weight}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Количество шагов</label>
            <input
              type="number"
              name="steps"
              required
              placeholder="Например: 10000"
              value={formData.steps}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Твои мысли / самочувствие</label>
            <textarea
              name="reflection"
              placeholder="Как прошла тренировка? Как питание? Есть ли усталость?"
              value={formData.reflection}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Отправка...' : 'Отправить отчет тренеру'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '20px' },
  card: { 
    background: '#fff', 
    padding: '30px', 
    borderRadius: '16px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
    width: '100%', 
    maxWidth: '500px' 
  },
  title: { margin: '0 0 10px 0', color: '#1e293b' },
  subtitle: { color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#334155' },
  input: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    fontSize: '1rem',
    outlineColor: '#2563eb'
  },
  textarea: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    fontSize: '1rem', 
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  submitBtn: { 
    padding: '14px', 
    backgroundColor: '#2563eb', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '1rem', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  alert: { padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }
};