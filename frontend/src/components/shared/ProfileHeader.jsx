import React from 'react';
import { Edit, Eye } from 'lucide-react';
import Button from '../common/Button';

/**
 * Header da página de perfil com título e botão de toggle edição/visualização.
 */
const ProfileHeader = ({ isEditing, onToggle }) => (
  <div className="flex items-center justify-between mb-8">
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
      {isEditing ? 'Editar Perfil' : 'Meu Perfil'}
    </h1>
    <Button onClick={onToggle} variant={isEditing ? 'secondary' : 'primary'}>
      {isEditing ? (
        <>
          <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
          Visualizar Perfil
        </>
      ) : (
        <>
          <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
          Editar Perfil
        </>
      )}
    </Button>
  </div>
);

export default ProfileHeader;
