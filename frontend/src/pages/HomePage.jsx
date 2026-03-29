import { useState, useRef } from 'react';
import Login from './Login'; // Импортируем твой существующий компонент входа

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const authRef = useRef(null);

  const handleGetStarted = () => {
    setShowAuth(true);
    // Плавно скроллим к форме через долю секунды, чтобы анимация появления сработала
    setTimeout(() => {
      authRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={styles.container}>
      {/* ГЕРОЙ-СЕКЦИЯ (HERO SECTION) */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>Проект ProgressHub 🛡️</div>
          <h1 style={styles.title}>Достигай целей <br /> <span style={styles.highlight}>вместе с наставником</span></h1>
          <p style={styles.subtitle}>
            Единая платформа для тренеров и клиентов. Удобное расписание, <br />
            ежедневные отчеты о прогрессе и прямая связь с экспертом.
          </p>
          
          {!showAuth && (
            <button onClick={handleGetStarted} style={styles.ctaButton}>
              Начать путь к результату →
            </button>
          )}
        </div>
      </section>

      {/* ФУНКЦИИ (Кратко) */}
      {!showAuth && (
        <section style={styles.features}>
          <div style={styles.featureCard}>
            <h3>💪 Клиентам</h3>
            <p>Отправляй вес, шаги и получай разбор от тренера.</p>
          </div>
          <div style={styles.featureCard}>
            <h3>👨‍🏫 Тренерам</h3>
            <p>Управляй базой клиентов, следи за их динамикой и веди запись.</p>
          </div>
        </section>
      )}

      {/* БЛОК АВТОРИЗАЦИИ (Появляется по клику) */}
      {showAuth && (
        <div ref={authRef} style={styles.authWrapper}>
          <div style={styles.authContainer}>
            <h2 style={styles.authTitle}>Вход в систему</h2>
            <p style={styles.authSubtitle}>Залогинься как тренер или клиент, чтобы продолжить.</p>
            <Login /> {/* Вставляем твой компонент */}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    fontFamily: '"Inter", sans-serif', 
    color: '#1e293b', 
    backgroundColor: '#f8fafc', 
    minHeight: '100vh' 
  },
  hero: {
    padding: '80px 20px',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #fff 100%)',
    textAlign: 'center',
    borderRadius: '0 0 30px 30px',
    borderBottom: '1px solid #e2e8f0'
  },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    color: '#2563eb',
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '20px',
    border: '1px solid #e2e8f0'
  },
  title: { 
    fontSize: '3.2rem', 
    lineHeight: '1.1', 
    margin: '0 0 20px 0', 
    color: '#0f172a',
    fontWeight: '800'
  },
  highlight: { color: '#2563eb' },
  subtitle: { 
    fontSize: '1.2rem', 
    color: '#64748b', 
    lineHeight: '1.6', 
    marginBottom: '40px' 
  },
  ctaButton: {
    padding: '16px 32px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s ease',
    ':hover': { backgroundColor: '#1d4ed8' } // Помни, что inline style не поддерживает :hover, это для понимания
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    maxWidth: '900px',
    margin: '-40px auto 60px auto',
    padding: '0 20px'
  },
  featureCard: {
    background: '#fff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
    textAlign: 'center'
  },
  // Стили для блока авторизации
  authWrapper: {
    padding: '60px 20px',
    opacity: 0, 
    animation: 'fadeIn 0.5s forwards', // Анимация появления
    '@keyframes fadeIn': { to: { opacity: 1 } }
  },
  authContainer: {
    maxWidth: '450px',
    margin: '0 auto',
    background: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  },
  authTitle: { margin: '0 0 10px 0', fontSize: '1.8rem', color: '#1e293b' },
  authSubtitle: { color: '#64748b', marginBottom: '30px', fontSize: '0.95rem' }
};