import React, { useState, useEffect } from 'react';
import { authFetch } from '../config';
import CustomerList from '../components/CustomerList';
import AddCustomer from '../components/AddCustomer';
import CustomerModal from '../components/CustomerModal';
import EditCustomerModal from '../components/EditCustomerModal';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = () => {
    authFetch('/api/customers')
      .then(res => res.json())
      .then(data => { setCustomers(data.data || []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCustomerAdded = (newCustomer) => {
    setCustomers([newCustomer, ...customers]);
    setIsAdding(false);
  };

  const handleCustomerDeleted = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const handleCustomerUpdated = (id, newStatus) => {
    // Soddalashtirilgan holat uchun listni qayta yuklash kifoya qiladi (chunki to'lovlar ham bo'lishi mumkin)
    fetchCustomers();
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const exportToCSV = () => {
    const csvEscape = (val) => {
      const str = String(val || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    
    let csvContent = "\uFEFF"; 
    csvContent += "Ism,Telefon,Mahsulot,Jami Summa,To'landi,Qarz,Holat,Sana\n";
    filteredCustomers.forEach(c => {
      let price = Number(c.price || 0);
      let paid = Number(c.paid || 0);
      let debt = price > paid ? price - paid : 0;
      let row = [
        csvEscape(c.name),
        csvEscape(c.phone),
        csvEscape(c.product || ''),
        price,
        paid,
        debt,
        csvEscape(c.status),
        c.created_at ? c.created_at.substring(0,10) : ''
      ].join(',');
      csvContent += row + "\n";
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "qarzlar_va_buyurtmalar.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in h-full flex flex-col pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mijozlar va Qarzlar</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Barcha mijozlar, qarzlar va to'lovlarni boshqarish</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Excel (CSV)
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isAdding ? 'Bekor qilish' : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Yangi Qo'shish</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yangi Mijoz / Qarz Qo'shish</h3>
          <AddCustomer onAdd={handleCustomerAdded} />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Ism yoki telefon orqali qidirish..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <CustomerList 
              customers={filteredCustomers} 
              onDelete={handleCustomerDeleted} 
              onUpdate={handleCustomerUpdated}
              onViewInfo={setSelectedCustomer}
              onEdit={setEditingCustomer}
            />
          )}
        </div>
      </div>

      {selectedCustomer && (
        <CustomerModal 
          customer={selectedCustomer} 
          onClose={() => {
              setSelectedCustomer(null);
              fetchCustomers(); // Yopilganda ro'yxatni yangilaymiz
          }} 
        />
      )}

      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onUpdated={() => {
            setEditingCustomer(null);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
}

export default Customers;
