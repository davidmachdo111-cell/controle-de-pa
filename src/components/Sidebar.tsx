import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Map, Monitor, Boxes, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planta', label: 'Planta', icon: Map },
    { id: 'pas', label: 'PAs', icon: Monitor },
    { id: 'patrimonios', label: 'Patrimônios', icon: Boxes },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ] as const;

  return (
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
              onClick={() => setActiveTab(item.id)}
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
  );
};
