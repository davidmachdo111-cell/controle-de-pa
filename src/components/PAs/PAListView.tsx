import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PA } from '../../types';
import { PAModal } from './PAModal';
import { Monitor, Search, Filter, Plus, Edit, MapPin, Trash2, Cpu, Tv, Eye } from 'lucide-react';

export const PAListView: React.FC = () => {
  const {
    pas,
    equipments,
    paTypes,
    paStatuses,
    deletePA,
    currentUser,
    activePAFilter,
    setActivePAFilter,
    setActiveTab,
    setHighlightedPAId,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterHasPc, setFilterHasPc] = useState<string>('Todos');
  const [filterMonitors, setFilterMonitors] = useState<string>('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPAForEdit, setSelectedPAForEdit] = useState<PA | null>(null);

  // Sync incoming navigation filters from Dashboard
  useEffect(() => {
    if (activePAFilter) {
      if (activePAFilter.type) setFilterType(activePAFilter.type);
      if (activePAFilter.status) setFilterStatus(activePAFilter.status);
      if (activePAFilter.monitorCount !== undefined) setFilterMonitors(String(activePAFilter.monitorCount));
      setActivePAFilter(null); // Clear after applying
    }
  }, [activePAFilter]);

  // Filtered PAs
  const filteredPAs = pas.filter((pa) => {
    // Search query
    const q = search.trim().toLowerCase();
    if (q) {
      const matchCode = pa.code.toLowerCase().includes(q);
      const matchAsset = pa.patrimonioPA ? pa.patrimonioPA.toLowerCase().includes(q) : false;
      if (!matchCode && !matchAsset) return false;
    }

    // Type filter
    if (filterType !== 'Todos' && pa.tipoNome !== filterType) return false;

    // Status filter
    if (filterStatus !== 'Todos' && pa.statusNome !== filterStatus) return false;

    // Has PC filter
    if (filterHasPc === 'Com PC' && !pa.computadorId) return false;
    if (filterHasPc === 'Sem PC' && pa.computadorId) return false;

    // Monitor count filter
    if (filterMonitors !== 'Todos') {
      const count = parseInt(filterMonitors, 10);
      if (pa.monitorIds.length !== count) return false;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setSelectedPAForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pa: PA) => {
    setSelectedPAForEdit(pa);
    setIsModalOpen(true);
  };

  const handleGoToMap = (pa: PA) => {
    setHighlightedPAId(pa.id);
    setActiveTab('planta');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cadastro de Estações (PAs)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerenciamento de PAs de operação, liderança e equipamentos vinculados
          </p>
        </div>

        {currentUser.role === 'Administrador' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#008C50] hover:bg-[#007342] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Estação PA</span>
          </button>
        )}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar código ou patrimônio..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008C50]"
            />
          </div>

          {/* Filter Type */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008C50]"
            >
              <option value="Todos">Todos os Tipos</option>
              {paTypes.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008C50]"
            >
              <option value="Todos">Todos os Status</option>
              {paStatuses.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter PC */}
          <div>
            <select
              value={filterHasPc}
              onChange={(e) => setFilterHasPc(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008C50]"
            >
              <option value="Todos">Filtro de Computador</option>
              <option value="Com PC">Com Computador</option>
              <option value="Sem PC">Sem Computador</option>
            </select>
          </div>

          {/* Filter Monitors */}
          <div>
            <select
              value={filterMonitors}
              onChange={(e) => setFilterMonitors(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008C50]"
            >
              <option value="Todos">Filtro de Monitores</option>
              <option value="1">1 Monitor</option>
              <option value="2">2 Monitores</option>
              <option value="0">Sem Monitores</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Exibindo <strong className="text-slate-800">{filteredPAs.length}</strong> de {pas.length} PAs
          </span>
          {(filterType !== 'Todos' || filterStatus !== 'Todos' || filterHasPc !== 'Todos' || filterMonitors !== 'Todos' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterType('Todos');
                setFilterStatus('Todos');
                setFilterHasPc('Todos');
                setFilterMonitors('Todos');
              }}
              className="text-[#008C50] font-semibold hover:underline"
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
                <th className="py-3.5 px-4">PA</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Patrimônio PA</th>
                <th className="py-3.5 px-4">Computador</th>
                <th className="py-3.5 px-4">Monitores</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPAs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Nenhuma PA encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPAs.map((pa) => {
                  const computer = pa.computadorId ? equipments.find((e) => e.id === pa.computadorId) : null;
                  const monitors = equipments.filter((e) => pa.monitorIds.includes(e.id));

                  return (
                    <tr key={pa.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* PA Code */}
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#004F4C] text-white flex items-center justify-center font-bold text-xs">
                            {pa.code.split('-')[1] || pa.code}
                          </div>
                          <span>{pa.code}</span>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{pa.tipoNome}</td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${
                            pa.statusNome === 'Ativo'
                              ? 'bg-[#008C50]'
                              : pa.statusNome === 'Manutenção'
                              ? 'bg-[#ED7203]'
                              : 'bg-slate-500'
                          }`}
                        >
                          {pa.statusNome}
                        </span>
                      </td>

                      {/* Patrimônio PA */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                        {pa.patrimonioPA || <span className="text-slate-300 italic">Sem tag</span>}
                      </td>

                      {/* Computador */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {computer ? (
                          <div className="flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-800">{computer.tipoNome}</span>
                            <span className="font-mono text-slate-400 text-[11px]">({computer.patrimonio})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            {pa.tipoNome === 'PA de Liderança' ? 'Sem PC (Padrão Liderança)' : 'Sem PC'}
                          </span>
                        )}
                      </td>

                      {/* Monitores */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Tv className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{monitors.length} monitor(es)</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleGoToMap(pa)}
                            className="p-1.5 text-[#004F4C] hover:bg-[#004F4C]/10 rounded-lg transition-colors"
                            title="Ver na planta"
                          >
                            <MapPin className="w-4 h-4" />
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
                                  if (window.confirm(`Deseja realmente excluir a ${pa.code}?`)) {
                                    deletePA(pa.id);
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

      {/* Modal Add/Edit PA */}
      {isModalOpen && (
        <PAModal
          paToEdit={selectedPAForEdit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
