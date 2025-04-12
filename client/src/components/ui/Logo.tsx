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
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64
  };

  const logoSize = sizeMap[size];
  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
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