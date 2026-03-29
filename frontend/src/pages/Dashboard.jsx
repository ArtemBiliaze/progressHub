import { useEffect, useState } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Состояния для логики ответа
  const [selectedReport, setSelectedReport] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Ошибка токена", err);
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [wRes, rRes] = await Promise.all([
        api.get('/workouts'),
        api.get('/reports')
      ]);
      setWorkouts(wRes.data);
      setReports(rRes.data);
    } catch (err) {
      console.error("Ошибка загрузки", err);
    } finally {
      setLoading(false);
    }
  };

  // Функция отправки комментария
  const handleSendComment = async (reportId) => {
    if (!commentText.trim()) return;
    try {
      await api.post('/comments', {
        reportId: reportId,
        text: commentText
      });
      alert('✅ Ответ отправлен!');
      setCommentText('');
      setSelectedReport(null);
      fetchData(); // Обновляем данные, чтобы увидеть новый коммент
    } catch (err) {
      alert('❌ Ошибка при отправке');
    }
  };

  if (loading) return <p>Загрузка...</p>;

  const isCoach = user?.role === 'COACH';

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>{isCoach ? 'Панель Тренера 👨‍🏫' : 'Мой Прогресс 🚀'}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: isCoach && selectedReport ? '1fr 1fr' : '1fr 1fr', gap: '20px', marginTop: '30px' }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ТРЕНИРОВКИ (или список отчетов для тренера) */}
        <section style={styles.card}>
          <h2>🗓 {isCoach ? 'Записи клиентов' : 'Мои занятия'}</h2>
          {workouts.filter(w => isCoach ? w.status === 'BOOKED' : w.clientId === user?.userId).map(w => (
            <div key={w.id} style={styles.item}>
              <strong>{w.timeSlot}</strong> — {isCoach ? w.client?.name : `Тренер: ${w.coach?.name}`}
            </div>
          ))}
          <button onClick={() => window.location.href = '/schedule'} style={styles.button}>
            {isCoach ? 'Управлять расписанием' : 'Записаться'}
          </button>
        </section>

        {/* ПРАВАЯ КОЛОНКА: ОТЧЕТЫ */}
        {/* СЕКЦИЯ: ОТЧЕТЫ */}
