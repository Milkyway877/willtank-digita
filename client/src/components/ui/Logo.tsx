import React from 'react';
import { motion } from 'framer-motion';
// Import logo directly
import logoSrc from '../../assets/willvault-removebg-preview.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  withText = true,
  className = ''
}) => {
  // Further increased size values for more prominence
  const sizeMap = {
    sm: 36,   // Was 32
    md: 48,   // Was 42
    lg: 72,   // Was 64
    xl: 96    // Was 84
  };

  const logoSize = sizeMap[size];
  const textSizeMap = {
    sm: 'text-xl',      // Was text-lg
    md: 'text-2xl',     // Was text-2xl
    lg: 'text-4xl',     // Was text-3xl
    xl: 'text-5xl'      // Was text-4xl
  };

  return (
    <div className={`flex items-center ${className}`}>
      <motion.img 
        src={logoSrc} 
        alt="WillTank Logo" 
        width={logoSize} 
        height={logoSize}
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="flex-shrink-0"
      />
      {withText && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`font-bold ${textSizeMap[size]} ml-2 text-primary`}
        >
          WillTank
        </motion.span>
      )}
    </div>
  );
};

export default Logo;