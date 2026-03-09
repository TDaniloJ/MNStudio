import React from "react";
import { Link } from "react-router-dom";

const ErrorLayout = ({
  code = "Erro",
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado.",
  showHomeButton = true,
  showBackButton = true,
  actions,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-gray-800 bg-gray-900/40 p-6 shadow-lg">
        
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-400">Ops...</p>
          <h1 className="text-5xl font-bold tracking-tight">{code}</h1>
          <h2 className="mt-2 text-xl font-semibold">{title}</h2>
          <p className="mt-2 text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition"
            >
              Voltar
            </button>
          )}

          {showHomeButton && (
            <Link
              to="/"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition font-medium"
            >
              Ir para Home
            </Link>
          )}

          {/* Extra actions (se quiser passar botões custom) */}
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500">
          Se isso continuar acontecendo, tenta atualizar a página ou entrar em contato com o suporte.
        </div>
      </div>
    </div>
  );
};

export default ErrorLayout;
