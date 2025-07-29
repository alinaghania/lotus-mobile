import React, { useState } from 'react';

interface MultiSelectProps {
  label: string;
  options: string[];
  value: string[]; // current selected values
  onChange: (v: string[]) => void;
  allowOther?: boolean;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, value, onChange, allowOther, disabled }) => {
  const [current, setCurrent] = useState('');

  const handleAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const unique = Array.from(new Set([...value, val]));
    onChange(unique);
    setCurrent(''); // reset dropdown to placeholder
  };

  return (
    <div>
      <select
        value={current}
        onChange={handleAdd}
        className={`w-full border-2 border-orange-200 rounded-xl p-3 text-sm focus:outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
        disabled={disabled}
      >
        <option value="">Add {label.toLowerCase()}...</option>
        {options.map((opt) => (
          <option key={opt} value={opt} disabled={value.includes(opt)} className="capitalize">
            {opt}
          </option>
        ))}
      </select>
      {allowOther && !disabled && (
        <input
          type="text"
          placeholder="Other..."
          className="mt-2 w-full border rounded px-2 py-1 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val) {
                const unique = Array.from(new Set([...value, `Other(${val})`]));
                onChange(unique);
              }
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      )}
    </div>
  );
};

export default MultiSelect; 