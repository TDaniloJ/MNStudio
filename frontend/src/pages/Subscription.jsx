import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import { coinService } from '../services/coinService';

export default function Subscription() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPackages() {
      try {
        setLoading(true);
        const data = await coinService.getPackages();
        setPackages(data.packages || []);
      } catch (err) {
        console.error('Erro ao carregar pacotes:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Assinatura</h1>
      <p className="text-gray-600 mb-6">Gerencie seu plano e veja opções de upgrade.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="font-semibold">Grátis</h3>
          <p className="text-sm text-gray-600">Acesso básico a todas as funcionalidades</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/profile')}>Plano Atual</Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold">Premium Mensal</h3>
          <p className="text-sm text-gray-600">Funcionalidades extras e prioridade</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/coins')}>Ver planos / Pagar</Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold">Premium Anual</h3>
          <p className="text-sm text-gray-600">Melhor custo-benefício</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/coins')}>Ver planos / Pagar</Button>
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-3">Pacotes disponíveis</h2>
      {loading ? (
        <p>Carregando pacotes...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.length === 0 && <p className="text-gray-600">Nenhum pacote encontrado.</p>}
          {packages.map((pkg) => (
            <Card key={pkg.id} className="p-4">
              <div className="flex flex-col">
                <strong className="text-lg">{pkg.name}</strong>
                <span className="text-sm text-gray-600">{pkg.description}</span>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold">{pkg.price_label || `${pkg.price || 0} BRL`}</span>
                  <Button onClick={async () => {
                    try {
                      await coinService.purchasePackage(pkg.id);
                      alert('Compra simulada com sucesso');
                    } catch (err) {
                      console.error(err);
                      alert('Erro ao comprar pacote');
                    }
                  }}>Comprar</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
