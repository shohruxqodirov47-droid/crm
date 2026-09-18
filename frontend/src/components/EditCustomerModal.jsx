import React, { useState } from 'react';
import { authFetch } from '../config';

function EditCustomerModal({ customer, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: customer.name,
    phone: customer.phone,
    product: customer.product || '',
    price: customer.price || 0,
    paid: customer.paid || 0,
    status: customer.status || 'new'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    authFetch(`/api/customers/${customer.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...formData,
        price: Number(formData.price),
        paid: Number(formData.paid)
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'success') {
         onUpdated();
      } else {
         alert("Xatolik: " + data.error);
         setLoading(false);
      }
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mijozni Tahrirlash</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ism</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
            <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mahsulot</label>
            <input name="product" value={formData.product} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jami Summa</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To'landi</label>
              <input type="number" name="paid" value={formData.paid} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Bekor qilish</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              {loading ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomerModal;
