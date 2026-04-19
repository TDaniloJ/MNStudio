import React from 'react';
import { BookOpen, Heart, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppInfo } from '../../hooks/useFeatures';

const LINKS_CONTENT = [
  { to: '/mangas',   label: 'Mangás'   },
  { to: '/novels',   label: 'Novels'   },
  { to: '/rankings', label: 'Rankings' },
  { to: '/genres',   label: 'Gêneros'  },
];

const LINKS_SUPPORT = [
  { to: '/support', label: 'Central de Ajuda', highlight: true },
  { to: '/faq',     label: 'FAQ'     },
  { to: '/contact', label: 'Contato' },
];

const Footer = () => {
  const appInfo = useAppInfo();

  return (
    <footer className="bg-gray-950 dark:bg-black border-t border-gray-800/60 dark:border-gray-900 mt-auto">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Marca */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
              <div className="p-1.5 bg-primary-600 rounded-lg group-hover:bg-primary-500 transition-colors">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                {appInfo.appName}
              </span>
            </Link>

            <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed mb-5 max-w-xs">
              A melhor plataforma para ler mangás e novels online.
              Conteúdo atualizado diariamente para os fãs.
            </p>

            <p className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-700">
              Feito com
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              para os fãs
            </p>
          </div>

          {/* Links Conteúdo */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-600 mb-4">
              Conteúdo
            </h3>
            <ul className="space-y-2.5">
              {LINKS_CONTENT.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Suporte */}
          <div className="md:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-600 mb-4">
              Suporte
            </h3>
            <ul className="space-y-2.5">
              {LINKS_SUPPORT.map(({ to, label, highlight }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`text-sm transition-colors ${
                      highlight
                        ? 'text-primary-400 hover:text-primary-300 font-medium'
                        : 'text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}

              {/* Links externos */}
              {appInfo.termsUrl && (
                <li>
                  <a
                    href={appInfo.termsUrl}
                    className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Termos de Uso
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              )}
              {appInfo.privacyUrl && (
                <li>
                  <a
                    href={appInfo.privacyUrl}
                    className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacidade
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              )}
              {appInfo.contactEmail && (
                <li>
                  <a
                    href={`mailto:${appInfo.contactEmail}`}
                    className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 transition-colors"
                  >
                    {appInfo.contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-800/60 dark:border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600 dark:text-gray-700">
            © {new Date().getFullYear()} {appInfo.appName}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-800 font-mono">
            v{appInfo.appVersion}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;