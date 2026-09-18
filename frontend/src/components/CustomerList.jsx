import React from 'react';
import { authFetch } from '../config';

function CustomerList({ customers, onDelete, onUpdate, onViewInfo, onEdit }) {
  const handleDelete = (id, name) => {
    if(window.confirm(`${name} ni ro'yxatdan butunlay o'chirmoqchimisiz?`)) {
      authFetch(`/api/customers/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => { if(data.message === 'success') onDelete(id); })
      .catch(err => console.error(err));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    authFetch(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => { if(data.message === 'success') onUpdate(id, newStatus); })
    .catch(err => console.error(err));
  };

  const formatMoney = (amount) => Number(amount).toLocaleString('uz-UZ') + " so'm";
  
  // Holatlarni o'zbekchalash uchun lug'at
  const statusLabels = {
    'new': 'Qarzi bor',
    'progress': 'Jarayonda',
    'sold': "To'liq to'lagan",
    'cancelled': 'Bekor qilingan'
  };

  return (
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50 sticky top-0">
        <tr>
          <th className="px-6 py-3 font-medium">Mijoz / Aloqa</th>
          <th className="px-6 py-3 font-medium">Mahsulot</th>
          <th className="px-6 py-3 font-medium">Hisob-kitob (Jami)</th>
          <th className="px-6 py-3 font-medium">Holat</th>
          <th className="px-6 py-3 font-medium text-right">Amallar</th>
        </tr>
      </thead>
      <tbody>
        {customers.length === 0 ? (
          <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Mijozlar topilmadi</td></tr>
        ) : (
          customers.map(c => {
            const price = Number(c.price || 0);
            const paid = Number(c.paid || 0);
            const debt = price > paid ? price - paid : 0;
            const cleanPhone = c.phone.replace(/\D/g, '');
            const tmeLink = cleanPhone ? `https://t.me/+${cleanPhone}` : '#';
            const callLink = cleanPhone ? `tel:+${cleanPhone}` : '#';

            return (
              <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">{c.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{c.phone}</span>
                    <a href={tmeLink} target="_blank" rel="noreferrer" title="Telegramdan yozish" className="text-blue-500 hover:text-blue-600">
                       <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.12.03-1.99 1.26-5.61 3.71-.53.37-1.01.55-1.44.54-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.41-1.43-.87.03-.23.33-.47.9-.73 3.53-1.54 5.88-2.55 7.05-3.04 3.35-1.41 4.05-1.65 4.51-1.66.1 0 .33.02.45.1.11.07.14.17.16.24.01.07.02.16.01.25z"/></svg>
                    </a>
                    <a href={callLink} title="Qo'ng'iroq qilish" className="text-green-500 hover:text-green-600">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 dark:text-gray-200 line-clamp-2 max-w-xs">{c.product || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                     <div className="flex justify-between gap-4"><span className="text-gray-500 dark:text-gray-400">Jami:</span> <span className="font-medium text-gray-900 dark:text-gray-200">{formatMoney(price)}</span></div>
                     <div className="flex justify-between gap-4"><span className="text-gray-500 dark:text-gray-400">To'ladi:</span> <span className="font-medium text-green-600 dark:text-green-400">{formatMoney(paid)}</span></div>
                     <div className="flex justify-between gap-4 border-t border-gray-100 dark:border-gray-700 pt-1 mt-1">
                        <span className="text-gray-500 dark:text-gray-400">Qarz:</span> 
                        <span className={`font-semibold ${debt > 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{formatMoney(debt)}</span>
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="new">{statusLabels['new']}</option>
                    <option value="progress">{statusLabels['progress']}</option>
                    <option value="sold">{statusLabels['sold']}</option>
                    <option value="cancelled">{statusLabels['cancelled']}</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onViewInfo(c)}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-medium transition-colors"
                      title="Mijozning shaxsiy daftari"
                    >
                      Daftarni Ochish
                    </button>
                    <button 
                      onClick={() => onEdit(c)}
                      className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-100 dark:hover:bg-orange-900/50 text-xs font-medium transition-colors"
                      title="Ma'lumotlarni tahrirlash"
                    >
                      Tahrirlash
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id, c.name)}
                      className="px-2 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-medium transition-colors"
                    >
                      O'chirish
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

export default CustomerList;
