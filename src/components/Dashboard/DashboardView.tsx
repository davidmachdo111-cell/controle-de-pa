import React from 'react';
import { useApp } from '../../context/AppContext';
import { Monitor, Cpu, Tv, AlertTriangle, ArrowUpRight, Boxes, CheckCircle2, Map } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { pas, patrimonios, setActiveTab, setSelectedPAId } = useApp();

  const paTotal = pas.length;
  const paDisponivel = pas.filter((p) => p.status === 'disponivel').length;
  const paOcupada = pas.filter((p) => p.status === 'ocupado').length;
  const paManutencao = pas.filter((p) => p.status === 'manutencao').length;
  const paDesativada = pas.filter((p) => p.status === 'desativado').length;

  const patTotal = patrimonios.length;
  const patEmUso = patrimonios.filter((p) => p.status === 'em_uso').length;
  const patEstoque = patrimonios.filter((p) => p.status === 'estoque').length;
  const patDefeito = patrimonios.filter((p) => p.status === 'defeito').length;

  const desktops = patrimonios.filter((p) => p.tipo === 'desktop').length;
  const notebooks = patrimonios.filter((p) => p.tipo === 'notebook').length;
  const monitores = patrimonios.filter((p) => p.tipo === 'monitor').length;
  const headsets = patrimonios.filter((p) => p.tipo === 'headset').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Visão Geral de Infraestrutura & Patrimônios</h2>
          <p className="text-sm text-slate-500 mt-1">
            Painel consolidado em tempo real integrado à Planta Baixa
          </p>
        </div>
        <button
          onClick={() => setActiveTab('planta')}
          className="px-4 py-2 bg-[#004F4C] hover:bg-[#003836] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2"
        >
          <Map className="w-4 h-4" />
          <span>Ver Planta Baixa Interativa</span>
        </button>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('pas')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs cursor-pointer hover:border-[#004F4C] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Estações PAs</span>
            <Monitor className="w-5 h-5 text-[#004F4C]" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{paTotal}</div>
          <p className="text-[11px] text-slate-500 mt-1">Cadastradas no mapa</p>
        </div>

        <div
          onClick={() => setActiveTab('pas')}
          className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-2xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">PAs Livres (Disponíveis)</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono">{paDisponivel}</div>
          <p className="text-[11px] text-emerald-800 mt-1">Prontas para alocação</p>
        </div>

        <div
          onClick={() => setActiveTab('pas')}
          className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 shadow-2xs cursor-pointer hover:border-blue-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">PAs Ocupadas</span>
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700 mt-2 font-mono">{paOcupada}</div>
          <p className="text-[11px] text-blue-800 mt-1">Com usuário alocado</p>
        </div>

        <div
          onClick={() => setActiveTab('pas')}
          className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 shadow-2xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">PAs em Manutenção</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-700 mt-2 font-mono">{paManutencao}</div>
          <p className="text-[11px] text-amber-800 mt-1">Aguardando reparo técnico</p>
        </div>
      </div>

      {/* Patrimônios Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#004F4C]" />
              Status de Patrimônios
            </h3>
            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              {patTotal}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Em Uso nas PAs</span>
              <span className="font-mono font-bold text-emerald-600">{patEmUso}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">No Estoque</span>
              <span className="font-mono font-bold text-blue-600">{patEstoque}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Com Defeito</span>
              <span className="font-mono font-bold text-amber-600">{patDefeito}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Tipos de Equipamento
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Desktops</span>
              <span className="font-mono font-bold text-slate-900">{desktops}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Notebooks</span>
              <span className="font-mono font-bold text-slate-900">{notebooks}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Monitores</span>
              <span className="font-mono font-bold text-slate-900">{monitores}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Headsets</span>
              <span className="font-mono font-bold text-slate-900">{headsets}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Ações Recomendadas
            </h3>
          </div>

          <div className="space-y-2.5">
            {paManutencao > 0 && (
              <div
                onClick={() => setActiveTab('planta')}
                className="p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100/80 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-amber-950">{paManutencao} PA(s) em Manutenção</div>
                  <div className="text-[11px] text-amber-800">Verifique na planta baixa interativa</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-700" />
              </div>
            )}

            <div
              onClick={() => setActiveTab('patrimonios')}
              className="p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer hover:bg-blue-100/80 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-blue-950">{patEstoque} Equipamentos no Estoque</div>
                <div className="text-[11px] text-blue-800">Prontos para vínculo e alocação</div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
