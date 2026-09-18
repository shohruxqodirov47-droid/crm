import React, { useState, useEffect } from 'react';
import { authFetch } from '../config';

function Dashboard() {
  const [stats, setStats] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/api/customers').then(res => res.json()),
      authFetch('/api/expenses').then(res => res.json())
    ]).then(([custData, expData]) => {
         const customersList = custData.data || [];
         const expensesList = expData.data || [];
         setCustomers(customersList);
         setExpenses(expensesList);
         
         const totalIncome = customersList.reduce((sum, c) => sum + Number(c.paid || 0), 0);
         const totalDebt = customersList.reduce((sum, c) => {
             const price = Number(c.price || 0);
             const paid = Number(c.paid || 0);
             return sum + (price > paid ? price - paid : 0);
         }, 0);
         
         const todayStr = new Date().toISOString().split('T')[0];
         
         // Bugungi to'lovlarni hisoblash (hozircha to'lovlar jadvalisiz, umumiy tushumning o'sishi orqali yoki faqat yangi mijozlarning to'laganidan olinadi - aslida to'lovlar API chaqirish ham mumkin)
         // Soddalik uchun hozircha kunlik yangi qarz va savdoni hisoblaymiz.
         const todayCustomers = customersList.filter(c => c.created_at && c.created_at.startsWith(todayStr));
         const todaySales = todayCustomers.reduce((sum, c) => sum + Number(c.price || 0), 0);

         const todayExpenses = expensesList
            .filter(e => e.created_at && e.created_at.startsWith(todayStr) && e.type === 'expense')
            .reduce((sum, e) => sum + Number(e.amount), 0);

         setStats([
            { label: "Jami Tushum", value: totalIncome, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Olinishi kerak (Qarzlar)", value: totalDebt, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Bugungi Savdo", value: todaySales, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
            { label: "Bugungi Xarajat", value: todayExpenses, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" }
         ]);
         
         setLoading(false);
    }).catch(err => {
         console.error(err);
         setLoading(false);
    });
  }, []);

  const formatMoney = (amount) => Number(amount).toLocaleString('uz-UZ') + " so'm";

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="animate-fade-in pb-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-navy dark:text-white">Umumiy Holat</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Biznesingizning joriy holati va moliyaviy ko'rsatkichlar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/5 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/10 transition-colors">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</h3>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{formatMoney(stat.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 p-6 transition-colors">
          <h3 className="text-lg font-semibold text-brand-navy dark:text-white mb-4">Tezkor Ma'lumotlar</h3>
          <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300">
             <p>Jami ro'yxatdan o'tgan mijozlar soni: <span className="font-bold text-brand-navy dark:text-white">{customers.length}</span> ta</p>
             <p>Jami qayd etilgan xarajatlar: <span className="font-bold text-brand-navy dark:text-white">{expenses.length}</span> ta</p>
          </div>
      </div>
    </div>
  );
}

export default Dashboard;
