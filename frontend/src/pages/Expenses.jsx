import React, { useState, useEffect } from 'react';
import { authFetch } from '../config';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', amount: '' });

  useEffect(() => {
    authFetch('/api/expenses')
      .then(res => res.json())
      .then(data => { setExpenses(data.data || []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    authFetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify({ title: formData.title, amount: Number(formData.amount) })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        setExpenses([data.data, ...expenses]);
        setFormData({ title: '', amount: '' });
      }
    })
    .catch(err => console.error('Xarajat qo\'shishda xatolik:', err));
  };

  const handleDelete = (id) => {
    if(window.confirm("Bu xarajatni o'chirasizmi?")) {
      authFetch(`/api/expenses/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if(data.message === 'success') setExpenses(expenses.filter(e => e.id !== id));
      })
      .catch(err => console.error('O\'chirishda xatolik:', err));
    }
  };

  const formatMoney = (amount) => Number(amount).toLocaleString('uz-UZ') + " so'm";
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-slide-up">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Kirim-Chiqim (Xarajatlar)</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sizning umumiy xarajatlaringiz: <span className="font-semibold text-red-600">{formatMoney(totalExpense)}</span></p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-sm transition-shadow duration-200 border border-gray-200 dark:border-gray-700 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nima uchun xarajat? (Ijara, Oylik...)</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Masalan: Ijara puli" required />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summasi qancha?</label>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="500000" required />
          </div>
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors active:scale-95 transition-transform w-full md:w-auto">
            Chiqim qilish
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-sm transition-shadow duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p> : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3">Xarajat nomi</th>
                <th className="px-4 py-3">Summa</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3 text-right">O'chirish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {expenses.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Hech qanday xarajat yo'q</td></tr>}
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{e.title}</td>
                  <td className="px-4 py-3 text-sm font-medium text-red-600">-{formatMoney(e.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{e.created_at ? new Date(e.created_at.includes(' ') ? e.created_at.replace(' ', 'T') + 'Z' : e.created_at).toLocaleDateString('uz-UZ') : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(e.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Expenses;
