import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, options, onChange, renderSelected, renderOption, className = '', dropdownClass = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => (o.value || o) === value) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between focus:outline-none"
      >
        {renderSelected ? renderSelected(selectedOption) : <span>{selectedOption?.label || selectedOption?.value || selectedOption}</span>}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Backdrop for click outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${dropdownClass}`}>
          <div className="flex flex-col p-1 w-full max-h-64 overflow-y-auto no-scrollbar">
            {options.map((opt, i) => {
              const val = opt.value || opt;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(val)}
                  className="text-left w-full focus:outline-none"
                >
                  {renderOption ? renderOption(opt, val === value) : (
                    <div className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${val === value ? 'bg-slate-50 text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {opt.label || val}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
