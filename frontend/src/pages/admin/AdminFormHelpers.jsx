import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

/**
 * Layout compartilhado para formulários do admin.
 * Preserva 100% da lógica dos forms — só envolve com estilo consistente.
 */
export const AdminFormLayout = ({ title, subtitle, onBack, children }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <button onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Voltar
      </button>
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

/**
 * Seção de formulário com título e conteúdo.
 */
export const FormSection = ({ title, children }) => (
  <Card className="p-6">
    <h2 className="text-base font-black text-gray-900 dark:text-white mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
      {title}
    </h2>
    <div className="space-y-5">{children}</div>
  </Card>
);

/**
 * Área de upload de capa com preview.
 */
export const CoverUpload = ({ preview, onFileChange, onClear, file }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">
      Capa
    </label>
    <div className="flex items-start gap-4">
      {preview && (
        <div className="relative flex-shrink-0">
          <img src={preview} alt="Preview" className="w-28 h-40 object-cover rounded-xl shadow-md" />
          <button type="button" onClick={onClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md">
            <span className="text-xs font-bold">×</span>
          </button>
        </div>
      )}
      <label className="flex-1 flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all group">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Clique para fazer upload
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG até 10MB</p>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </label>
    </div>
    {file && (
      <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
        <span>✓</span> {file.name} ({Math.round(file.size / 1024)} KB)
      </p>
    )}
  </div>
);

/**
 * Grid de gêneros com checkboxes estilizados.
 */
export const GenreGrid = ({ genres, selectedGenres, onToggle }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
    {genres.map((genre) => {
      const selected = selectedGenres.includes(genre.id);
      return (
        <label key={genre.id}
          className={`flex items-center justify-center px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
            selected
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white'
          }`}>
          <input type="checkbox" checked={selected} onChange={() => onToggle(genre.id)} className="sr-only" />
          {genre.name}
        </label>
      );
    })}
  </div>
);

/**
 * Campo de label + input genérico.
 */
export const FieldLabel = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);