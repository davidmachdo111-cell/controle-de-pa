import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PA } from '../../types';
import { X, Monitor, Cpu, Tv, AlertTriangle, Shield, Check } from 'lucide-react';

interface PAModalProps {
  paToEdit?: PA | null;
  onClose: () => void;
}

export const PAModal: React.FC<PAModalProps> = ({ paToEdit, onClose }) => {
  const {
    pas,
    equipments,
    paTypes,
    paStatuses,
    addPA,
    updatePA,
    suggestNextPACode,
  } = useApp();

  const isEditing = !!paToEdit;

  const [code, setCode] = useState('');
  const [tipoNome, setTipoNome] = useState('PA de Operação');
  const [statusNome, setStatusNome] = useState('Ativo');
  const [patrimonioPA, setPatrimonioPA] = useState('');
  const [computadorId, setComputadorId] = useState<string | null>(null);
  const [monitorIds, setMonitorIds] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [occurrenceDesc, setOccurrenceDesc] = useState('');
  const [error, setError] = useState('');

  // Auto initialize values or suggest next code
  useEffect(() => {
    if (paToEdit) {
      setCode(paToEdit.code);
      setTipoNome(paToEdit.tipoNome);
      setStatusNome(paToEdit.statusNome);
      setPatrimonioPA(paToEdit.patrimonioPA || '');
      setComputadorId(paToEdit.computadorId);
      setMonitorIds(paToEdit.monitorIds);
      setObservacoes(paToEdit.observacoes);
    } else {
      setCode(suggestNextPACode());
      setTipoNome('PA de Operação');
      setStatusNome('Ativo');
    }
  }, [paToEdit]);

  // Handle PA de Liderança standard configuration default
  const handleTypeChange = (newTypeName: string) => {
    setTipoNome(newTypeName);
    if (newTypeName === 'PA de Liderança' && !isEditing) {
      // Standard configuration for Liderança: Sem computador, 1 monitor
      setComputadorId(null);
      const availableMonitors = equipments.filter((e) => e.categoria === 'Monitor' && e.paId === null);
      if (availableMonitors.length > 0) {
        setMonitorIds([availableMonitors[0].id]);
      }
    }
  };

  const selectedStatusObj = paStatuses.find((s) => s.name === statusNome);
  const requiresOccurrence = selectedStatusObj?.requiresOccurrence || false;

  const editingPaId = paToEdit?.id;
  const editingPaMonitors = paToEdit?.monitorIds || [];

  // Computadores available (unbound or bound to this PA)
  const availableComputers = equipments.filter(
    (e) => e.categoria === 'Computador' && (e.paId === null || (editingPaId ? e.paId === editingPaId : false))
  );

  // Monitores available
  const availableMonitors = equipments.filter(
    (e) => e.categoria === 'Monitor' && (e.paId === null || editingPaMonitors.includes(e.id))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('O código da PA é obrigatório.');
      return;
    }

    if (requiresOccurrence && !occurrenceDesc.trim()) {
      setError(`O status "${statusNome}" exige a descrição da ocorrência.`);
      return;
    }

    const paPayload = {
      code: code.trim().toUpperCase(),
      tipoId: paTypes.find((t) => t.name === tipoNome)?.id || 'patype-1',
      tipoNome,
      statusId: paStatuses.find((s) => s.name === statusNome)?.id || 'pastatus-1',
      statusNome,
      patrimonioPA: patrimonioPA.trim() || undefined,
      computadorId,
      monitorIds,
      observacoes: observacoes.trim(),
      x: paToEdit?.x ?? null,
      y: paToEdit?.y ?? null,
      rotation: paToEdit?.rotation ?? 0,
      width: paToEdit?.width ?? 60,
      height: paToEdit?.height ?? 45,
    };

    if (isEditing && paToEdit) {
      const res = updatePA(paToEdit.id, paPayload, occurrenceDesc);
      if (!res.success) {
        setError(res.error || 'Erro ao atualizar PA.');
        return;
      }
    } else {
      const res = addPA(paPayload, occurrenceDesc);
      if (!res.success) {
        setError(res.error || 'Erro ao cadastrar PA.');
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004F4C] text-white flex items-center justify-center font-bold">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `Editar ${paToEdit?.code}` : 'Cadastrar Nova PA'}
              </h3>
              <p className="text-xs text-slate-500">
                Estação de trabalho física do Contact Center
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código & Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código da PA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: PA-001"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50] font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo da PA
              </label>
              <select
                value={tipoNome}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
              >
                {paTypes.filter((t) => t.active).map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Patrimônio da PA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={statusNome}
                onChange={(e) => setStatusNome(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
              >
                {paStatuses.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} {s.requiresOccurrence ? '(Exige ocorrência)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patrimônio da Mesa / Estação
              </label>
              <input
                type="text"
                value={patrimonioPA}
                onChange={(e) => setPatrimonioPA(e.target.value)}
                placeholder="Ex: 0034567"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50] font-mono"
              />
            </div>
          </div>

          {/* Computador Vinculado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                Computador Vinculado
              </span>
              {tipoNome === 'PA de Liderança' && (
                <span className="text-[10px] text-[#008C50] font-medium">Padrão Liderança: Sem PC</span>
              )}
            </label>

            <select
              value={computadorId || ''}
              onChange={(e) => setComputadorId(e.target.value ? e.target.value : null)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
            >
              <option value="">Sem Computador Vinculado</option>
              {availableComputers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tipoNome} - Patrimônio: {c.patrimonio} ({c.statusNome})
                </option>
              ))}
            </select>
          </div>

          {/* Monitores Vinculados */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-teal-600" />
              Monitores Vinculados ({monitorIds.length} selecionados)
            </label>

            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50">
              {availableMonitors.length === 0 ? (
                <p className="text-xs text-slate-400 p-2 text-center">Nenhum monitor disponível no inventário</p>
              ) : (
                availableMonitors.map((mon) => {
                  const isChecked = monitorIds.includes(mon.id);
                  return (
                    <label
                      key={mon.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        isChecked ? 'bg-teal-50 border-teal-200 font-semibold' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMonitorIds([...monitorIds, mon.id]);
                            } else {
                              setMonitorIds(monitorIds.filter((m) => m !== mon.id));
                            }
                          }}
                          className="rounded text-[#008C50] focus:ring-[#008C50]"
                        />
                        <span>
                          {mon.tipoNome} · <span className="font-mono">{mon.patrimonio}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{mon.statusNome}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Ocorrência se exigida */}
          {requiresOccurrence && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-orange-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#ED7203]" />
                Ocorrência Obrigatória para Manutenção <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={occurrenceDesc}
                onChange={(e) => setOccurrenceDesc(e.target.value)}
                placeholder="Descreva o motivo da manutenção, defeito apresentado ou chamado..."
                className="w-full text-xs p-2.5 bg-white border border-orange-300 rounded-lg focus:outline-none focus:border-[#ED7203]"
                required
              />
            </div>
          )}

          {/* Observações Gerais */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações relevantes sobre a localização ou uso da estação..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">{error}</div>}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#008C50] hover:bg-[#007342] rounded-xl shadow-2xs transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar PA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
