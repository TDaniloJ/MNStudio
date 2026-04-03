import React from 'react';

const AuthBanner = ({ imageUrl = '/src/assets/login-bg.jpg', children }) => {
  return (
    <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="max-w-lg text-white dark:text-gray-200">{children}</div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl dark:bg-white/5" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl dark:bg-white/5" />
    </div>
  );
};

export default AuthBanner;
