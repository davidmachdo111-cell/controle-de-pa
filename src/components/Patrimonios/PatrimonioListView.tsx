import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patrimonio, StatusPatrimonio } from '../../types';
import { PatrimonioModal } from './PatrimonioModal';
import { Search, Plus, Edit, Trash2, Boxes, Cpu, Tv, Link2Off, MapPin, Clock, History, X } from 'lucide-react';

export const PatrimonioListView: React.FC = () => {
  const {
    patrimonios,
    pas,
    historico,
    deletarPatrimonio,
    desvincularPatrimonio,
    currentUser,
    setActiveTab,
    setSelectedPAId,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEqForEdit, setSelectedEqForEdit] = useState<Patrimonio | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<Patrimonio | null>(null);

  const filteredPatrimonios = patrimonios.filter((pat) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const matchTag = pat.tagTombamento.toLowerCase().includes(q);
      const matchModel = pat.modelo.toLowerCase().includes(q);
      const matchBrand = pat.marca.toLowerCase().includes(q);
      const matchSN = pat.numeroSerie.toLowerCase().includes(q);
      if (!matchTag && !matchModel && !matchBrand && !matchSN) return false;
    }

    if (filterTipo !== 'Todos' && pat.tipo !== filterTipo) return false;
    if (filterStatus !== 'Todos' && pat.status !== filterStatus) return false;

    return true;
  });

  const getStatusBadge = (status: StatusPatrimonio) => {
    switch (status) {
      case 'em_uso':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">Em Uso</span>;
      case 'estoque':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">Estoque</span>;
      case 'defeito':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">Defeito</span>;
      case 'descartado':
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold text-[10px]">Descartado</span>;
    }
  };

  const handleOpenAdd = () => {
    setSelectedEqForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pat: Patrimonio) => {
    setSelectedEqForEdit(pat);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventário de Patrimônios (Ativos TI)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Controle individual e histórico de rastreabilidade de movimentação
          </p>
        </div>

        {currentUser.role === 'Administrador' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#004F4C] hover:bg-[#003836] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Patrimônio</span>
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
              placeholder="Buscar por tag, modelo, marca ou N/S..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#004F4C]"
            />
          </div>

          <div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#004F4C]"
            >
              <option value="Todos">Todos os Tipos</option>
              <option value="desktop">Desktop</option>
              <option value="notebook">Notebook</option>
              <option value="monitor">Monitor</option>
              <option value="headset">Headset</option>
              <option value="cadeira">Cadeira</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#004F4C]"
            >
              <option value="Todos">Todos os Status</option>
              <option value="em_uso">Em Uso</option>
              <option value="estoque">Estoque</option>
              <option value="defeito">Defeito</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Exibindo <strong className="text-slate-800">{filteredPatrimonios.length}</strong> de {patrimonios.length} ativos
          </span>
          {(filterTipo !== 'Todos' || filterStatus !== 'Todos' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterTipo('Todos');
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
                <th className="py-3.5 px-4">Tag Tombamento</th>
                <th className="py-3.5 px-4">Tipo & Modelo</th>
                <th className="py-3.5 px-4">Série / Marca</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Estação Alocada</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatrimonios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nenhum patrimônio encontrado.
                  </td>
                </tr>
              ) : (
                filteredPatrimonios.map((pat) => {
                  const boundPA = pat.paId ? pas.find((p) => p.id === pat.paId) : null;

                  return (
                    <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-slate-100 rounded text-slate-700">
                            {pat.tipo === 'desktop' || pat.tipo === 'notebook' ? (
                              <Cpu className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Tv className="w-3.5 h-3.5 text-teal-600" />
                            )}
                          </span>
                          <span>{pat.tagTombamento}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {pat.marca} {pat.modelo}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {pat.tipo}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {pat.numeroSerie || <span className="text-slate-300">—</span>}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(pat.status)}</td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {boundPA ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#004F4C] bg-[#004F4C]/10 px-2 py-0.5 rounded text-xs">
                              {boundPA.codigo}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedPAId(boundPA.id);
                                setActiveTab('planta');
                              }}
                              className="p-1 text-slate-400 hover:text-[#004F4C] rounded"
                              title="Ver na planta"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            Estoque
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setShowHistoryModal(pat)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 font-semibold"
                            title="Ver histórico de movimentação"
                          >
                            <History className="w-4 h-4 text-slate-500" />
                          </button>

                          {currentUser.role === 'Administrador' && (
                            <>
                              {pat.paId && (
                                <button
                                  onClick={() => {
                                    const motivo = prompt('Informe o motivo da devolução ao estoque:');
                                    if (motivo !== null) {
                                      desvincularPatrimonio(pat.id, motivo || 'Devolução pela lista de patrimônios');
                                    }
                                  }}
                                  className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Desvincular e mover para estoque"
                                >
                                  <Link2Off className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEdit(pat)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Editar patrimônio"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Deseja excluir permanentemente o patrimônio ${pat.tagTombamento}?`)) {
                                    deletarPatrimonio(pat.id);
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir patrimônio"
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
        <PatrimonioModal
          equipmentToEdit={selectedEqForEdit}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Rastreabilidade / Movement History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Histórico de Movimentação - {showHistoryModal.tagTombamento}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rastreabilidade de alocações e desvinculações
                  </p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {historico.filter((h) => h.patrimonioId === showHistoryModal.id).length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-400 italic">
                  Nenhuma movimentação registrada no histórico.
                </p>
              ) : (
                historico
                  .filter((h) => h.patrimonioId === showHistoryModal.id)
                  .map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 font-medium text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Clock className="w-3 h-3 text-[#004F4C]" />
                          {log.dataHora}
                        </span>
                        <span className="font-semibold">{log.responsavel}</span>
                      </div>

                      <div className="font-bold text-slate-900 pt-0.5">
                        {log.paOrigemCodigo || 'Estoque'} &rarr; {log.paDestinoCodigo || 'Estoque'}
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed">{log.motivo}</p>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
