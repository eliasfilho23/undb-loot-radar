import { useState } from 'react';
import { useSearchParams } from 'react-router';

type TabId = 'gratuitos' | 'promocoes'

const PLACEHOLDER_CARDS = Array.from({ length: 8 });

function GameCardSkeleton() {
  return (
    <div className="bg-card border border-gray-700 rounded-xl overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-700" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="h-8 bg-gray-700 rounded mt-1" />
      </div>
    </div>
  );
}

function GameCard() {
  return (
    <div className="bg-card border border-gray-700 rounded-xl overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-800" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-white font-medium text-sm leading-snug">Nome do jogo</p>
        <p className="text-gray-500 text-xs">PC • Grátis</p>
        <div className="mt-auto pt-3">
          <button
            type="button"
            className="w-full bg-accent hover:bg-blue-600 text-white text-sm font-medium py-1.5 rounded-lg transition-colors"
          >
            Resgatar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [ searchParams, setSearchParams ] = useSearchParams();
  const abaParam = searchParams.get('aba');
  const [ activeTab, setActiveTab ] = useState<TabId>(() =>
    abaParam === 'promocoes' ? 'promocoes' : 'gratuitos',
  );

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'promocoes') {
      setSearchParams({ aba: 'promocoes' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-gray-700">
        <button
          type="button"
          onClick={() => handleTabChange('gratuitos')}
          className={`px-4 py-2.5 font-medium rounded-t-lg transition-colors ${
            activeTab === 'gratuitos'
              ? 'bg-card text-accent border border-gray-700 border-b-0 -mb-px'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Jogos gratuitos
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('promocoes')}
          className={`px-4 py-2.5 font-medium rounded-t-lg transition-colors ${
            activeTab === 'promocoes'
              ? 'bg-card text-accent border border-gray-700 border-b-0 -mb-px'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Promoções
        </button>
      </div>

      {activeTab === 'gratuitos' && (
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Jogos gratuitos</h1>
          <p className="text-gray-400 text-sm mb-6">
            Jogos e loots 100% grátis. Clica em Resgatar para abrir o link oficial.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PLACEHOLDER_CARDS.map((_, i) => (
              <GameCard key={i} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'promocoes' && (
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Promoções atuais</h1>
          <p className="text-gray-400 text-sm mb-6">
            Descontos em jogos em várias lojas. Clica em Ver oferta para abrir o link.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PLACEHOLDER_CARDS.map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
