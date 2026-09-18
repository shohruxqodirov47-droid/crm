import React, { useState, useEffect } from 'react';
import { authFetch } from '../config';

function CustomerModal({ customer, onClose }) {
  const [notes, setNotes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  
  const [newNote, setNewNote] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [purchaseProduct, setPurchaseProduct] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchasePaid, setPurchasePaid] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases', 'payments' or 'notes'

  useEffect(() => {
    // Ma'lumotlarni parallel yuklash
    Promise.all([
      authFetch(`/api/notes/${customer.id}`).then(res => res.json()),
      authFetch(`/api/payments/${customer.id}`).then(res => res.json()),
      authFetch(`/api/purchases/${customer.id}`).then(res => res.json())
    ]).then(([notesData, paymentsData, purchasesData]) => {
        setNotes(notesData.data || []);
        setPayments(paymentsData.data || []);
        setPurchases(purchasesData.data || []);
        setLoading(false);
    }).catch(err => {
        console.error(err);
        setLoading(false);
    });
  }, [customer.id]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if(!newNote) return;
    authFetch(`/api/notes/${customer.id}`, {
      method: 'POST',
      body: JSON.stringify({ content: newNote })
    })
    .then(res => res.json())
    .then(data => {
      if(data.message === 'success') {
        setNotes([data.data, ...notes]);
        setNewNote('');
      }
    })
    .catch(err => console.error(err));
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return alert("To'g'ri summa kiriting!");

    authFetch(`/api/payments/${customer.id}`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    })
    .then(res => res.json())
    .then(data => {
      if(data.message === 'success') {
        setPayments([data.data, ...payments]);
        setPaymentAmount('');
      }
    })
    .catch(err => console.error(err));
  };

  const handleAddPurchase = (e) => {
    e.preventDefault();
    const price = Number(purchasePrice) || 0;
    const paid = Number(purchasePaid) || 0;
    
    if (price === 0 && paid === 0 && !purchaseProduct.trim()) {
       return alert("Iltimos, kamida bitta ma'lumot (mahsulot nomi, qarz yoki to'lov) kiriting!");
    }

    authFetch(`/api/purchases/${customer.id}`, {
      method: 'POST',
      body: JSON.stringify({ product: purchaseProduct, price, paid })
    })
    .then(res => res.json())
    .then(data => {
      if(data.message === 'success') {
        // Yangi backend formati
        if (data.data.purchase) setPurchases([data.data.purchase, ...purchases]);
        if (data.data.payment) setPayments([data.data.payment, ...payments]);
        
        // Eski backend formati (agar backend restart qilinmagan bo'lsa)
        if (!data.data.purchase && data.data.id) setPurchases([data.data, ...purchases]);

        setPurchaseProduct('');
        setPurchasePrice('');
        setPurchasePaid('');
      } else {
        alert("Xato: " + (data.error || "Noma'lum xatolik yuz berdi"));
      }
    })
    .catch(err => alert("Tarmoq xatosi (Backend o'chiq bo'lishi mumkin): " + err.message));
  };

  const handleDeletePurchase = (id) => {
    if(!window.confirm("Bu savdoni o'chirasizmi?")) return;
    authFetch(`/api/purchases/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
       if (data.message === 'success') {
           setPurchases(purchases.filter(p => p.id !== id));
       }
    }).catch(err => console.error(err));
  };

  const handleDeletePayment = (id) => {
    if(!window.confirm("Bu to'lovni bekor qilib o'chirasizmi?")) return;
    authFetch(`/api/payments/${id}`, { method: 'DELETE' })
    .then(async res => {
        if (!res.ok) throw new Error("Backend serverida o'chirish yo'li topilmadi (404). Backend restart qilinmagan!");
        return res.json();
    })
    .then(data => {
       if (data.message === 'success') {
           setPayments(payments.filter(p => p.id !== id));
       } else {
           alert("Xato: " + data.error);
       }
    }).catch(err => alert("O'chirish amalga oshmadi: " + err.message + "\n\nIltimos, Qora oynani (Backend) yopib, qaytadan 'npm run dev' qilib yoqing!"));
  };

  const formatMoney = (amount) => Number(amount).toLocaleString('uz-UZ') + " so'm";
  
  // Haqiqiy qoldiqni hisoblash
  const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.price), 0);
  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const debt = totalPurchases > totalPayments ? totalPurchases - totalPayments : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-3xl h-[85vh] flex flex-col border border-gray-100 dark:border-gray-700 transition-colors">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {customer.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-8">{customer.phone}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Real-time Balances */}
        <div className="p-6 grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Jami Savdolar</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatMoney(totalPurchases)}</div>
           </div>
           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Jami To'langan</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{formatMoney(totalPayments)}</div>
           </div>
           <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${debt > 0 ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Qolgan Qarz</div>
              <div className={`text-xl font-bold ${debt > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>{formatMoney(debt)}</div>
           </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0 px-2">
           <button 
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'purchases' ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
           >
              Xaridlar Tarixi
           </button>
           <button 
              onClick={() => setActiveTab('payments')}
              className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'payments' ? 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
           >
              To'lovlar Tarixi
           </button>
           <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'notes' ? 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
           >
              Izohlar
           </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30 dark:bg-gray-900/30">
          {loading ? (
             <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : activeTab === 'purchases' ? (
             <div className="animate-fade-in max-w-2xl mx-auto">
                <form onSubmit={handleAddPurchase} className="mb-8 bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Yangi xarid (savdo) qo'shish
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mahsulot nomi yoki izoh</label>
                      <input 
                        type="text" 
                        value={purchaseProduct}
                        onChange={(e) => setPurchaseProduct(e.target.value)}
                        placeholder="Masalan: 2 qop sement" 
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Jami Summa (qarz)</label>
                      <input 
                        type="number" 
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="0" 
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To'ladi (Naqd)</label>
                      <input 
                        type="number" 
                        value={purchasePaid}
                        onChange={(e) => setPurchasePaid(e.target.value)}
                        placeholder="Bo'lsa kiriting" 
                        className="w-full bg-green-50/30 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none placeholder:text-green-600/50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                        + Qo'shish
                      </button>
                    </div>
                  </div>
                </form>

                <div className="space-y-3">
                  {purchases.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">Hali xaridlar yo'q</div>
                  ) : (
                    purchases.map(p => (
                      <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm hover:shadow transition-shadow">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                           </div>
                           <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{p.product || 'Nomsiz xarid'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(p.created_at).toLocaleString('uz-UZ')}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="font-bold text-gray-900 dark:text-gray-100">{formatMoney(p.price)}</div>
                           <button onClick={() => handleDeletePurchase(p.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          ) : activeTab === 'payments' ? (
             <div className="animate-fade-in max-w-2xl mx-auto">
                <form onSubmit={handleAddPayment} className="mb-8 bg-green-50/50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-800 shadow-sm">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Yangi to'lov qabul qilish
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To'lov summasi (so'm)</label>
                      <input 
                        type="number" 
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0" 
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                      + Qabul qilish
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">Hali to'lovlar qilinmagan</div>
                  ) : (
                    payments.map(p => (
                      <div key={p.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           </div>
                           <div>
                              <div className="font-bold text-green-600 dark:text-green-400">+{formatMoney(p.amount)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(p.created_at).toLocaleString('uz-UZ')}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <button onClick={() => handleDeletePayment(p.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="To'lovni o'chirish">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          ) : (
             <div className="animate-fade-in max-w-2xl mx-auto">
                <form onSubmit={handleAddNote} className="mb-8 bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
                  <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Yangi izoh yozish
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Izoh matni</label>
                      <input 
                        type="text" 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Mijoz haqida eslatma yoki qo'shimcha ma'lumot..." 
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm">
                      + Saqlash
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">Izohlar yo'q</div>
                  ) : (
                    notes.map(note => (
                      <div key={note.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-sm text-gray-900 dark:text-gray-200">{note.content}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">{new Date(note.created_at).toLocaleString('uz-UZ')}</span>
                      </div>
                    ))
                  )}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerModal;
