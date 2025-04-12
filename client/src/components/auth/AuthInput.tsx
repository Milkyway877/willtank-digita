import React, { useState, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  icon,
  type,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputType, setInputType] = useState(type);
  const isPassword = type === 'password';
  
  const togglePasswordVisibility = () => {
    setInputType(inputType === 'password' ? 'text' : 'password');
  };

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative">
        <label 
          className="block text-neutral-500 mb-2 text-sm font-medium"
        >
          {label}
        </label>
        
        <div className="relative">
          <div className="flex">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                <span className="text-neutral-400">{icon}</span>
              </div>
            )}
            
            <input
              type={inputType}
              className={`w-full py-3 px-4 rounded-lg border ${
                error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'
              } focus:ring-2 focus:ring-primary focus:outline-none transition-all bg-white dark:bg-neutral-800 dark:text-white ${
                icon ? 'pl-10' : 'pl-4'
              }`}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            />
            
            {isPassword && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {inputType === 'password' ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <motion.p 
            className="text-red-500 text-xs mt-1 ml-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default AuthInput;