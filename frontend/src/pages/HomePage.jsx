// src/pages/HomePage.jsx
import { useState, useRef } from 'react';
import Login from './Login';
import './HomePage.css';

const BG_URL = "https://static.codia.ai/s/image_dcafa951-1c85-40a2-bcf2-9096e96a5224.png";

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const authRef = useRef(null);

  // Открываем модалку авторизации и плавно скроллим к ней
  const handleOpenAuth = () => {
    setShowAuth(true);
    setTimeout(() => {
      authRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Закрытие секции авторизации
  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  return (
    <div className="home-container">
      <div className="app-shell">
        <div className="scroll-content">
          <div className="body-root" style={{ backgroundImage: `url(${BG_URL})` }}>
            <div className="logo-bar">
              <span className="logo-progress">Progress</span>
              <span className="logo-hub">Hub</span>
            </div>

            <div className="hero-content" style={{ textAlign: 'center' }}>
              <h1 className="heading-track">Track Your</h1>
              <h1 className="heading-fitness">Fitness Progress</h1>
              <p className="subtitle">
                Управляй тренировками, следи за прогрессом <br />
                и достигай своих целей вместе с нами!
              </p>
              <button onClick={handleOpenAuth} className="cta-btn">
                Войти в систему
              </button>
            </div>

            {showAuth && (
              <div ref={authRef} className="auth-section">
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Авторизация</h2>
                <Login />
                <button
                  onClick={handleCloseAuth}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    marginTop: '10px',
                    color: '#666',
                    cursor: 'pointer'
                  }}
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}