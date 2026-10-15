import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, MapPin, FileText, UserCheck, Shield, ChevronDown, CheckCircle, RotateCcw } from 'lucide-react';
import { GlobalSearchResult } from '../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUserRole,
    pesquisaGlobal,
    setActiveTab,
    setSelectedPAId,
    setSelectedPatrimonioId,
    resetToInitialData,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const results = pesquisaGlobal(searchQuery);
      setSearchResults(results);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (result: GlobalSearchResult, action: 'details' | 'plant') => {
    setIsSearchOpen(false);
    setSearchQuery('');

    if (action === 'plant') {
      setActiveTab('planta');
      if (result.paId) {
        setSelectedPAId(result.paId);
      }
    } else {
      if (result.type === 'PA' && result.paId) {
        setSelectedPAId(result.paId);
        setActiveTab('pas');
      } else if (result.type === 'PATRIMONIO' && result.equipmentId) {
        setSelectedPatrimonioId(result.equipmentId);
        setActiveTab('patrimonios');
      }
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between gap-4 shadow-2xs">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#004F4C] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
          PA
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            Controle de PA <span className="text-[#004F4C] text-sm font-semibold">· Planta Central</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            Gestão de infraestrutura, postos de atendimento e patrimônios
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md mx-2 md:mx-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length >= 2 && setIsSearchOpen(true)}
            placeholder="Pesquisar PA ou patrimônio... (ex: PA-01, PAT-1020)"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#004F4C] focus:ring-2 focus:ring-[#004F4C]/20 transition-all"
          />
        </div>

        {/* Dropdown Results */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50 divide-y divide-slate-100">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Nenhum registro encontrado para &quot;{searchQuery}&quot;
              </div>
            ) : (
              searchResults.map((res) => (
                <div key={res.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded text-white ${res.type === 'PA' ? 'bg-[#004F4C]' : 'bg-blue-600'}`}>
                        {res.type}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 truncate">{res.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{res.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSelectResult(res, 'details')}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                      title="Ver detalhes"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Detalhes</span>
                    </button>

                    {res.hasFloorPosition && (
                      <button
                        onClick={() => handleSelectResult(res, 'plant')}
                        className="px-2.5 py-1 text-xs font-medium text-[#004F4C] bg-[#004F4C]/10 hover:bg-[#004F4C]/20 rounded-md transition-colors flex items-center gap-1"
                        title="Ver localização na planta"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#004F4C]" />
                        <span>Na Planta</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* User Session & Role Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors border border-slate-200"
        >
          <Shield className={`w-3.5 h-3.5 ${currentUser.role === 'Administrador' ? 'text-[#004F4C]' : 'text-slate-500'}`} />
          <span className="hidden sm:inline font-semibold">{currentUser.username}</span>
          <span className={`px-1.5 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider ${
            currentUser.role === 'Administrador' ? 'bg-[#004F4C]/15 text-[#004F4C]' : 'bg-slate-200 text-slate-700'
          }`}>
            {currentUser.role}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => {
            if (window.confirm('Deseja restaurar os dados de demonstração originais?')) {
              resetToInitialData();
            }
          }}
          title="Resetar dados de demonstração"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Profile/Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#004F4C]/10 text-[#004F4C] flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Perfil de Acesso</h3>
                <p className="text-xs text-slate-500">Alterne entre Administrador e Visualização</p>
              </div>
            </div>

            <div className="space-y-3 my-4">
              <button
                onClick={() => {
                  setCurrentUserRole('Administrador');
                  setIsRoleModalOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                  currentUser.role === 'Administrador'
                    ? 'border-[#004F4C] bg-[#004F4C]/5 ring-1 ring-[#004F4C]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Administrador</span>
                    <span className="text-[10px] bg-[#004F4C] text-white px-1.5 py-0.5 rounded font-medium">Contactgestao</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Permissão total: edição de planta, movimentações, exclusões e cadastros.
                  </p>
                </div>
                {currentUser.role === 'Administrador' && <CheckCircle className="w-5 h-5 text-[#004F4C] shrink-0 mt-0.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentUserRole('Visualização');
                  setIsRoleModalOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                  currentUser.role === 'Visualização'
                    ? 'border-slate-400 bg-slate-50 ring-1 ring-slate-400'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Visualização</span>
                    <span className="text-[10px] bg-slate-600 text-white px-1.5 py-0.5 rounded font-medium">operador1</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Modo consulta: leitura de mapas, estatísticas e buscas de patrimônio.
                  </p>
                </div>
                {currentUser.role === 'Visualização' && <CheckCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
