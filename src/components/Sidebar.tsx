import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Map, Monitor, Boxes, Settings, AlertTriangle } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, hasUnsavedPlanChanges, setHasUnsavedPlanChanges } = useApp();
  const [pendingTab, setPendingTab] = useState<'dashboard' | 'planta' | 'pas' | 'patrimonios' | 'configuracoes' | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planta', label: 'Planta', icon: Map },
    { id: 'pas', label: 'PAs', icon: Monitor },
    { id: 'patrimonios', label: 'Patrimônios', icon: Boxes },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ] as const;

  const handleNavClick = (targetTab: 'dashboard' | 'planta' | 'pas' | 'patrimonios' | 'configuracoes') => {
    if (targetTab === activeTab) return;

    if (activeTab === 'planta' && hasUnsavedPlanChanges) {
      setPendingTab(targetTab);
    } else {
      setActiveTab(targetTab);
    }
  };

  const handleConfirmExitWithoutSaving = () => {
    setHasUnsavedPlanChanges(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  return (
    <>
      <aside className="w-16 md:w-56 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-all select-none">
        <div className="p-3 md:p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:block">
            Navegação
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-[#008C50] text-white shadow-md'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="hidden md:inline truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto p-4 border-t border-slate-800 hidden md:block">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#008C50]" />
              <span className="text-xs font-semibold text-slate-200">Contact Center v1.0</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Planta física & Inventário patrimonial
            </p>
          </div>
        </div>
      </aside>

      {/* MODAL CRÍTICO: Alterações não salvas na Planta */}
      {pendingTab && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Alterações não salvas</h3>
                <p className="text-xs text-amber-700 font-medium">Controle de Alterações Pendentes</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Você possui alterações pendentes na planta. Deseja realmente sair sem salvar?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingTab(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Não, Continuar Editando
              </button>

              <button
                type="button"
                onClick={handleConfirmExitWithoutSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-2xs transition-colors"
              >
                Sim, Sair sem Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
