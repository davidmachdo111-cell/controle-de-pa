import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { X, Boxes, AlertTriangle, Cpu, Tv } from 'lucide-react';

interface PatrimonioModalProps {
  equipmentToEdit?: Equipment | null;
  onClose: () => void;
}

export const PatrimonioModal: React.FC<PatrimonioModalProps> = ({ equipmentToEdit, onClose }) => {
  const {
    pas,
    equipmentTypes,
    equipmentStatuses,
    addEquipment,
    updateEquipment,
    transferEquipment,
  } = useApp();

  const isEditing = !!equipmentToEdit;

  const [patrimonio, setPatrimonio] = useState('');
  const [categoria, setCategoria] = useState<'Computador' | 'Monitor' | 'Outros'>('Computador');
  const [tipoNome, setTipoNome] = useState('');
  const [statusNome, setStatusNome] = useState('Ativo');
  const [paId, setPaId] = useState<string | null>(null);
  const [observacao, setObservacao] = useState('');
  const [occurrenceDesc, setOccurrenceDesc] = useState('');
  const [error, setError] = useState('');

  // Transfer confirmation prompt
  const [transferPrompt, setTransferPrompt] = useState<{ targetPaId: string | null; oldPaCode: string; newPaCode: string } | null>(null);

  useEffect(() => {
    if (equipmentToEdit) {
      setPatrimonio(equipmentToEdit.patrimonio);
      setCategoria(equipmentToEdit.categoria);
      setTipoNome(equipmentToEdit.tipoNome);
      setStatusNome(equipmentToEdit.statusNome);
      setPaId(equipmentToEdit.paId);
      setObservacao(equipmentToEdit.observacao || '');
    } else {
      // Default type for category
      const defaultType = equipmentTypes.find((t) => t.category === 'Computador');
      if (defaultType) setTipoNome(defaultType.name);
      setStatusNome('Ativo');
    }
  }, [equipmentToEdit]);

  const filteredTypes = equipmentTypes.filter((t) => t.category === categoria && t.active);

  const handleCategoryChange = (newCat: 'Computador' | 'Monitor' | 'Outros') => {
    setCategoria(newCat);
    const firstType = equipmentTypes.find((t) => t.category === newCat && t.active);
    if (firstType) setTipoNome(firstType.name);
  };

  const selectedStatusObj = equipmentStatuses.find((s) => s.name === statusNome);
  const requiresOccurrence = selectedStatusObj?.requiresOccurrence || false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patrimonio.trim()) {
      setError('O número do patrimônio é obrigatório.');
      return;
    }

    if (requiresOccurrence && !occurrenceDesc.trim()) {
      setError(`O status "${statusNome}" exige a descrição de uma ocorrência.`);
      return;
    }

    // Check if transferring equipment already bound to another PA
    if (isEditing && equipmentToEdit && equipmentToEdit.paId && paId && equipmentToEdit.paId !== paId) {
      const oldPA = pas.find((p) => p.id === equipmentToEdit.paId);
      const newPA = pas.find((p) => p.id === paId);

      setTransferPrompt({
        targetPaId: paId,
        oldPaCode: oldPA?.code || 'PA anterior',
        newPaCode: newPA?.code || 'nova PA',
      });
      return;
    }

    executeSave(paId);
  };

  const executeSave = (finalPaId: string | null) => {
    const eqPayload = {
      patrimonio: patrimonio.trim().toUpperCase(),
      categoria,
      tipoId: equipmentTypes.find((t) => t.name === tipoNome)?.id || 'eqtype-1',
      tipoNome,
      statusId: equipmentStatuses.find((s) => s.name === statusNome)?.id || 'eqstatus-1',
      statusNome,
      paId: finalPaId,
      observacao: observacao.trim(),
    };

    if (isEditing && equipmentToEdit) {
      const res = updateEquipment(equipmentToEdit.id, eqPayload, occurrenceDesc);
      if (!res.success) {
        setError(res.error || 'Erro ao atualizar patrimônio.');
        return;
      }
    } else {
      const res = addEquipment(eqPayload, occurrenceDesc);
      if (!res.success) {
        setError(res.error || 'Erro ao cadastrar patrimônio.');
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
            <div className="w-10 h-10 rounded-xl bg-[#008C50] text-white flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `Editar Patrimônio ${equipmentToEdit?.patrimonio}` : 'Cadastrar Novo Equipamento'}
              </h3>
              <p className="text-xs text-slate-500">
                Controle de computadores, monitores e periféricos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transfer Confirmation Dialog Overlay */}
        {transferPrompt ? (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-orange-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-[#ED7203]" />
              <span>Confirmar Transferência de Patrimônio</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              O patrimônio <strong className="font-mono text-slate-900">{patrimonio}</strong> está atualmente vinculado à{' '}
              <strong className="text-slate-900">{transferPrompt.oldPaCode}</strong>.
            </p>
            <p className="text-xs text-slate-700">
              Deseja desvinculá-lo de <strong className="text-slate-900">{transferPrompt.oldPaCode}</strong> e transferi-lo para a{' '}
              <strong className="text-[#008C50] font-bold">{transferPrompt.newPaCode}</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferPrompt(null)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executeSave(transferPrompt.targetPaId)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#008C50] hover:bg-[#007342] rounded-lg shadow-2xs"
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Categoria Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria do Equipamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Computador', 'Monitor', 'Outros'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      categoria === cat
                        ? 'bg-[#008C50] text-white border-[#008C50] shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Patrimônio & Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número do Patrimônio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={patrimonio}
                  onChange={(e) => setPatrimonio(e.target.value)}
                  placeholder="Ex: 0041200"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50] font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo / Modelo
                </label>
                <select
                  value={tipoNome}
                  onChange={(e) => setTipoNome(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
                >
                  {filteredTypes.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status & PA Vinculada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status do Equipamento
                </label>
                <select
                  value={statusNome}
                  onChange={(e) => setStatusNome(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
                >
                  {equipmentStatuses.filter((s) => s.active).map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.requiresOccurrence ? '(Exige ocorrência)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estação PA Vinculada
                </label>
                <select
                  value={paId || ''}
                  onChange={(e) => setPaId(e.target.value ? e.target.value : null)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
                >
                  <option value="">Sem PA Vinculada (Estoque)</option>
                  {pas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} ({p.tipoNome})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ocorrência Obrigatória */}
            {requiresOccurrence && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-orange-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#ED7203]" />
                  Ocorrência Obrigatória <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={occurrenceDesc}
                  onChange={(e) => setOccurrenceDesc(e.target.value)}
                  placeholder="Informe o motivo da manutenção ou problema técnico do equipamento..."
                  className="w-full text-xs p-2.5 bg-white border border-orange-300 rounded-lg focus:outline-none focus:border-[#ED7203]"
                  required
                />
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações
              </label>
              <textarea
                rows={2}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Observações adicionais..."
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
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
