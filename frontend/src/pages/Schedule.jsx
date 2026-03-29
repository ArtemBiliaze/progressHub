import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

export default function Schedule() {
  // 1-4. Стейты (состояния)
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  // 5-7. Данные пользователя и права доступа
  const token = localStorage.getItem('token');
  let user = null;
  let isCoach = false;

  if (token) {
    try {
      user = jwtDecode(token);
      isCoach = user?.role === 'COACH';
    } catch (e) {
      console.error("Ошибка токена");
    }
  }

  // 8. Функция показа уведомлений
  const showMessage = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
  };

  // 9. Функция загрузки данных
  const fetchSlots = useCallback(async () => {
    try {
      const response = await api.get('/workouts');
      setSlots(response.data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Запускаем загрузку при старте
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Функция создания (для тренера)
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newDate) return showMessage("Выбери дату и время!", "error");

    try {
      const dateObj = new Date(newDate);
      const autoTimeSlot = dateObj.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      await api.post('/workouts', { 
        date: dateObj.toISOString(), 
        timeSlot: autoTimeSlot 
      });

      showMessage("✅ Слот создан на " + autoTimeSlot);
      setNewDate(''); 
      fetchSlots();
    } catch (error) {
      showMessage("❌ Ошибка: " + (error.response?.data?.error || "Ошибка сервера"), 'error');
    }
  };

  // Функция записи (для клиента)
  const bookWorkout = async (id) => {
    try {
      await api.patch(`/workouts/book/${id}`);
      showMessage("✅ Ты записан на тренировку!");
      fetchSlots();
    } catch (error) {
      showMessage("❌ Ошибка при записи", 'error');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* ФОРМА ТРЕНЕРА */}
      {isCoach && (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0 }}>➕ Добавить тренировку</h3>
          <form onSubmit={handleCreateSlot} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="datetime-local" 
              value={newDate} 
              onChange={(e) => setNewDate(e.target.value)} 
              required 
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', flex: 1 }}
            />
            <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              Создать
            </button>
          </form>
          {statusMsg.text && (
            <div style={{ marginTop: '15px', color: statusMsg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
              {statusMsg.text}
            </div>
          )}
        </div>
      )}

      <h2>🗓️ Расписание</h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {slots.length === 0 && <p>Тренировок пока нет...</p>}
        {slots.map(slot => (
          <div key={slot.id} style={{ 
            border: '1px solid #e2e8f0', 
            padding: '15px', 
            borderRadius: '12px', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: slot.status === 'BOOKED' ? '#f1f5f9' : 'white'
          }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {new Date(slot.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'short' })}
              </div>
              <div style={{ color: '#64748b' }}>Время: {slot.timeSlot}</div>
              <div style={{ fontSize: '0.8rem', color: slot.status === 'FREE' ? '#10b981' : '#ef4444' }}>
                {slot.status === 'FREE' ? '● Свободно' : '● Занято'}
              </div>
            </div>
            
            {!isCoach && slot.status === 'FREE' && (
              <button 
                onClick={() => bookWorkout(slot.id)}
                style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Записаться
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}