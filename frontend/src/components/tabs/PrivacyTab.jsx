import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Aba de privacidade: exportação de dados e exclusão de conta.
 */
const PrivacyTab = ({
  deleteConfirm,
  onDeleteConfirmChange,
  onOpenDeleteModal,
  onExportData,
  loading,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Exportação */}
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Exportação de Dados
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Exporte todos os seus dados pessoais em formato JSON. Isso inclui suas informações de
        perfil, atividades e configurações.
      </p>
      <Button
        onClick={onExportData}
        loading={loading}
        variant="outline"
        className="w-full dark:text-white dark:hover:text-black dark:border-gray-600"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar Meus Dados
      </Button>
    </Card>

    {/* Exclusão */}
    <Card className="p-6 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
      <div className="flex items-start gap-3 mb-4">
        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Excluir Conta</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label='Digite "CONFIRMAR" para excluir sua conta'
          value={deleteConfirm}
          onChange={(e) => onDeleteConfirmChange(e.target.value)}
          placeholder="CONFIRMAR"
        />
        <Button
          variant="danger"
          onClick={onOpenDeleteModal}
          disabled={deleteConfirm !== 'CONFIRMAR'}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir Minha Conta Permanentemente
        </Button>
      </div>
    </Card>
  </div>
);

export default PrivacyTab;
