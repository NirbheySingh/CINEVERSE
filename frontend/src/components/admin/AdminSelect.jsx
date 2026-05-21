import React from 'react';

const AdminSelect = ({ label, name, value, onChange, options, placeholder, required = false, disabled = false }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 bg-darker border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" className="bg-darker">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-darker">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AdminSelect;