<section style={styles.card}>
  <h2>📈 {isCoach ? 'Входящие отчеты' : 'Моя история'}</h2>
  {reports.length === 0 ? (
    <p style={{ color: '#666' }}>Отчетов пока нет.</p>
  ) : (
    reports.map(report => {
      // Логика проверки на "свежесть" (отчет за сегодня и без ответа)
      const isToday = new Date(report.createdAt).toDateString() === new Date().toDateString();
      const isUnanswered = report.comments?.length === 0;
      const isNew = isCoach && isToday && isUnanswered;

      return (
        <div 
          key={report.id} 
          style={{ 
            ...styles.reportBox, 
            borderLeft: isNew ? '5px solid #ef4444' : '1px solid #f0f0f0', // Красная полоса для новых
            backgroundColor: isNew ? '#fff5f5' : '#fff'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{isCoach ? report.client?.name : 'Мой отчет'}</strong>
            {isNew && <span style={styles.newBadge}>НОВЫЙ</span>}
            <small style={{ color: '#999' }}>{new Date(report.createdAt).toLocaleDateString()}</small>
          </div>
          
          <p style={{ margin: '8px 0' }}>
            Вес: <b>{report.weight} кг</b> | Шаги: <b>{report.steps}</b>
          </p>

          {isCoach ? (
            <button 
              onClick={() => setSelectedReport(report)} 
              style={styles.linkButton}
            >
              {isUnanswered ? '✍️ Разобрать отчет' : '💬 Посмотреть ответ'}
            </button>
          ) : (
            <div style={styles.commentStatus}>
              {!isUnanswered 
                ? `✅ Тренер ответил: "${report.comments[0].text.substring(0, 30)}..."` 
                : '⏳ Ждем ответа тренера'}
            </div>
          )}
        </div>
      );
    })
  )}
</section>
      </div>

      {/* МОДАЛЬНОЕ ОКНО / БЛОК ОТВЕТА (только для тренера) */}
      {isCoach && selectedReport && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Разбор отчета: {selectedReport.client?.name}</h3>
            <p><strong>Мысли клиента:</strong> {selectedReport.reflection || 'Нет комментария'}</p>
            
            <div style={{ marginTop: '20px' }}>
              <h4>Твой совет/обратная связь:</h4>
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Напиши рекомендации по питанию или тренировкам..."
                style={styles.textarea}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => handleSendComment(selectedReport.id)} style={styles.saveButton}>Отправить</button>
                <button onClick={() => setSelectedReport(null)} style={styles.cancelButton}>Закрыть</button>
              </div>
            </div>

            {/* Показываем старые комментарии, если они есть */}
            {selectedReport.comments?.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                <small>Предыдущий ответ:</small>
                <p style={styles.oldComment}>{selectedReport.comments[0].text}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
    // Общий контейнер
    container: { 
      padding: '30px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      fontFamily: '"Inter", system-ui, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    },
    
    // Заголовки
    header: { 
      marginBottom: '30px', 
      borderBottom: '2px solid #e2e8f0', 
      paddingBottom: '15px' 
    },
  
    // Сетка (2 колонки)
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
      gap: '24px', 
      marginTop: '20px' 
    },
  
    // Карточки
    card: { 
      background: '#ffffff', 
      padding: '24px', 
      borderRadius: '16px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
      border: '1px solid #f1f5f9' 
    },
  
    // Тренировки
    item: { 
      padding: '12px 0', 
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
  
    // Контейнер отчета
    reportBox: { 
      marginBottom: '16px', 
      padding: '16px', 
      borderRadius: '12px', 
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease-in-out',
      position: 'relative',
      backgroundColor: '#fff'
    },
  
    // Бэдж "НОВЫЙ"
    newBadge: {
      backgroundColor: '#ef4444',
      color: 'white',
      fontSize: '0.7rem',
      padding: '2px 8px',
      borderRadius: '20px',
      fontWeight: 'bold'
    },
  
    // Кнопки
    button: { 
      marginTop: '20px', 
      width: '100%',
      padding: '12px', 
      backgroundColor: '#2563eb', 
      color: '#fff', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer',
      fontWeight: '600'
    },
  
    linkButton: { 
      color: '#2563eb', 
      border: 'none', 
      background: 'none', 
      cursor: 'pointer', 
      textDecoration: 'underline', 
      padding: '5px 0',
      fontSize: '0.9rem'
    },
  
    // ТО САМОЕ МЕСТО, ГДЕ БЫЛА ОШИБКА (backgroundColor исправлен)
    commentStatus: { 
      fontSize: '0.85rem', 
      marginTop: '10px', 
      padding: '10px', 
      borderRadius: '8px', 
      backgroundColor: '#f1f5f9', 
      color: '#475569', 
      fontStyle: 'italic',
      borderLeft: '3px solid #cbd5e1'
    },
  
    // Модалка
    overlay: { 
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(15, 23, 42, 0.75)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
  
    modal: { 
      background: '#fff', 
      padding: '30px', 
      borderRadius: '20px', 
      width: '90%', 
      maxWidth: '550px'
    },
  
    textarea: { 
      width: '100%', 
      height: '120px', 
      borderRadius: '10px', 
      padding: '12px', 
      border: '1px solid #cbd5e1', 
      boxSizing: 'border-box',
      marginTop: '10px',
      fontSize: '1rem',
      resize: 'none'
    },
  
    saveButton: { 
      flex: 2, 
      padding: '12px', 
      backgroundColor: '#10b981', 
      color: '#fff', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    
    cancelButton: { 
      flex: 1, 
      padding: '12px', 
      backgroundColor: '#f1f5f9', 
      color: '#64748b', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer'
    },
  
    oldComment: {
      backgroundColor: '#f8fafc',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '0.9rem',
      border: '1px dashed #e2e8f0'
    }
  };