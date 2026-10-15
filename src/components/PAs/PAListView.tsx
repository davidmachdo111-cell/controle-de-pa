import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PA } from '../../types';
import { PAModal } from './PAModal';
import { Search, Plus, Edit, MapPin, Trash2, Monitor, UserCheck, Phone, Boxes } from 'lucide-react';

export const PAListView: React.FC = () => {
  const { pas, patrimonios, excluirPAComCascata, currentUser, setActiveTab, setSelectedPAId } = useApp();

  const [search, setSearch] = useState('');
  const [filterSetor, setFilterSetor] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPAForEdit, setSelectedPAForEdit] = useState<PA | null>(null);

  const filteredPAs = pas.filter((pa) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const matchCode = pa.codigo.toLowerCase().includes(q);
      const matchUser = pa.usuarioAtual ? pa.usuarioAtual.toLowerCase().includes(q) : false;
      const matchRamal = pa.ramal ? pa.ramal.toLowerCase().includes(q) : false;
      if (!matchCode && !matchUser && !matchRamal) return false;
    }

    if (filterSetor !== 'Todos' && pa.setor !== filterSetor) return false;
    if (filterStatus !== 'Todos' && pa.status !== filterStatus) return false;

    return true;
  });

  const getStatusBadge = (status: PA['status']) => {
    switch (status) {
      case 'disponivel':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">Disponível</span>;
      case 'ocupado':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">Ocupada</span>;
      case 'manutencao':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">Manutenção</span>;
      case 'desativado':
        return <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full font-bold text-[10px]">Desativada</span>;
    }
  };

  const handleOpenAdd = () => {
    setSelectedPAForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pa: PA) => {
    setSelectedPAForEdit(pa);
    setIsModalOpen(true);
  };

  const handleGoToMap = (pa: PA) => {
    setSelectedPAId(pa.id);
    setActiveTab('planta');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Postos de Atendimento (PAs)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Lista completa sincronizada em tempo real com a Planta Baixa
          </p>
        </div>

        {currentUser.role === 'Administrador' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#004F4C] hover:bg-[#003836] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Estação PA</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, usuário ou ramal..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#004F4C]"
            />
          </div>

          <div>
            <select
              value={filterSetor}
              onChange={(e) => setFilterSetor(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#004F4C]"
            >
              <option value="Todos">Todos os Setores</option>
              <option value="Operação A">Operação A</option>
              <option value="Operação B">Operação B</option>
              <option value="Liderança">Liderança</option>
              <option value="TI & Suporte">TI & Suporte</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#004F4C]"
            >
              <option value="Todos">Todos os Status</option>
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupada</option>
              <option value="manutencao">Manutenção</option>
              <option value="desativado">Desativada</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Exibindo <strong className="text-slate-800">{filteredPAs.length}</strong> de {pas.length} PAs
          </span>
          {(filterSetor !== 'Todos' || filterStatus !== 'Todos' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterSetor('Todos');
                setFilterStatus('Todos');
              }}
              className="text-[#004F4C] font-semibold hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Estação PA</th>
                <th className="py-3.5 px-4">Setor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Usuário Alocado</th>
                <th className="py-3.5 px-4">Ramal</th>
                <th className="py-3.5 px-4">Equipamentos</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPAs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Nenhuma PA encontrada.
                  </td>
                </tr>
              ) : (
                filteredPAs.map((pa) => {
                  const boundEqs = patrimonios.filter((e) => e.paId === pa.id);

                  return (
                    <tr key={pa.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#004F4C] text-white flex items-center justify-center font-bold text-xs">
                            {pa.codigo}
                          </div>
                          <span>{pa.codigo}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{pa.setor}</td>

                      <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(pa.status)}</td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {pa.usuarioAtual ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{pa.usuarioAtual}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Vago</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {pa.ramal || <span className="text-slate-300">—</span>}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Boxes className="w-3.5 h-3.5 text-[#004F4C]" />
                          <span>{boundEqs.length} item(ns)</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleGoToMap(pa)}
                            className="p-1.5 text-[#004F4C] hover:bg-[#004F4C]/10 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                            title="Ver na planta"
                          >
                            <MapPin className="w-4 h-4" />
                            <span className="text-[11px]">Ver no Mapa</span>
                          </button>

                          {currentUser.role === 'Administrador' && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(pa)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Editar PA"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  if (boundEqs.length > 0) {
                                    handleGoToMap(pa);
                                  } else {
                                    if (window.confirm(`Deseja excluir a ${pa.codigo}?`)) {
                                      excluirPAComCascata(pa.id, 'mover_estoque');
                                    }
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir PA"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <PAModal
          paToEdit={selectedPAForEdit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
