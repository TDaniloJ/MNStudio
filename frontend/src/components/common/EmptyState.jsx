import React from 'react';
import { BookOpen } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = BookOpen, 
  title = 'Nenhum resultado encontrado',
  description = 'Tente ajustar os filtros de busca'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default EmptyState;