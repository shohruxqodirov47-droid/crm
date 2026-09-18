import React from 'react';

function KanbanBoard({ customers, onUpdateStatus }) {
  const columns = [
    { id: 'new', title: 'Yangi buyurtma', color: 'bg-blue-600', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20' },
    { id: 'progress', title: 'Yetkazilmoqda', color: 'bg-amber-600', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20' },
    { id: 'sold', title: 'Sotildi (To\'landi)', color: 'bg-green-600', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20' },
    { id: 'cancelled', title: 'Qaytarildi', color: 'bg-red-600', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20' }
  ];

  const formatMoney = (amount) => Number(amount || 0).toLocaleString('uz-UZ') + " so'm";

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 items-start">
      {columns.map(col => {
        const columnCustomers = customers.filter(c => c.status === col.id);
        
        return (
          <div key={col.id} className={`flex-shrink-0 w-80 rounded-lg border border-gray-200 dark:border-gray-700 ${col.bg} ${col.darkBg} dark:bg-gray-900/50 p-4 transition-colors`}>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${col.color}`}></div>{col.title}
              </h3>
              <span className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium px-2 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">{columnCustomers.length}</span>
            </div>

            <div className="flex flex-col gap-3">
              {columnCustomers.map(c => {
                const price = Number(c.price || 0);
                const paid = Number(c.paid || 0);
                const debt = price - paid;
                
                return (
                <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:-translate-y-1 group">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{c.name}</h4>
                  
                  {c.product && (
                    <div className="flex items-center text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md mb-2 border border-gray-100 dark:border-gray-700">
                      <svg className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      {c.product}
                    </div>
                  )}
                  
                  <div className="mb-3 space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 flex justify-between"><span>Jami summa:</span> <span>{formatMoney(price)}</span></p>
                    <p className="text-xs font-medium text-green-600 dark:text-green-500 flex justify-between"><span>To'ladi:</span> <span>{formatMoney(paid)}</span></p>
                    {debt > 0 && <p className="text-xs font-medium text-red-600 dark:text-red-500 flex justify-between border-t border-gray-100 dark:border-gray-700 pt-1 mt-1"><span>Qarz qoldi:</span> <span>{formatMoney(debt)}</span></p>}
                  </div>
                  
                  <select value={c.status} onChange={(e) => onUpdateStatus(c.id, e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white text-xs font-medium rounded-md px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors">
                    <option value="new">Yangi buyurtma ga o'tkazish</option>
                    <option value="progress">Yetkazilmoqda ga o'tkazish</option>
                    <option value="sold">Sotildi ga o'tkazish</option>
                    <option value="cancelled">Qaytarildi ga o'tkazish</option>
                  </select>
                </div>
              )})}
              {columnCustomers.length === 0 && <div className="text-center py-6 bg-white/50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"><p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Bo'sh</p></div>}
            </div>
          </div>
        )
      })}
    </div>
  );
}

export default KanbanBoard;
