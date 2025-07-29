import React from 'react';

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  allowOther?: boolean;
}

const SingleSelect: React.FC<Props> = ({ options, value, onChange, placeholder = 'Select...', allowOther }) => {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-2 border-orange-200 rounded-xl p-3 text-sm focus:outline-none"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="capitalize">
            {opt}
          </option>
        ))}
      </select>
      {allowOther && (
        <input
          type="text"
          placeholder="Other..."
          className="mt-2 w-full border rounded px-2 py-1 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val) onChange(`Other(${val})`);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      )}
    </div>
  );
};

export default SingleSelect; 