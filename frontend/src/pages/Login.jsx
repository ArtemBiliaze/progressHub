import { useState } from 'react';
import api from '../api';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('CLIENT');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoginMode) {
      // ===== ЛОГИКА ВХОДА =====
      try {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        window.location.href = '/'; 
      } catch (error) {
        alert('❌ Ошибка входа: ' + (error.response?.data?.error || 'Неверные данные'));
      }
    } else {
      // ===== ЛОГИКА РЕГИСТРАЦИИ =====
      try {
        await api.post('/auth/register', { email, password, name, role });
        alert('✅ Успешная регистрация! Теперь войди со своими данными.');
        setIsLoginMode(true); 
        setPassword('');      
      } catch (error) {
        alert('❌ Ошибка регистрации: ' + (error.response?.data?.error || 'Попробуй другой email'));
      }
    }
  };

  return (
    // Убрали margin, border и boxShadow, чтобы форма органично смотрелась внутри HomePage
    <div style={{ width: '100%' }}> 
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {!isLoginMode && (
          <>
            <input 
              type="text" 
              placeholder="Как к тебе обращаться?" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required={!isLoginMode} 
              style={styles.input} 
            />
            
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ ...styles.input, backgroundColor: '#f9fafb', cursor: 'pointer' }}
            >
              <option value="CLIENT">💪 Я Клиент</option>
              <option value="COACH">👨‍🏫 Я Тренер</option>
            </select>
          </>
        )}

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={styles.input} 
        />
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={styles.input} 
        />

        <button 
          type="submit" 
          style={{ 
            padding: '14px', 
            backgroundColor: isLoginMode ? '#2563eb' : '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            marginTop: '10px',
            transition: 'background 0.2s'
          }}
        >
          {isLoginMode ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={() => setIsLoginMode(!isLoginMode)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#64748b', 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontSize: '0.95rem'
          }}
        >
          {isLoginMode ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
}

// Вынес инпуты в отдельный объект, чтобы не дублировать код
const styles = {
  input: {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    outlineColor: '#2563eb',
    width: '100%',
    boxSizing: 'border-box'
  }
};