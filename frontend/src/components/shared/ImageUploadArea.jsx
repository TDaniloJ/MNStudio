import React from 'react';
import { Camera } from 'lucide-react';
import Button from '../common/Button';

/**
 * Área de upload de imagem reutilizável com suporte a drag & drop.
 * Usada tanto para avatar quanto para banner.
 */
const ImageUploadArea = ({
  id,
  dragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onChange,
  label,
  hint,
}) => (
  <div
    className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
      dragOver
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-transparent'
    }`}
    onDrop={onDrop}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onClick={() => document.getElementById(id).click()}
    role="button"
    aria-label={label}
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && document.getElementById(id).click()}
  >
    <Camera className="w-10 h-10 text-gray-400 dark:text-gray-300 mx-auto mb-3" />
    <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm">
      Arraste uma imagem aqui ou clique para selecionar
    </p>
    {hint && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{hint}</p>
    )}
    <Button type="button" variant="outline" size="sm">
      Selecionar Arquivo
    </Button>
    <input
      id={id}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={onChange}
    />
  </div>
);

export default ImageUploadArea;
