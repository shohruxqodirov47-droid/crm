import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Expenses from './pages/Expenses';
import Login from './pages/Login';
import CurrencyConverter from './pages/CurrencyConverter';

// JWT tokenni decode qilish (base64)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Token yaroqliligini tekshirish
function isTokenValid(token) {
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;
  // Token muddati tugaganmi tekshirish (1 daqiqa zaxira)
  return decoded.exp * 1000 > Date.now() + 60000;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (token && isTokenValid(token)) {
      setIsAuthenticated(true);
    } else if (token) {
      // Token bor lekin muddati tugagan
      localStorage.removeItem('crm_token');
      setIsAuthenticated(false);
    }
  }, []);

  // Tokenni har 1 daqiqada tekshirish
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      const token = localStorage.getItem('crm_token');
      if (!isTokenValid(token)) {
        localStorage.removeItem('crm_token');
        setIsAuthenticated(false);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return (
    <BrowserRouter>
      <div className="flex bg-brand-bg dark:bg-brand-navy transition-colors duration-300 min-h-screen font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
        
        <Sidebar onLogout={handleLogout} theme={theme} setTheme={setTheme} />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/currency" element={<CurrencyConverter />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;
