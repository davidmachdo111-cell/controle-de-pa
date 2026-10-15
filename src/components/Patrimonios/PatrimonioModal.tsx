import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Patrimonio, StatusPatrimonio, TipoPatrimonio } from '../../types';
import { X, Boxes, AlertTriangle } from 'lucide-react';

interface PatrimonioModalProps {
  equipmentToEdit?: Patrimonio | null;
  onClose: () => void;
}

export const PatrimonioModal: React.FC<PatrimonioModalProps> = ({ equipmentToEdit, onClose }) => {
  const { pas, criarPatrimonio, atualizarPatrimonio, vincularPatrimonioAPA, desvincularPatrimonio } = useApp();
  const isEditing = !!equipmentToEdit;

  const [tagTombamento, setTagTombamento] = useState('');
  const [tipo, setTipo] = useState<TipoPatrimonio>('desktop');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [paId, setPaId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusPatrimonio>('estoque');
  const [observacoes, setObservacoes] = useState('');
  const [motivo, setMotivo] = useState('Cadastro inicial de patrimônio');
  const [error, setError] = useState('');

  useEffect(() => {
    if (equipmentToEdit) {
      setTagTombamento(equipmentToEdit.tagTombamento);
      setTipo(equipmentToEdit.tipo);
      setMarca(equipmentToEdit.marca);
      setModelo(equipmentToEdit.modelo);
      setNumeroSerie(equipmentToEdit.numeroSerie);
      setPaId(equipmentToEdit.paId);
      setStatus(equipmentToEdit.status);
      setObservacoes(equipmentToEdit.observacoes || '');
    } else {
      setTagTombamento('');
      setTipo('desktop');
      setMarca('Dell');
      setModelo('');
      setNumeroSerie('');
      setPaId(null);
      setStatus('estoque');
    }
  }, [equipmentToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tagTombamento.trim()) {
      setError('A tag de tombamento é obrigatória.');
      return;
    }

    if (isEditing && equipmentToEdit) {
      const res = atualizarPatrimonio(equipmentToEdit.id, {
        tagTombamento: tagTombamento.trim().toUpperCase(),
        tipo,
        marca: marca.trim(),
        modelo: modelo.trim(),
        numeroSerie: numeroSerie.trim(),
        observacoes: observacoes.trim() || undefined,
        status,
      });

      if (!res.success) {
        setError(res.error || 'Erro ao atualizar.');
        return;
      }

      // Check PA binding change
      if (paId !== equipmentToEdit.paId) {
        if (paId) {
          vincularPatrimonioAPA(equipmentToEdit.id, paId, motivo);
        } else {
          desvincularPatrimonio(equipmentToEdit.id, motivo);
        }
      }
    } else {
      const res = criarPatrimonio(
        {
          tagTombamento: tagTombamento.trim().toUpperCase(),
          tipo,
          marca: marca.trim(),
          modelo: modelo.trim(),
          numeroSerie: numeroSerie.trim(),
          paId,
          status: paId ? 'em_uso' : status,
          observacoes: observacoes.trim() || undefined,
        },
        motivo
      );

      if (!res.success) {
        setError(res.error || 'Erro ao cadastrar.');
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004F4C] text-white flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `Editar ${equipmentToEdit?.tagTombamento}` : 'Cadastrar Novo Patrimônio'}
              </h3>
              <p className="text-xs text-slate-500">Gestão e rastreabilidade de ativos de TI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tag Tombamento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tagTombamento}
                onChange={(e) => setTagTombamento(e.target.value)}
                placeholder="Ex: PAT-1020"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:border-[#004F4C]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo do Ativo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoPatrimonio)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
              >
                <option value="desktop">Desktop</option>
                <option value="notebook">Notebook</option>
                <option value="monitor">Monitor</option>
                <option value="headset">Headset</option>
                <option value="cadeira">Cadeira</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ex: Dell"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo</label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: OptiPlex 7090"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Série</label>
              <input
                type="text"
                value={numeroSerie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                placeholder="Ex: SN-98123"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-[#004F4C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estação PA Alocada</label>
              <select
                value={paId || ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setPaId(val);
                  if (val) setStatus('em_uso');
                  else setStatus('estoque');
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
              >
                <option value="">Sem PA (Em Estoque)</option>
                {pas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} ({p.setor})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusPatrimonio)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
              >
                <option value="em_uso">Em Uso</option>
                <option value="estoque">Estoque</option>
                <option value="defeito">Defeito</option>
                <option value="descartado">Descartado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo / Registro</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Aquisição ou substituição"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Detalhes adicionais do equipamento..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
            />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#004F4C] hover:bg-[#003735] rounded-xl shadow-2xs"
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Patrimônio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
