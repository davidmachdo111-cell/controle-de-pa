import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PA, Equipment } from '../../types';
import {
  X,
  Monitor,
  Cpu,
  Tv,
  Clock,
  AlertTriangle,
  Shield,
  Edit,
  Plus,
  Trash2,
  RotateCcw,
  Boxes,
  Check,
  Link2Off,
  PlusCircle,
} from 'lucide-react';

interface PADetailDrawerProps {
  pa: PA;
  onClose: () => void;
  onEditPA?: (pa: PA) => void;
}

export const PADetailDrawer: React.FC<PADetailDrawerProps> = ({ pa, onClose, onEditPA }) => {
  const {
    equipments,
    occurrences,
    currentUser,
    paStatuses,
    updatePA,
    transferEquipment,
    unbindEquipment,
    deletePAWithOptions,
  } = useApp();

  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(pa.statusNome);
  const [occurrenceDesc, setOccurrenceDesc] = useState('');
  const [statusError, setStatusError] = useState('');

  // Equipment selection modal state
  const [showBindModal, setShowBindModal] = useState(false);
  const [bindSearch, setBindSearch] = useState('');

  // Delete PA modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get bound computer
  const computer = pa.computadorId ? equipments.find((e) => e.id === pa.computadorId) : null;

  // Get bound monitors
  const monitors = equipments.filter((e) => pa.monitorIds.includes(e.id));

  // All bound equipment
  const allBoundEquipment = equipments.filter((e) => e.paId === pa.id);

  // Available equipment in stock (unbound)
  const availableInStock = equipments.filter((e) => e.paId === null);

  // Get occurrences history
  const paOccurrences = occurrences.filter(
    (o) => o.entityType === 'PA' && (o.entityId === pa.id || o.entityCode === pa.code)
  );

  // Current active occurrence
  const currentOccurrence = paOccurrences.length > 0 ? paOccurrences[0] : null;

  // Direct status click toggle
  const handleQuickStatusChange = (newStatusName: string) => {
    if (newStatusName === pa.statusNome) return;

    const targetStatusObj = paStatuses.find((s) => s.name === newStatusName);
    if (targetStatusObj?.requiresOccurrence) {
      setSelectedStatus(newStatusName);
      setIsChangingStatus(true);
      return;
    }

    updatePA(pa.id, { statusNome: newStatusName });
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError('');

    const targetStatusObj = paStatuses.find((s) => s.name === selectedStatus);
    if (targetStatusObj?.requiresOccurrence && !occurrenceDesc.trim()) {
      setStatusError(`O status "${selectedStatus}" exige a descrição do motivo/ocorrência.`);
      return;
    }

    const res = updatePA(pa.id, { statusNome: selectedStatus }, occurrenceDesc);
    if (!res.success) {
      setStatusError(res.error || 'Erro ao atualizar status.');
      return;
    }

    setIsChangingStatus(false);
    setOccurrenceDesc('');
  };

  const handleBindEquipment = (eqId: string) => {
    transferEquipment(eqId, pa.id);
  };

  const handleUnbindEquipment = (eqId: string) => {
    unbindEquipment(eqId);
  };

  return (
    <div className="w-80 md:w-96 bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col z-30 shrink-0 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#004F4C] text-white font-bold text-base flex items-center justify-center shadow-2xs">
            {pa.code.split('-')[1] || pa.code}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{pa.code}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                  pa.statusNome === 'Ativo'
                    ? 'bg-[#008C50]'
                    : pa.statusNome === 'Manutenção'
                    ? 'bg-[#ED7203]'
                    : 'bg-slate-500'
                }`}
              >
                {pa.statusNome}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{pa.tipoNome}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 divide-y divide-slate-100">
        {/* Quick Status Buttons */}
        {currentUser.role === 'Administrador' && (
          <div className="pt-1 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alterar Status Rápido</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleQuickStatusChange('Ativo')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                  pa.statusNome === 'Ativo'
                    ? 'bg-[#008C50] text-white border-[#008C50] shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Ativa
              </button>

              <button
                onClick={() => handleQuickStatusChange('Manutenção')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                  pa.statusNome === 'Manutenção'
                    ? 'bg-[#ED7203] text-white border-[#ED7203] shadow-2xs'
                    : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
                }`}
              >
                Manutenção
              </button>

              <button
                onClick={() => handleQuickStatusChange('Inativo')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                  pa.statusNome === 'Inativo'
                    ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Inativa
              </button>
            </div>
          </div>
        )}

        {/* Form Modal inside Drawer for Maintenance Description */}
        {isChangingStatus && (
          <form onSubmit={handleStatusSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 pt-3">
            <h4 className="text-xs font-bold text-slate-900">Motivo da Indisponibilidade</h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Descrição da Ocorrência <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={occurrenceDesc}
                onChange={(e) => setOccurrenceDesc(e.target.value)}
                placeholder="Informe o motivo da manutenção/indisponibilidade..."
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#008C50]"
                required
              />
            </div>

            {statusError && <div className="text-[11px] text-red-600 font-medium">{statusError}</div>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsChangingStatus(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[#008C50] text-white text-xs font-semibold rounded-md hover:bg-[#007342]"
              >
                Salvar Status
              </button>
            </div>
          </form>
        )}

        {/* 1. Patrimônio da PA */}
        <div className="pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patrimônio da Mesa</span>
          <div className="mt-1 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">
                {pa.patrimonioPA ? `Patrimônio: ${pa.patrimonioPA}` : 'Sem patrimônio na mesa'}
              </div>
              <div className="text-[11px] text-slate-500">Identificação física da estação</div>
            </div>
            <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* 2. Equipamentos Vinculados & BINDING CONTROLS */}
        <div className="pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Equipamentos Vinculados ({allBoundEquipment.length})
            </span>

            {currentUser.role === 'Administrador' && (
              <button
                onClick={() => setShowBindModal(true)}
                className="text-xs font-bold text-[#008C50] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Vincular Equipamento</span>
              </button>
            )}
          </div>

          {/* Computer Card */}
          {computer ? (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">{computer.tipoNome}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      computer.statusNome === 'Ativo' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {computer.statusNome}
                  </span>

                  {currentUser.role === 'Administrador' && (
                    <button
                      onClick={() => handleUnbindEquipment(computer.id)}
                      className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                      title="Devolver ao estoque"
                    >
                      <Link2Off className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-700 font-mono">
                Patrimônio: <span className="font-bold">{computer.patrimonio}</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
              {pa.tipoNome === 'PA de Liderança'
                ? 'Sem computador (Padrão Liderança)'
                : 'Nenhum computador vinculado'}
            </div>
          )}

          {/* Monitors Cards */}
          {monitors.map((mon, idx) => (
            <div key={mon.id} className="p-2.5 bg-teal-50/40 rounded-xl border border-teal-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Monitor {idx + 1}: {mon.tipoNome}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    Patrimônio: <span className="font-semibold">{mon.patrimonio}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    mon.statusNome === 'Ativo' ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {mon.statusNome}
                </span>

                {currentUser.role === 'Administrador' && (
                  <button
                    onClick={() => handleUnbindEquipment(mon.id)}
                    className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                    title="Devolver ao estoque"
                  >
                    <Link2Off className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 3. Ocorrência Atual */}
        {pa.statusNome === 'Manutenção' && currentOccurrence && (
          <div className="pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ED7203]">Ocorrência Atual</span>
            <div className="mt-1.5 p-3 bg-orange-50 rounded-xl border border-orange-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-orange-900 font-bold">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ED7203]" />
                  Em Manutenção
                </span>
                <span className="text-[10px] text-orange-700">{currentOccurrence.data}</span>
              </div>
              <p className="text-xs text-slate-800 mt-1 leading-relaxed">{currentOccurrence.descricao}</p>
            </div>
          </div>
        )}

        {/* 4. Histórico */}
        <div className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Histórico de Alterações</span>
            <span className="text-[10px] text-slate-400">{paOccurrences.length} registros</span>
          </div>

          {paOccurrences.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {paOccurrences.map((occ) => (
                <div key={occ.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {occ.status}
                    </span>
                    <span>{occ.data}</span>
                  </div>
                  <p className="text-slate-700">{occ.descricao}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
              Nenhuma ocorrência registrada.
            </div>
          )}
        </div>

        {/* Bottom Actions: Edit & Delete PA */}
        {currentUser.role === 'Administrador' && (
          <div className="pt-4 flex items-center justify-between">
            {onEditPA && (
              <button
                onClick={() => onEditPA(pa)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-slate-600" />
                <span>Editar Cadastro</span>
              </button>
            )}

            <button
              onClick={() => {
                if (allBoundEquipment.length > 0) {
                  setShowDeleteModal(true);
                } else {
                  if (window.confirm(`Deseja realmente excluir a ${pa.code}?`)) {
                    deletePAWithOptions(pa.id, 'unbind');
                    onClose();
                  }
                }
              }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir PA</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal: Vincular Equipamento do Estoque */}
      {showBindModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Vincular Equipamento do Estoque</h3>
              <button onClick={() => setShowBindModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-3">
              Selecione um equipamento disponível no estoque para vincular à <strong className="text-slate-900">{pa.code}</strong>:
            </p>

            <input
              type="text"
              value={bindSearch}
              onChange={(e) => setBindSearch(e.target.value)}
              placeholder="Buscar por patrimônio ou modelo..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50] mb-3"
            />

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 my-2">
              {availableInStock
                .filter(
                  (e) =>
                    e.patrimonio.toLowerCase().includes(bindSearch.toLowerCase()) ||
                    e.tipoNome.toLowerCase().includes(bindSearch.toLowerCase())
                )
                .map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => {
                      handleBindEquipment(eq.id);
                      setShowBindModal(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-[#008C50] hover:bg-[#008C50]/5 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {eq.tipoNome} · <span className="font-mono">{eq.patrimonio}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{eq.categoria} · {eq.statusNome}</div>
                    </div>

                    <span className="text-xs font-bold text-[#008C50] bg-[#008C50]/10 px-2 py-0.5 rounded">
                      Vincular
                    </span>
                  </div>
                ))}

              {availableInStock.length === 0 && (
                <p className="text-xs text-slate-400 text-center p-4">Nenhum equipamento sem PA disponível no estoque.</p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowBindModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exclusão com Alerta Crítico */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Excluir Estação {pa.code}</h3>
                <p className="text-xs text-red-600 font-semibold">Esta PA possui patrimônios vinculados!</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              A estação <strong className="text-slate-900">{pa.code}</strong> possui{' '}
              <strong className="text-slate-900">{allBoundEquipment.length} equipamento(s)</strong> vinculados. Como deseja prosseguir?
            </p>

            <div className="space-y-2.5 mb-5">
              <button
                onClick={() => {
                  deletePAWithOptions(pa.id, 'unbind');
                  setShowDeleteModal(false);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#008C50] hover:bg-[#008C50]/5 transition-all"
              >
                <div className="text-xs font-bold text-slate-900">Mover Equipamentos para o Estoque (Recomendado)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Os equipamentos ficam disponíveis para novas PAs. A PA {pa.code} é excluída.
                </div>
              </button>

              <button
                onClick={() => {
                  deletePAWithOptions(pa.id, 'deleteAll');
                  setShowDeleteModal(false);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl border border-red-200 hover:bg-red-50 transition-all"
              >
                <div className="text-xs font-bold text-red-700">Excluir PA e Todos os Equipamentos</div>
                <div className="text-[11px] text-red-600 mt-0.5">
                  Remove permanentemente a PA e seus equipamentos vinculados do inventário.
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
