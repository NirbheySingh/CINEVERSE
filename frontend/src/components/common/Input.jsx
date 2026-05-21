import React from 'react';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor={name}>{label}</label>}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-darker border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-500 transition-all duration-300"
      />
    </div>
  );
};

export default Input;
