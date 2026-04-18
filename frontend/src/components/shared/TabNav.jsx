import React from 'react';

/**
 * Barra de navegação por abas.
 * Recebe a lista de tabs, a aba ativa e o callback de troca.
 */
const TabNav = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex gap-1 mb-8 border-b overflow-x-auto" role="tablist">
    {tabs.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        role="tab"
        aria-selected={activeTab === id}
        onClick={() => onTabChange(id)}
        className={`flex items-center gap-2 pb-3 px-4 font-medium transition whitespace-nowrap ${
          activeTab === id
            ? 'border-b-2 border-primary-600 text-primary-600'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
        {label}
      </button>
    ))}
  </div>
);

export default TabNav;
