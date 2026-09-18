import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ onLogout, theme, setTheme }) {
  const location = useLocation();
  
  const navItems = [
    { name: 'Umumiy Holat', path: '/', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Mijozlar (Qarzlar)', path: '/customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Xarajatlar', path: '/expenses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Valyuta Konvertori', path: '/currency', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  ];

  return (
    <div className="w-64 bg-brand-navy text-gray-400 min-h-screen flex flex-col border-r border-white/10 transition-colors duration-300">
      
      <div className="h-20 flex items-center justify-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-brand-orange rounded-sm flex items-center justify-center">
          </div>
          <h2 className="text-xl font-semibold text-white">CRM PRO</h2>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase mb-4">Menyu</p>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-300 text-sm font-medium group hover:translate-x-1
                ${isActive 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'hover:bg-white/10 hover:text-gray-200'
                }
              `}
            >
              <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
              </svg>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/10 space-y-3">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Light Mode
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dark Mode
            </>
          )}
        </button>

        <button 
          onClick={onLogout} 
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-brand-orange text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Chiqish
        </button>
      </div>

      {/* User Profile Block */}
      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-medium shadow-sm">
          A
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-white truncate">Administrator</p>
          <p className="text-xs text-gray-400 truncate">admin@example.com</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
