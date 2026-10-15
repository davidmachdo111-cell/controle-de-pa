import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { PatrimonioModal } from './PatrimonioModal';
import {
  Boxes,
  Search,
  Plus,
  Edit,
  Trash2,
  Cpu,
  Tv,
  MapPin,
  Link2Off,
  Filter,
  CheckCircle,
} from 'lucide-react';

export const PatrimonioListView: React.FC = () => {
  const {
    equipments,
    pas,
    equipmentStatuses,
    deleteEquipment,
    unbindEquipment,
    currentUser,
    activePatrimonioFilter,
    setActivePatrimonioFilter,
    setActiveTab,
    setHighlightedPAId,
    highlightedEquipmentId,
    setHighlightedEquipmentId,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterBinding, setFilterBinding] = useState<string>('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEqForEdit, setSelectedEqForEdit] = useState<Equipment | null>(null);

  // Sync filters from Dashboard
  useEffect(() => {
    if (activePatrimonioFilter) {
      if (activePatrimonioFilter.categoria) setFilterCategory(activePatrimonioFilter.categoria);
      if (activePatrimonioFilter.status) setFilterStatus(activePatrimonioFilter.status);
      if (activePatrimonioFilter.semPa) setFilterBinding('Sem PA');
      setActivePatrimonioFilter(null);
    }
  }, [activePatrimonioFilter]);

  // Handle direct equipment highlight from search
  useEffect(() => {
    if (highlightedEquipmentId) {
      const target = equipments.find((e) => e.id === highlightedEquipmentId);
      if (target) {
        setSearch(target.patrimonio);
      }
    }
  }, [highlightedEquipmentId, equipments]);

  const filteredEquipments = equipments.filter((eq) => {
    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      const matchTag = eq.patrimonio.toLowerCase().includes(q);
      const matchModel = eq.tipoNome.toLowerCase().includes(q);
      if (!matchTag && !matchModel) return false;
    }

    // Category
    if (filterCategory === 'Computadores' && eq.categoria !== 'Computador') return false;
    if (filterCategory === 'Monitores' && eq.categoria !== 'Monitor') return false;
    if (filterCategory === 'Outros' && eq.categoria !== 'Outros') return false;

    // Status
    if (filterStatus !== 'Todos' && eq.statusNome !== filterStatus) return false;

    // Binding
    if (filterBinding === 'Vinculados' && !eq.paId) return false;
    if (filterBinding === 'Sem PA' && eq.paId) return false;

    return true;
  });

  const handleOpenAdd = () => {
    setSelectedEqForEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setSelectedEqForEdit(eq);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventário de Patrimônios & Equipamentos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Controle individual de computadores, monitores e componentes
          </p>
        </div>

        {currentUser.role === 'Administrador' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#008C50] hover:bg-[#007342] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Equipamento</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (highlightedEquipmentId) setHighlightedEquipmentId(null);
              }}
              placeholder="Buscar patrimônio ou modelo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008C50]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008C50]"
            >
              <option value="Todas">Todas as Categorias</option>
              <option value="Computadores">Computadores</option>
              <option value="Monitores">Monitores</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008C50]"
            >
              <option value="Todos">Todos os Status</option>
              {equipmentStatuses.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Binding Filter */}
          <div>
            <select
              value={filterBinding}
              onChange={(e) => setFilterBinding(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#008C50]"
            >
              <option value="Todos">Todas as Situações</option>
              <option value="Vinculados">Vinculados a uma PA</option>
              <option value="Sem PA">Equipamento sem PA (Estoque)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Exibindo <strong className="text-slate-800">{filteredEquipments.length}</strong> de {equipments.length} patrimônios
          </span>
          {(filterCategory !== 'Todas' || filterStatus !== 'Todos' || filterBinding !== 'Todos' || search) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterCategory('Todas');
                setFilterStatus('Todos');
                setFilterBinding('Todos');
                setHighlightedEquipmentId(null);
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
                <th className="py-3.5 px-4">Patrimônio</th>
                <th className="py-3.5 px-4">Categoria / Tipo</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">PA Vinculada</th>
                <th className="py-3.5 px-4">Observações</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEquipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nenhum equipamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredEquipments.map((eq) => {
                  const boundPA = eq.paId ? pas.find((p) => p.id === eq.paId) : null;

                  return (
                    <tr key={eq.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Patrimônio Tag */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-slate-100 rounded-lg text-slate-700">
                            {eq.categoria === 'Computador' ? (
                              <Cpu className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Tv className="w-4 h-4 text-teal-600" />
                            )}
                          </span>
                          <span>{eq.patrimonio}</span>
                        </div>
                      </td>

                      {/* Categoria / Tipo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{eq.tipoNome}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{eq.categoria}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            eq.statusNome === 'Ativo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : eq.statusNome === 'Disponível'
                              ? 'bg-blue-100 text-blue-800'
                              : eq.statusNome === 'Manutenção'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {eq.statusNome}
                        </span>
                      </td>

                      {/* PA Vinculada */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {boundPA ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#004F4C] bg-[#004F4C]/10 px-2 py-0.5 rounded text-xs">
                              {boundPA.code}
                            </span>
                            <button
                              onClick={() => {
                                setHighlightedPAId(boundPA.id);
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
                            Equipamento sem PA
                          </span>
                        )}
                      </td>

                      {/* Observações */}
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {eq.observacao || <span className="text-slate-300">—</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {currentUser.role === 'Administrador' && (
                            <>
                              {eq.paId && (
                                <button
                                  onClick={() => unbindEquipment(eq.id)}
                                  className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Desvincular da PA"
                                >
                                  <Link2Off className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEdit(eq)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Editar patrimônio"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Deseja realmente excluir o patrimônio ${eq.patrimonio}?`)) {
                                    deleteEquipment(eq.id);
                                  }
                                }}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir equipamento"
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

      {/* Modal Add/Edit Equipment */}
      {isModalOpen && (
        <PatrimonioModal
          equipmentToEdit={selectedEqForEdit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
