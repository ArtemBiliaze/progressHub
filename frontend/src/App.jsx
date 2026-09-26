import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import HomePage from './pages/HomePage'; // <-- ДОБАВЛЕН ИМПОРТ НОВОЙ СТРАНИЦЫ
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import SendReport from './pages/SendReport'; 
import Schedule from './pages/Schedule';

function App() {
  const token = localStorage.getItem('token');
  let userRole = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch  {
      localStorage.removeItem('token');
    }
  }

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // <-- ИЗМЕНЕНО: при выходе кидаем на главную (обложку)
  };

  return (
    <Router>
      {/* Убрали жесткие padding для контейнера, чтобы обложка могла занять 100% ширины */}
      <div
  style={{
    width: '100%',
    maxWidth: token ? '900px' : '100%',
    margin: '0 auto',
    padding: token ? '20px' : '0',
    boxSizing: 'border-box'
  }}
>
        
        {/* Меню показываем ТОЛЬКО если пользователь авторизован */}
        {token && (
          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/" style={{ fontWeight: 'bold', color: '#2563eb', textDecoration: 'none' }}>ProgressHub 🛡️</Link>
              <>
                <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Дашборд</Link>
                
                {/* УСЛОВНАЯ ССЫЛКА В МЕНЮ */}
                {userRole === 'COACH' ? (
                  <Link to="/reports" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Входящие отчеты</Link>
                ) : (
                  <Link to="/send-report" style={{ textDecoration: 'none', color: '#333' }}>Отправить отчет</Link>
                )}
                
                <Link to="/schedule" style={{ textDecoration: 'none', color: '#333' }}>Расписание</Link>
              </>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <b style={{ color: userRole === 'COACH' ? '#d97706' : '#059669' }}>
                  {userRole === 'COACH' ? '👨‍🏫 ТРЕНЕР' : '💪 КЛИЕНТ'}
                </b>
                <button onClick={logout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Выйти</button>
              </div>
            </div>
          </nav>
        )}

        <Routes>
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
          
          {/* ИЗМЕНЕННАЯ СТРОЧКА: Если токена нет, показываем HomePage (обложку) вместо редиректа на /login */}
          <Route path="/" element={token ? <Dashboard /> : <HomePage />} />
          
          {/* РАЗДЕЛЯЕМ РОУТЫ */}
          <Route 
            path="/reports" 
            element={token && userRole === 'COACH' ? <Reports /> : <Navigate to="/" />} 
          />
          <Route 
            path="/send-report" 
            element={token && userRole === 'CLIENT' ? <SendReport /> : <Navigate to="/" />} 
          />
          
          <Route path="/schedule" element={token ? <Schedule /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;