import React, { ButtonHTMLAttributes } from 'react';
import { motion, Variants } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'social';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  isLoading = false,
  variant = 'primary',
  icon,
  fullWidth = true,
  ...props
}) => {
  const getButtonClasses = () => {
    const baseClasses = "relative px-5 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center";
    const widthClasses = fullWidth ? "w-full" : "";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} ${widthClasses} bg-gradient-to-r from-primary to-blue-500 hover:from-primary-dark hover:to-blue-600 text-white shadow-md hover:shadow-lg focus:ring-primary/50`;
      case 'secondary':
        return `${baseClasses} ${widthClasses} border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-sm hover:shadow focus:ring-neutral-200 dark:focus:ring-neutral-700`;
      case 'social':
        return `${baseClasses} ${widthClasses} border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-sm hover:shadow focus:ring-neutral-200 dark:focus:ring-neutral-700`;
      default:
        return `${baseClasses} ${widthClasses} bg-primary hover:bg-primary-dark text-white`;
    }
  };

  const magneticEffect: Variants = {
    initial: {
      scale: 1
    },
    hover: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.97
    }
  };

  return (
    <motion.button
      className={getButtonClasses()}
      disabled={isLoading || props.disabled}
      variants={magneticEffect}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
      {variant === 'primary' && (
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity blur"></span>
        </span>
      )}
    </motion.button>
  );
};

export default AuthButton;