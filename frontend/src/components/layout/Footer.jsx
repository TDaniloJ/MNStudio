import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-auto transition-colors duration-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold text-white">MN Studio</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-4">
              A melhor plataforma para ler mangás e novels online. 
              Conteúdo atualizado diariamente.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-600 flex items-center gap-1">
              Feito com <Heart className="w-4 h-4 text-red-500" /> para os fãs
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white dark:text-gray-200 font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/mangas" 
                  className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Mangás
                </Link>
              </li>
              <li>
                <Link 
                  to="/novels" 
                  className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Novels
                </Link>
              </li>
              <li>
                <Link 
                  to="/genres" 
                  className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Gêneros
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-white dark:text-gray-200 font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/faq" 
                  className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="/contact" 
                  className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Contato
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-gray-400 dark:text-gray-500 hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-gray-800 dark:border-gray-900" />

        <div className="text-center text-sm text-gray-500 dark:text-gray-600">
          © {new Date().getFullYear()} MN Studio. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;