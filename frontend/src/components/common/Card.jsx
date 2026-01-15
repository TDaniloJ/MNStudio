import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-800',
        'rounded-lg shadow-md dark:shadow-gray-900/50',
        'border border-gray-200 dark:border-gray-700',
        'transition-all duration-200',
        hover && 'hover:scale-105 hover:shadow-lg dark:hover:shadow-gray-900/70 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;