import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import WorldbuildingPanel from '../../components/admin/WorldbuildingPanel';

const NovelWorldbuildingManager = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group flex-shrink-0">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Worldbuilding</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Construa o universo da novel — personagens, mundos, sistemas de magia e cultivo
            </p>
          </div>
        </div>
      </div>

      <WorldbuildingPanel novelId={id} mode="manage" />
    </div>
  );
};

export default NovelWorldbuildingManager;