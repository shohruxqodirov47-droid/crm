import React, { useState } from 'react';
import { authFetch } from '../config';

function AddCustomer({ onAdd }) {
  const [formData, setFormData] = useState({ name: '', phone: '', product: '', price: '', paid: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert("Ism va telefon kiritilishi shart!");
    
    setLoading(true);
    authFetch('/api/customers', {
      method: 'POST',
      body: JSON.stringify({ 
        ...formData, 
        price: Number(formData.price) || 0,
        paid: Number(formData.paid) || 0 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
        onAdd(data.data);
        setFormData({ name: '', phone: '', product: '', price: '', paid: '' });
      } else {
        alert("Saqlashda xatolik: " + JSON.stringify(data));
      }
      setLoading(false);
    })
    .catch(err => { 
      console.error(err); 
      alert("Tarmoq xatosi yoki server ishlamayapti: " + err.message);
      setLoading(false); 
    });
  };

  return (
    <div className="animate-slide-up">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-5">Yangi buyurtma (Sotuv) qo'shish</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mijoz Ismi *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ali Valiyev" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon *</label>
          <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="+998 90 123 4567" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mahsulot</label>
          <input type="text" value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="MacBook Pro" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jami Summa (qarz)</label>
          <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm dark:text-white dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="15000000" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-green-700 dark:text-green-500 mb-1">To'ladi (Naqd)</label>
          <input type="number" value={formData.paid} onChange={(e) => setFormData({...formData, paid: e.target.value})} className="w-full bg-green-50 dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-md px-3 py-2 text-sm text-green-800 dark:text-green-400 dark:placeholder-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Bo'lsa kiriting" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors active:scale-95 transition-transform flex justify-center items-center gap-2">
          {loading ? 'Kuting...' : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Qo'shish</>
          )}
        </button>
      </form>
    </div>
  );
}

export default AddCustomer;
