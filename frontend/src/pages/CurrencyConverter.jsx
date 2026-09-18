import React, { useState, useEffect, useCallback } from 'react';
import CurrencySelectModal, { CURRENCIES } from '../components/CurrencySelectModal';

const DEFAULT_CURRENCIES = ['UZS', 'USD', 'EUR'];

function getCurrencyInfo(code) {
  return CURRENCIES.find(c => c.code === code) || { code, name: code, flag: '🏳️' };
}

function CurrencyConverter() {
  const [activeCurrencies, setActiveCurrencies] = useState(
    DEFAULT_CURRENCIES.map(code => ({ code, value: '' }))
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [rates, setRates] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetIndex, setModalTargetIndex] = useState(null);

  // Fetch exchange rates
  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data.result === 'success') {
        setRates(data.rates);
        setLastUpdate(new Date(data.time_last_update_utc));
      } else {
        setError('Kurslarni olishda xatolik yuz berdi');
      }
    } catch (err) {
      setError('Internet aloqasi yo\'q yoki API javob bermayapti');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    // Har 5 daqiqada avtomatik yangilash
    const interval = setInterval(() => {
      fetchRates();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  // Convert from active currency to others
  const convert = useCallback((fromIndex, inputValue) => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || !rates || Object.keys(rates).length === 0) {
      return activeCurrencies.map((c, i) => ({
        ...c,
        value: i === fromIndex ? inputValue : ''
      }));
    }

    const fromCode = activeCurrencies[fromIndex].code;
    const fromRateToUSD = rates[fromCode] || 1;

    return activeCurrencies.map((c, i) => {
      if (i === fromIndex) return { ...c, value: inputValue };
      const toRate = rates[c.code] || 1;
      const converted = (val / fromRateToUSD) * toRate;
      // Smart formatting
      let formatted;
      if (converted === 0) formatted = '0';
      else if (converted >= 1000) formatted = converted.toLocaleString('en-US', { maximumFractionDigits: 2 });
      else if (converted >= 1) formatted = converted.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
      else formatted = converted.toPrecision(4).replace(/0+$/, '').replace(/\.$/, '');
      return { ...c, value: formatted };
    });
  }, [activeCurrencies, rates]);

  // Handle numpad input
  const handleNumpadPress = (key) => {
    const current = activeCurrencies[activeIndex].value;
    let newValue;

    if (key === 'AC') {
      newValue = '';
    } else if (key === '⌫') {
      newValue = current.slice(0, -1);
    } else if (key === '.') {
      if (current.includes('.')) return;
      newValue = current === '' ? '0.' : current + '.';
    } else if (key === '00') {
      if (current === '' || current === '0') return;
      newValue = current + '00';
    } else {
      if (current === '0' && key !== '.') {
        newValue = key;
      } else {
        newValue = current + key;
      }
    }

    const updated = convert(activeIndex, newValue);
    setActiveCurrencies(updated);
  };

  // Handle direct input change
  const handleInputChange = (index, value) => {
    // Allow numbers, commas, and dots
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = cleaned.split('.');
    const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
    
    setActiveIndex(index);
    const updated = convert(index, sanitized);
    setActiveCurrencies(updated);
  };

  // Global klaviatura orqali yozish imkoniyati (Numpad uchun)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Agar foydalanuvchi input ichida yozayotgan bo'lsa, o'z holiga qo'yamiz
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      
      let key = e.key;
      if (key === ',') key = '.'; // Vergulni nuqtaga o'tkazamiz
      
      if (/^[0-9.]$/.test(key)) {
        handleNumpadPress(key);
      } else if (key === 'Backspace') {
        handleNumpadPress('⌫');
      } else if (key === 'Escape' || key === 'Delete') {
        handleNumpadPress('AC');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCurrencies, activeIndex, convert]);

  // Open modal to change currency
  const openCurrencySelect = (index) => {
    setModalTargetIndex(index);
    setModalOpen(true);
  };

  // Handle currency selection from modal
  const handleCurrencySelect = (currency) => {
    if (modalTargetIndex !== null) {
      const updated = [...activeCurrencies];
      updated[modalTargetIndex] = { ...updated[modalTargetIndex], code: currency.code };
      setActiveCurrencies(updated);
      setModalOpen(false);
      setModalTargetIndex(null);
      // Re-convert
      const active = updated[activeIndex];
      if (active.value) {
        const val = parseFloat(active.value);
        if (!isNaN(val) && rates && Object.keys(rates).length > 0) {
          const fromRateToUSD = rates[updated[activeIndex].code] || 1;
          const reconverted = updated.map((c, i) => {
            if (i === activeIndex) return c;
            const toRate = rates[c.code] || 1;
            const converted = (val / fromRateToUSD) * toRate;
            let formatted;
            if (converted === 0) formatted = '0';
            else if (converted >= 1000) formatted = converted.toLocaleString('en-US', { maximumFractionDigits: 2 });
            else if (converted >= 1) formatted = converted.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
            else formatted = converted.toPrecision(4).replace(/0+$/, '').replace(/\.$/, '');
            return { ...c, value: formatted };
          });
          setActiveCurrencies(reconverted);
        }
      }
    }
  };

  // Add new currency
  const addCurrency = () => {
    setModalTargetIndex(activeCurrencies.length); // special index for "add new"
    setModalOpen(true);
  };

  const handleAddCurrencySelect = (currency) => {
    if (modalTargetIndex === activeCurrencies.length) {
      // Adding new currency
      const newCurrencies = [...activeCurrencies, { code: currency.code, value: '' }];
      setActiveCurrencies(newCurrencies);
      setModalOpen(false);
      setModalTargetIndex(null);
      // Re-convert based on active index
      if (activeCurrencies[activeIndex]?.value) {
        const val = parseFloat(activeCurrencies[activeIndex].value);
        if (!isNaN(val) && rates) {
          const fromRateToUSD = rates[newCurrencies[activeIndex].code] || 1;
          const toRate = rates[currency.code] || 1;
          const converted = (val / fromRateToUSD) * toRate;
          let formatted;
          if (converted === 0) formatted = '0';
          else if (converted >= 1000) formatted = converted.toLocaleString('en-US', { maximumFractionDigits: 2 });
          else if (converted >= 1) formatted = converted.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
          else formatted = converted.toPrecision(4).replace(/0+$/, '').replace(/\.$/, '');
          newCurrencies[newCurrencies.length - 1].value = formatted;
          setActiveCurrencies([...newCurrencies]);
        }
      }
    } else {
      handleCurrencySelect(currency);
    }
  };

  // Remove currency
  const removeCurrency = (index) => {
    if (activeCurrencies.length <= 2) return;
    const updated = activeCurrencies.filter((_, i) => i !== index);
    if (activeIndex >= updated.length) setActiveIndex(updated.length - 1);
    else if (activeIndex === index) setActiveIndex(0);
    setActiveCurrencies(updated);
  };

  const numpadKeys = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['00', '0', '.'],
  ];

  return (
    <div className="max-w-2xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Valyuta Konvertori</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real vaqt valyuta kurslarida konvertatsiya</p>
        </div>
        <button 
          onClick={fetchRates}
          disabled={loading}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Yangilash
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center gap-3 transition-colors">
          <svg className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 dark:text-red-400 font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Currency Rows */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 transition-colors">
        
        {loading && Object.keys(rates).length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Kurslar yuklanmoqda...</p>
          </div>
        ) : (
          <>
            {activeCurrencies.map((curr, index) => {
              const info = getCurrencyInfo(curr.code);
              const isActive = activeIndex === index;
              return (
                <div 
                  key={`${curr.code}-${index}`}
                  className={`flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors cursor-pointer ${
                    isActive ? 'bg-blue-50/30 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveIndex(index)}
                >
                  {/* Flag + Currency selector */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); openCurrencySelect(index); }}
                    className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-md transition-colors shrink-0 shadow-sm"
                  >
                    <span className="text-xl">{info.flag}</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{curr.code}</span>
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Value input */}
                  <div className="flex-1 text-right">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={curr.value}
                      onChange={e => handleInputChange(index, e.target.value)}
                      onFocus={() => setActiveIndex(index)}
                      placeholder="0"
                      className={`w-full text-right text-xl font-medium bg-transparent outline-none ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{info.name}</p>
                  </div>

                  {/* Remove button */}
                  {activeCurrencies.length > 2 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeCurrency(index); }}
                      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add currency button */}
            <button
              onClick={addCurrency}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors font-medium text-sm border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Valyuta qo'shish
            </button>
          </>
        )}
      </div>

      {/* Last update */}
      {lastUpdate && (
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Oxirgi yangilanish: {lastUpdate.toLocaleDateString('uz-UZ')} {lastUpdate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Kurslar har 5 daqiqada avtomatik yangilanadi
          </p>
        </div>
      )}

      {/* Numpad */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-colors">
        <div className="grid grid-cols-3 gap-3">
          {numpadKeys.map((row, ri) => (
            row.map((key) => (
              <button
                key={key}
                onClick={() => handleNumpadPress(key)}
                className="h-14 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
              >
                {key}
              </button>
            ))
          ))}
        </div>
        
        {/* AC and Backspace row */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={() => handleNumpadPress('AC')}
            className="h-14 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 active:bg-red-100 dark:active:bg-red-900/50 border border-red-200 dark:border-red-800 transition-colors shadow-sm"
          >
            Tozalash (AC)
          </button>
          <button
            onClick={() => handleNumpadPress('⌫')}
            className="h-14 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 border border-gray-200 dark:border-gray-700 transition-colors flex items-center justify-center shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <CurrencySelectModal
          onClose={() => { setModalOpen(false); setModalTargetIndex(null); }}
          onSelect={handleAddCurrencySelect}
          selectedCodes={activeCurrencies.map(c => c.code)}
        />
      )}

    </div>
  );
}

export default CurrencyConverter;
