import React from 'react';

export default function Header() {
  return (
    <header className="bg-white dark:bg-brand-navy border-b border-gray-200 dark:border-white/10 h-16 flex items-center justify-between px-6 transition-colors duration-300 shrink-0">
      <div className="flex items-center flex-1">
        <button className="lg:hidden text-gray-500 hover:text-brand-navy dark:hover:text-white mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-brand-navy dark:text-white">CRM PRO</h1>
          <span className="text-xs text-gray-400 hidden md:inline">Boshqaruv paneli</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-brand-blue flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-colors">
            A
          </div>
          <div className="hidden md:flex md:flex-col md:items-start">
             <span className="text-sm font-medium text-brand-navy dark:text-gray-200">Administrator</span>
             <span className="text-xs text-gray-400">Tizim boshqaruvchisi</span>
          </div>
        </div>
      </div>
    </header>
  );
}
