import { useState } from 'react';
import api from '../api';

export default function Reports() {
  const [weight, setWeight] = useState('');
  const [steps, setSteps] = useState('');
  const [reflection, setReflection] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/reports', {
        weight: parseFloat(weight),
        steps: parseInt(steps),
        reflection,
        photos: "link_to_photo" // Позже добавим загрузку файлов
      });
      setMessage("✅ Отчет успешно отправлен!");
      // Очищаем форму
      setWeight('');
      setSteps('');
      setReflection('');
    } catch (error) {
      setMessage("❌ Ошибка: " + (error.response?.data?.error || "Сервер недоступен"));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>📝 Отправить отчет за сегодня</h2>
      
      {message && <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label>
          Вес (кг):
          <input 
            type="number" 
            step="0.1" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </label>

        <label>
          Шаги:
          <input 
            type="number" 
            value={steps} 
            onChange={(e) => setSteps(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </label>

        <label>
          Как прошел день?
          <textarea 
            value={reflection} 
            onChange={(e) => setReflection(e.target.value)} 
            placeholder="Твои мысли, самочувствие..."
            style={{ width: '100%', padding: '8px', minHeight: '80px' }}
          />
        </label>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Отправить данные
        </button>
      </form>
    </div>
  );
}