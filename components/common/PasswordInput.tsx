import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, placeholder = 'Senha', className = '' }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#10b981] transition-colors z-10 pointer-events-none">
        <Lock size={16} />
      </div>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-14 pr-14 py-4 border transition-all font-medium text-slate-900 placeholder:text-slate-600 outline-none focus:ring-0 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all p-1 z-10"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

export default PasswordInput;
