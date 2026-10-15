import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PA, PAStatus } from '../../types';
import { X, Monitor, UserCheck, Phone, Shield } from 'lucide-react';

interface PAModalProps {
  paToEdit?: PA | null;
  onClose: () => void;
}

export const PAModal: React.FC<PAModalProps> = ({ paToEdit, onClose }) => {
  const { criarPANaPlanta, atualizarPA, pas } = useApp();
  const isEditing = !!paToEdit;

  const [codigo, setCodigo] = useState('');
  const [setor, setSetor] = useState('Operação A');
  const [status, setStatus] = useState<PAStatus>('disponivel');
  const [usuarioAtual, setUsuarioAtual] = useState('');
  const [ramal, setRamal] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (paToEdit) {
      setCodigo(paToEdit.codigo);
      setSetor(paToEdit.setor);
      setStatus(paToEdit.status);
      setUsuarioAtual(paToEdit.usuarioAtual || '');
      setRamal(paToEdit.ramal || '');
    } else {
      let max = 0;
      pas.forEach((p) => {
        const match = p.codigo.match(/PA-(\d+)/i);
        if (match) {
          const v = parseInt(match[1], 10);
          if (v > max) max = v;
        }
      });
      setCodigo(`PA-${String(max + 1).padStart(2, '0')}`);
      setSetor('Operação A');
      setStatus('disponivel');
    }
  }, [paToEdit, pas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!codigo.trim()) {
      setError('O código da PA é obrigatório.');
      return;
    }

    if (isEditing && paToEdit) {
      const res = atualizarPA(paToEdit.id, {
        codigo: codigo.trim().toUpperCase(),
        setor,
        status,
        usuarioAtual: usuarioAtual.trim() || undefined,
        ramal: ramal.trim() || undefined,
      });
      if (!res.success) {
        setError(res.error || 'Erro ao atualizar.');
        return;
      }
    } else {
      criarPANaPlanta(200, 200, {
        codigo: codigo.trim().toUpperCase(),
        setor,
        status,
        usuarioAtual: usuarioAtual.trim() || undefined,
        ramal: ramal.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004F4C] text-white flex items-center justify-center font-bold">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? `Editar ${paToEdit?.codigo}` : 'Cadastrar Nova PA'}
              </h3>
              <p className="text-xs text-slate-500">Posto de Atendimento Físico</p>
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
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: PA-01"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#004F4C]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Setor</label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
              >
                <option value="Operação A">Operação A</option>
                <option value="Operação B">Operação B</option>
                <option value="Liderança">Liderança</option>
                <option value="TI & Suporte">TI & Suporte</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status do Posto</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PAStatus)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
            >
              <option value="disponivel">Disponível (Verde)</option>
              <option value="ocupado">Ocupada (Azul)</option>
              <option value="manutencao">Manutenção (Amarelo)</option>
              <option value="desativado">Desativada (Cinza)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Usuário Alocado</label>
              <input
                type="text"
                value={usuarioAtual}
                onChange={(e) => setUsuarioAtual(e.target.value)}
                placeholder="Ex: Agente Carlos"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ramal</label>
              <input
                type="text"
                value={ramal}
                onChange={(e) => setRamal(e.target.value)}
                placeholder="Ex: 4012"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#004F4C]"
              />
            </div>
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
              {isEditing ? 'Salvar Alterações' : 'Cadastrar PA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
