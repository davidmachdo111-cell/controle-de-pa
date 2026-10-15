import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Shield, Monitor, Cpu, CheckCircle, Plus, Edit, ToggleLeft, ToggleRight, Lock } from 'lucide-react';

export const ConfiguracoesView: React.FC = () => {
  const {
    paTypes,
    paStatuses,
    equipmentTypes,
    equipmentStatuses,
    users,
    currentUser,
    addPAType,
    updatePAType,
    addPAStatus,
    updatePAStatus,
    addEquipmentType,
    updateEquipmentType,
    addEquipmentStatus,
    updateEquipmentStatus,
    addUser,
    updateUser,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pa' | 'eq' | 'users'>('pa');

  // Input states for new entries
  const [newPAType, setNewPAType] = useState('');
  const [newPAStatus, setNewPAStatus] = useState('');
  const [newPAStatusReq, setNewPAStatusReq] = useState(false);
  const [newPAStatusColor, setNewPAStatusColor] = useState('#008C50');

  const [newEqType, setNewEqType] = useState('');
  const [newEqCategory, setNewEqCategory] = useState<'Computador' | 'Monitor' | 'Outros'>('Computador');

  const [newEqStatus, setNewEqStatus] = useState('');
  const [newEqStatusReq, setNewEqStatusReq] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Administrador' | 'Visualização'>('Visualização');

  if (currentUser.role !== 'Administrador') {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Acesso Restrito às Configurações</h2>
        <p className="text-sm text-slate-500">
          Esta área é restrita a usuários com perfil de <strong>Administrador</strong>.
          Utilize o seletor de perfil no topo da tela para alterar seu modo de acesso.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Configurações do Sistema</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Administração de tipos de PA, status, ocorrências e perfis de usuários
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-100 pb-1">
          <button
            onClick={() => setActiveSubTab('pa')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'pa' ? 'bg-[#008C50] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>PAs (Tipos & Status)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('eq')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'eq' ? 'bg-[#008C50] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Equipamentos (Tipos & Status)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeSubTab === 'users' ? 'bg-[#008C50] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Usuários & Acesso</span>
          </button>
        </div>
      </div>

      {/* 1. SUB-TAB: PAs */}
      {activeSubTab === 'pa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipos de PA */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Tipos de PA</h3>

            {/* Add form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPAType.trim()) {
                  addPAType(newPAType.trim());
                  setNewPAType('');
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newPAType}
                onChange={(e) => setNewPAType(e.target.value)}
                placeholder="Novo tipo de PA (ex: Treinamento)"
                className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#008C50] hover:bg-[#007342] text-white text-xs font-bold rounded-xl shrink-0"
              >
                Adicionar
              </button>
            </form>

            <div className="space-y-2">
              {paTypes.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <span className={`text-xs font-semibold ${t.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                    {t.name}
                  </span>
                  <button
                    onClick={() => updatePAType(t.id, { active: !t.active })}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                  >
                    {t.active ? (
                      <span className="text-[#008C50] font-bold">Ativo</span>
                    ) : (
                      <span className="text-slate-400">Desativado</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status de PA */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Status de PA</h3>

            {/* Add form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPAStatus.trim()) {
                  addPAStatus(newPAStatus.trim(), newPAStatusReq, newPAStatusColor);
                  setNewPAStatus('');
                  setNewPAStatusReq(false);
                }
              }}
              className="space-y-3"
            >
              <input
                type="text"
                value={newPAStatus}
                onChange={(e) => setNewPAStatus(e.target.value)}
                placeholder="Novo status (ex: Aguardando TI)"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPAStatusReq}
                    onChange={(e) => setNewPAStatusReq(e.target.checked)}
                    className="rounded text-[#008C50] focus:ring-[#008C50]"
                  />
                  <span>Exige ocorrência obrigatória?</span>
                </label>

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#008C50] hover:bg-[#007342] text-white text-xs font-bold rounded-xl"
                >
                  Adicionar Status
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {paStatuses.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className={`text-xs font-bold ${s.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                        {s.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {s.requiresOccurrence ? 'Exige descrição de ocorrência' : 'Não exige ocorrência'}
                    </p>
                  </div>

                  <button
                    onClick={() => updatePAStatus(s.id, { requiresOccurrence: !s.requiresOccurrence })}
                    className={`text-[10px] font-bold px-2 py-1 rounded ${
                      s.requiresOccurrence ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.requiresOccurrence ? 'Exige Ocorrência' : 'Livre'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUB-TAB: Equipamentos */}
      {activeSubTab === 'eq' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipos de Equipamento */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Tipos de Equipamento</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newEqType.trim()) {
                  addEquipmentType(newEqType.trim(), newEqCategory);
                  setNewEqType('');
                }
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newEqType}
                  onChange={(e) => setNewEqType(e.target.value)}
                  placeholder="Nome do tipo/modelo"
                  className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
                />

                <select
                  value={newEqCategory}
                  onChange={(e) => setNewEqCategory(e.target.value as any)}
                  className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
                >
                  <option value="Computador">Computador</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#008C50] hover:bg-[#007342] text-white text-xs font-bold rounded-xl"
                >
                  Adicionar Tipo
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {equipmentTypes.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">{t.category}</span>
                  </div>

                  <button
                    onClick={() => updateEquipmentType(t.id, { active: !t.active })}
                    className="text-xs font-semibold text-[#008C50]"
                  >
                    {t.active ? 'Ativo' : 'Desativado'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Status de Equipamento */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Status de Equipamento</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newEqStatus.trim()) {
                  addEquipmentStatus(newEqStatus.trim(), newEqStatusReq);
                  setNewEqStatus('');
                  setNewEqStatusReq(false);
                }
              }}
              className="space-y-3"
            >
              <input
                type="text"
                value={newEqStatus}
                onChange={(e) => setNewEqStatus(e.target.value)}
                placeholder="Novo status (ex: Em Garantia)"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#008C50]"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEqStatusReq}
                    onChange={(e) => setNewEqStatusReq(e.target.checked)}
                    className="rounded text-[#008C50] focus:ring-[#008C50]"
                  />
                  <span>Exige ocorrência?</span>
                </label>

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#008C50] hover:bg-[#007342] text-white text-xs font-bold rounded-xl"
                >
                  Adicionar
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {equipmentStatuses.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{s.name}</span>
                    <p className="text-[11px] text-slate-500">
                      {s.requiresOccurrence ? 'Exige descrição' : 'Livre'}
                    </p>
                  </div>

                  <button
                    onClick={() => updateEquipmentStatus(s.id, { requiresOccurrence: !s.requiresOccurrence })}
                    className={`text-[10px] font-bold px-2 py-1 rounded ${
                      s.requiresOccurrence ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.requiresOccurrence ? 'Exige Ocorrência' : 'Livre'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: Usuários */}
      {activeSubTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Usuários e Perfis de Acesso</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newUsername.trim() && newName.trim()) {
                addUser(newUsername.trim(), newName.trim(), newRole);
                setNewUsername('');
                setNewName('');
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Usuário / Login</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Ex: gestor2"
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#008C50]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#008C50]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil de Acesso</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#008C50]"
              >
                <option value="Administrador">Administrador</option>
                <option value="Visualização">Visualização</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-[#008C50] hover:bg-[#007342] text-white text-xs font-bold rounded-lg shadow-2xs"
              >
                Criar Usuário
              </button>
            </div>
          </form>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{u.name}</span>
                    <span className="text-[11px] font-mono text-slate-500">(@{u.username})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Senha padrão: <strong className="font-mono">123</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      u.role === 'Administrador' ? 'bg-[#008C50]/15 text-[#008C50]' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {u.role}
                  </span>

                  <button
                    onClick={() => updateUser(u.id, { role: u.role === 'Administrador' ? 'Visualização' : 'Administrador' })}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
                  >
                    Alternar Perfil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
