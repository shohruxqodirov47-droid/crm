import React, { useState, useRef, useMemo } from 'react';

const CURRENCIES = [
  { code: 'AED', name: 'United Arab Emirates Dirham', flag: '🇦🇪' },
  { code: 'AFN', name: 'Afghan Afghani', flag: '🇦🇫' },
  { code: 'ALL', name: 'Albanian Lek', flag: '🇦🇱' },
  { code: 'AMD', name: 'Armenian Dram', flag: '🇦🇲' },
  { code: 'ANG', name: 'Netherlands Antillean Guilder', flag: '🇨🇼' },
  { code: 'AOA', name: 'Angolan Kwanza', flag: '🇦🇴' },
  { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'AZN', name: 'Azerbaijani Manat', flag: '🇦🇿' },
  { code: 'BAM', name: 'Bosnian Convertible Mark', flag: '🇧🇦' },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩' },
  { code: 'BGN', name: 'Bulgarian Lev', flag: '🇧🇬' },
  { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭' },
  { code: 'BIF', name: 'Burundian Franc', flag: '🇧🇮' },
  { code: 'BND', name: 'Brunei Dollar', flag: '🇧🇳' },
  { code: 'BOB', name: 'Bolivian Boliviano', flag: '🇧🇴' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'BWP', name: 'Botswanan Pula', flag: '🇧🇼' },
  { code: 'BYN', name: 'Belarusian Ruble', flag: '🇧🇾' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴' },
  { code: 'CRC', name: 'Costa Rican Colón', flag: '🇨🇷' },
  { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'DOP', name: 'Dominican Peso', flag: '🇩🇴' },
  { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿' },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
  { code: 'ETB', name: 'Ethiopian Birr', flag: '🇪🇹' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'GEL', name: 'Georgian Lari', flag: '🇬🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', flag: '🇬🇹' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'HNL', name: 'Honduran Lempira', flag: '🇭🇳' },
  { code: 'HRK', name: 'Croatian Kuna', flag: '🇭🇷' },
  { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'ILS', name: 'Israeli New Shekel', flag: '🇮🇱' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'IQD', name: 'Iraqi Dinar', flag: '🇮🇶' },
  { code: 'IRR', name: 'Iranian Rial', flag: '🇮🇷' },
  { code: 'ISK', name: 'Icelandic Króna', flag: '🇮🇸' },
  { code: 'JMD', name: 'Jamaican Dollar', flag: '🇯🇲' },
  { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'KGS', name: 'Kyrgystani Som', flag: '🇰🇬' },
  { code: 'KHR', name: 'Cambodian Riel', flag: '🇰🇭' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
  { code: 'KZT', name: 'Kazakhstani Tenge', flag: '🇰🇿' },
  { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧' },
  { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
  { code: 'MDL', name: 'Moldovan Leu', flag: '🇲🇩' },
  { code: 'MGA', name: 'Malagasy Ariary', flag: '🇲🇬' },
  { code: 'MKD', name: 'Macedonian Denar', flag: '🇲🇰' },
  { code: 'MMK', name: 'Myanmar Kyat', flag: '🇲🇲' },
  { code: 'MNT', name: 'Mongolian Tugrik', flag: '🇲🇳' },
  { code: 'MUR', name: 'Mauritian Rupee', flag: '🇲🇺' },
  { code: 'MVR', name: 'Maldivian Rufiyaa', flag: '🇲🇻' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'MZN', name: 'Mozambican Metical', flag: '🇲🇿' },
  { code: 'NAD', name: 'Namibian Dollar', flag: '🇳🇦' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲' },
  { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'PLN', name: 'Polish Złoty', flag: '🇵🇱' },
  { code: 'PYG', name: 'Paraguayan Guarani', flag: '🇵🇾' },
  { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
  { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴' },
  { code: 'RSD', name: 'Serbian Dinar', flag: '🇷🇸' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'RWF', name: 'Rwandan Franc', flag: '🇷🇼' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'SYP', name: 'Syrian Pound', flag: '🇸🇾' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'TJS', name: 'Tajikistani Somoni', flag: '🇹🇯' },
  { code: 'TMT', name: 'Turkmenistani Manat', flag: '🇹🇲' },
  { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'TWD', name: 'New Taiwan Dollar', flag: '🇹🇼' },
  { code: 'TZS', name: 'Tanzanian Shilling', flag: '🇹🇿' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦' },
  { code: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬' },
  { code: 'USD', name: 'United States Dollar', flag: '🇺🇸' },
  { code: 'UYU', name: 'Uruguayan Peso', flag: '🇺🇾' },
  { code: 'UZS', name: 'Uzbekistani Som', flag: '🇺🇿' },
  { code: 'VES', name: 'Venezuelan Bolívar', flag: '🇻🇪' },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳' },
  { code: 'XAF', name: 'Central African CFA Franc', flag: '🌍' },
  { code: 'XOF', name: 'West African CFA Franc', flag: '🌍' },
  { code: 'YER', name: 'Yemeni Rial', flag: '🇾🇪' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'ZMW', name: 'Zambian Kwacha', flag: '🇿🇲' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function CurrencySelectModal({ onClose, onSelect, selectedCodes = [] }) {
  const [search, setSearch] = useState('');
  const listRef = useRef(null);
  const sectionRefs = useRef({});

  const filtered = useMemo(() => {
    if (!search.trim()) return CURRENCIES;
    const q = search.toLowerCase();
    return CURRENCIES.filter(
      c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(c => {
      const letter = c.code[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return groups;
  }, [filtered]);

  const scrollToLetter = (letter) => {
    const el = sectionRefs.current[letter];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Valyuta tanlash</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="relative">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Valyuta qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Currency List + Alphabet Index */}
        <div className="flex flex-1 overflow-hidden bg-white dark:bg-gray-800">
          
          {/* List */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-2">
            
            {/* Selected currencies at top */}
            {selectedCodes.length > 0 && !search && (
              <div className="mb-4">
                <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tanlanganlar</p>
                {CURRENCIES.filter(c => selectedCodes.includes(c.code)).map(currency => (
                  <button
                    key={`sel-${currency.code}`}
                    onClick={() => onSelect(currency)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    <span className="text-xl">{currency.flag}</span>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{currency.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs font-medium">{currency.code}</span>
                    </div>
                    <svg className="w-5 h-5 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Grouped currencies */}
            {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([letter, currencies]) => (
              <div key={letter} ref={el => sectionRefs.current[letter] = el} className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-10 border-b border-gray-100 dark:border-gray-700">{letter}</p>
                {currencies.map(currency => {
                  const isSelected = selectedCodes.includes(currency.code);
                  return (
                    <button
                      key={currency.code}
                      onClick={() => onSelect(currency)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-1"
                    >
                      <span className="text-xl">{currency.flag}</span>
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{currency.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs font-medium">{currency.code}</span>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium">Valyuta topilmadi</p>
              </div>
            )}
          </div>

          {/* Alphabet Index */}
          {!search && (
            <div className="flex flex-col items-center justify-center py-2 px-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 select-none bg-gray-50 dark:bg-gray-900 border-l border-gray-100 dark:border-gray-700">
              {ALPHABET.map(letter => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  className={`w-5 h-5 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                    grouped[letter] ? 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white' : 'text-gray-300 dark:text-gray-600'
                  }`}
                  disabled={!grouped[letter]}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export { CURRENCIES };
export default CurrencySelectModal;
