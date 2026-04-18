import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Hook para gerenciar upload de imagem com drag & drop.
 * Centraliza validação de tipo e tamanho, preview via FileReader.
 *
 * @param {number} maxSizeBytes - Limite de tamanho em bytes (padrão: 5MB)
 */
export function useImageUpload(maxSizeBytes = MAX_SIZE_BYTES) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    (incoming) => {
      if (!incoming) return;

      if (!VALID_IMAGE_TYPES.includes(incoming.type)) {
        toast.error('Selecione uma imagem JPEG, PNG, GIF ou WebP');
        return;
      }

      if (incoming.size > maxSizeBytes) {
        const mb = (maxSizeBytes / 1024 / 1024).toFixed(0);
        toast.error(`A imagem deve ter no máximo ${mb}MB`);
        return;
      }

      setFile(incoming);

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(incoming);
    },
    [maxSizeBytes]
  );

  const handleChange = useCallback(
    (e) => processFile(e.target.files?.[0]),
    [processFile]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      processFile(e.dataTransfer.files[0]);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  return {
    file,
    preview,
    dragOver,
    handleChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    reset,
  };
}
