import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PA } from '../../types';
import { X, Monitor, Cpu, Tv, Clock, AlertTriangle, Shield, Edit, PlusCircle, CheckCircle } from 'lucide-react';

interface PADetailDrawerProps {
  pa: PA;
  onClose: () => void;
  onEditPA?: (pa: PA) => void;
}

export const PADetailDrawer: React.FC<PADetailDrawerProps> = ({ pa, onClose, onEditPA }) => {
  const { equipments, occurrences, currentUser, paStatuses, updatePA } = useApp();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(pa.statusNome);
  const [occurrenceDesc, setOccurrenceDesc] = useState('');
  const [statusError, setStatusError] = useState('');

  // Get computer equipment
  const computer = pa.computadorId ? equipments.find((e) => e.id === pa.computadorId) : null;

  // Get monitor equipments
  const monitors = equipments.filter((e) => pa.monitorIds.includes(e.id));

  // Get occurrences history
  const paOccurrences = occurrences.filter((o) => o.entityType === 'PA' && (o.entityId === pa.id || o.entityCode === pa.code));

  // Current active occurrence
  const currentOccurrence = paOccurrences.length > 0 ? paOccurrences[0] : null;

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

  return (
    <div className="w-80 md:w-96 bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col z-20 shrink-0 animate-in slide-in-from-right duration-200">
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
        {/* Quick Admin Actions */}
        {currentUser.role === 'Administrador' && (
          <div className="pt-1 flex items-center justify-between">
            <button
              onClick={() => setIsChangingStatus(!isChangingStatus)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5 text-slate-600" />
              <span>Alterar Status</span>
            </button>

            {onEditPA && (
              <button
                onClick={() => onEditPA(pa)}
                className="px-3 py-1.5 bg-[#008C50]/10 hover:bg-[#008C50]/20 text-[#008C50] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Cadastro</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Status Form Modal inside Drawer */}
        {isChangingStatus && (
          <form onSubmit={handleStatusSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 pt-3">
            <h4 className="text-xs font-bold text-slate-900">Atualizar Status da PA</h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Novo Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#008C50]"
              >
                {paStatuses.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} {st.requiresOccurrence ? '(Exige descrição)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {paStatuses.find((s) => s.name === selectedStatus)?.requiresOccurrence && (
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
                />
              </div>
            )}

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
                Salvar
              </button>
            </div>
          </form>
        )}

        {/* 1. Patrimônio da PA */}
        <div className="pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patrimônio da Mesa / Estação</span>
          <div className="mt-1 flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-800">
                {pa.patrimonioPA ? `Patrimônio: ${pa.patrimonioPA}` : 'Sem patrimônio atribuído à mesa'}
              </div>
              <div className="text-[11px] text-slate-500">Identificação física da estrutura da PA</div>
            </div>
            <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* 2. Computador Vinculado */}
        <div className="pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Computador Vinculado</span>
          {computer ? (
            <div className="mt-1.5 p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">{computer.tipoNome}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    computer.statusNome === 'Ativo' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {computer.statusNome}
                </span>
              </div>
              <div className="text-xs text-slate-700 font-mono">
                Patrimônio: <span className="font-bold">{computer.patrimonio}</span>
              </div>
            </div>
          ) : (
            <div className="mt-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
              {pa.tipoNome === 'PA de Liderança'
                ? 'Sem computador (Configuração padrão para PA de Liderança)'
                : 'Nenhum computador vinculado a esta PA'}
            </div>
          )}
        </div>

        {/* 3. Monitores Vinculados */}
        <div className="pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monitores ({monitors.length})</span>
          {monitors.length > 0 ? (
            <div className="mt-1.5 space-y-2">
              {monitors.map((mon, idx) => (
                <div key={mon.id} className="p-2.5 bg-teal-50/40 rounded-xl border border-teal-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Monitor {idx + 1}: {mon.tipoNome}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        Patrimônio: <span className="font-semibold">{mon.patrimonio}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      mon.statusNome === 'Ativo' ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {mon.statusNome}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
              Nenhum monitor vinculado
            </div>
          )}
        </div>

        {/* 4. Ocorrência Atual */}
        {pa.statusNome === 'Manutenção' && currentOccurrence && (
          <div className="pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ED7203]">Ocorrência Atual / Defeito</span>
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

        {/* 5. Histórico */}
        <div className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Histórico de Alterações</span>
            <span className="text-[10px] text-slate-400">{paOccurrences.length} registros</span>
          </div>

          {paOccurrences.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
            <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
              Nenhuma ocorrência registrada no histórico.
            </div>
          )}
        </div>

        {/* Observações adicionais */}
        {pa.observacoes && (
          <div className="pt-3 text-xs text-slate-600">
            <span className="font-semibold block text-slate-700 mb-0.5">Observações Gerais:</span>
            {pa.observacoes}
          </div>
        )}
      </div>
    </div>
  );
};
