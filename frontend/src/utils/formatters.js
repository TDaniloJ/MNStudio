const BASE_URL = import.meta.env.VITE_BASE_URL;
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  const number = Number(num);
  if (isNaN(number)) return '0';
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

export const getImageUrl = (path, updatedAt = null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (updatedAt) {
    return `${BASE_URL}${cleanPath}?v=${new Date(updatedAt).getTime()}`;
  }

  return `${BASE_URL}${cleanPath}`;
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};