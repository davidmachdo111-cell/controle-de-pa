import React from 'react';
import { useApp } from '../../context/AppContext';
import { Monitor, Cpu, Tv, AlertTriangle, Link2Off, ArrowUpRight } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { pas, equipments, setActiveTab, setActivePAFilter, setActivePatrimonioFilter } = useApp();

  // 1. Calculations for PAs de Operação
  const pasOperacao = pas.filter((p) => p.tipoNome === 'PA de Operação');
  const pasOperacaoTotal = pasOperacao.length;
  const pasOperacaoAtivas = pasOperacao.filter((p) => p.statusNome === 'Ativo').length;
  const pasOperacaoManutencao = pasOperacao.filter((p) => p.statusNome === 'Manutenção').length;
  const pasOperacaoInativas = pasOperacao.filter((p) => p.statusNome === 'Inativo').length;

  // 2. Calculations for Total PAs by type
  const pasTotal = pas.length;
  const pasLideranca = pas.filter((p) => p.tipoNome === 'PA de Liderança').length;
  const pasOutros = pas.filter((p) => p.tipoNome === 'Outros' || (p.tipoNome !== 'PA de Operação' && p.tipoNome !== 'PA de Liderança')).length;

  // 3. Computadores calculations
  const computers = equipments.filter((e) => e.categoria === 'Computador');
  const computersTotal = computers.length;
  const tcAntigo = computers.filter((c) => c.tipoNome.includes('Antigo')).length;
  const tcNovo = computers.filter((c) => c.tipoNome.includes('Novo')).length;
  const microCount = computers.filter((c) => c.tipoNome.includes('Micro')).length;

  // 4. Monitores calculations
  const monitors = equipments.filter((e) => e.categoria === 'Monitor');
  const monitorsTotal = monitors.length;

  const pas1Monitor = pas.filter((p) => p.monitorIds.length === 1).length;
  const pas2Monitores = pas.filter((p) => p.monitorIds.length === 2).length;
  const pasOutroMonitores = pas.filter((p) => p.monitorIds.length !== 1 && p.monitorIds.length !== 2).length;

  // 5. Pendências calculations
  const pasEmManutencao = pas.filter((p) => p.statusNome === 'Manutenção');
  const eqEmManutencao = equipments.filter((e) => e.statusNome === 'Manutenção');

  // 6. Equipamentos sem PA
  const eqSemPA = equipments.filter((e) => e.paId === null);

  // Click handlers
  const handleFilterPAOperacao = (status?: string) => {
    setActivePAFilter({ type: 'PA de Operação', status });
    setActiveTab('pas');
  };

  const handleFilterPAType = (type?: string) => {
    setActivePAFilter({ type });
    setActiveTab('pas');
  };

  const handleFilterComputer = (tipoNome?: string) => {
    setActivePatrimonioFilter({ categoria: 'Computador' });
    setActiveTab('patrimonios');
  };

  const handleFilterMonitors = (monitorCount?: number) => {
    setActivePAFilter({ monitorCount });
    setActiveTab('pas');
  };

  const handleFilterPendencias = () => {
    setActivePAFilter({ status: 'Manutenção' });
    setActiveTab('pas');
  };

  const handleFilterSemPA = () => {
    setActivePatrimonioFilter({ semPa: true });
    setActiveTab('patrimonios');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Visão Geral do Contact Center</h2>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhamento em tempo real das PAs de operação, equipamentos e pendências
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('planta')}
            className="px-4 py-2 bg-[#004F4C] hover:bg-[#003c3a] text-white font-medium text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2"
          >
            <span>Ver Planta Baixa</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. PRINCIPAL DESTAQUE — PAs de Operação */}
      <div className="bg-gradient-to-br from-[#004F4C] to-[#003836] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <Monitor className="w-6 h-6 text-[#BBCF33]" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Destaque Operacional</span>
              <h3 className="text-lg font-bold text-white">PAs de Operação</h3>
            </div>
          </div>
          <button
            onClick={() => handleFilterPAOperacao()}
            className="text-xs text-[#BBCF33] hover:underline font-medium flex items-center gap-1"
          >
            <span>Ver todas as PAs de operação</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Total */}
          <div
            onClick={() => handleFilterPAOperacao()}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/10 rounded-xl p-4 cursor-pointer transition-all"
          >
            <div className="text-xs font-medium text-slate-300">Total Operação</div>
            <div className="text-3xl font-extrabold text-white mt-1 tabular-nums">{pasOperacaoTotal}</div>
            <div className="text-[11px] text-slate-300 mt-2 font-medium">Estações de atendimento</div>
          </div>

          {/* Ativas */}
          <div
            onClick={() => handleFilterPAOperacao('Ativo')}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/10 rounded-xl p-4 cursor-pointer transition-all"
          >
            <div className="text-xs font-medium text-[#BBCF33]">PAs Ativas</div>
            <div className="text-3xl font-extrabold text-white mt-1 tabular-nums">{pasOperacaoAtivas}</div>
            <div className="text-[11px] text-slate-300 mt-2 font-medium">Disponíveis para turno</div>
          </div>

          {/* Manutenção */}
          <div
            onClick={() => handleFilterPAOperacao('Manutenção')}
            className="bg-[#ED7203]/20 hover:bg-[#ED7203]/30 backdrop-blur-xs border border-[#ED7203]/40 rounded-xl p-4 cursor-pointer transition-all"
          >
            <div className="text-xs font-medium text-[#ED7203]">Em Manutenção</div>
            <div className="text-3xl font-extrabold text-[#ED7203] mt-1 tabular-nums">{pasOperacaoManutencao}</div>
            <div className="text-[11px] text-orange-200 mt-2 font-medium">Requer atenção imediata</div>
          </div>

          {/* Inativas */}
          <div
            onClick={() => handleFilterPAOperacao('Inativo')}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/10 rounded-xl p-4 cursor-pointer transition-all"
          >
            <div className="text-xs font-medium text-slate-300">PAs Inativas</div>
            <div className="text-3xl font-extrabold text-white mt-1 tabular-nums">{pasOperacaoInativas}</div>
            <div className="text-[11px] text-slate-300 mt-2 font-medium">Desativadas/Reserva</div>
          </div>
        </div>
      </div>

      {/* Grid of 4 Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 2. Segundo Bloco — PAs */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Monitor className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Distribuição de PAs</h4>
              </div>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">{pasTotal}</span>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleFilterPAType('PA de Operação')}
                className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-600 font-medium">Operação</span>
                <span className="font-bold text-slate-900 tabular-nums">{pasOperacaoTotal}</span>
              </button>

              <button
                onClick={() => handleFilterPAType('PA de Liderança')}
                className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-600 font-medium">Liderança</span>
                <span className="font-bold text-slate-900 tabular-nums">{pasLideranca}</span>
              </button>

              <button
                onClick={() => handleFilterPAType('Outros')}
                className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-600 font-medium">Outros / Apoio</span>
                <span className="font-bold text-slate-900 tabular-nums">{pasOutros}</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => handleFilterPAType()}
            className="mt-4 text-xs font-semibold text-[#008C50] hover:underline flex items-center gap-1 pt-3 border-t border-slate-100"
          >
            <span>Ver todas as PAs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. Terceiro Bloco — Computadores */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Computadores</h4>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">{computersTotal}</span>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleFilterComputer('Thin Client Novo')}
                className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-600 font-medium">Thin Client Novo</span>
                <span className="font-bold text-slate-900 tabular-nums">{tcNovo}</span>
              </button>

              <button
                onClick={() => handleFilterComputer('Thin Client Antigo')}
                className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-600 font-medium">Thin Client Antigo</span>
                <span className="font-bold text-slate-900 tabular-nums">{tcAntigo}</span>
              </button>

              <button
                onClick={() => handleFilterComputer('Micro')}
                className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-600 font-medium">Micro / Desktop</span>
                <span className="font-bold text-slate-900 tabular-nums">{microCount}</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => handleFilterComputer()}
            className="mt-4 text-xs font-semibold text-[#008C50] hover:underline flex items-center gap-1 pt-3 border-t border-slate-100"
          >
            <span>Ver inventário de PCs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. Quarto Bloco — Monitores */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                  <Tv className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Monitores</h4>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">{monitorsTotal}</span>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => handleFilterMonitors(2)}
                className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-600 font-medium">PAs com 2 monitores</span>
                <span className="font-bold text-slate-900 tabular-nums">{pas2Monitores}</span>
              </button>

              <button
                onClick={() => handleFilterMonitors(1)}
                className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-600 font-medium">PAs com 1 monitor</span>
                <span className="font-bold text-slate-900 tabular-nums">{pas1Monitor}</span>
              </button>

              {pasOutroMonitores > 0 && (
                <button
                  onClick={() => handleFilterMonitors(0)}
                  className="w-full flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-600 font-medium">PAs sem monitor</span>
                  <span className="font-bold text-slate-900 tabular-nums">{pasOutroMonitores}</span>
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setActivePatrimonioFilter({ categoria: 'Monitor' });
              setActiveTab('patrimonios');
            }}
            className="mt-4 text-xs font-semibold text-[#008C50] hover:underline flex items-center gap-1 pt-3 border-t border-slate-100"
          >
            <span>Ver inventário de Monitores</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 & 6. Pendências e Equipamentos sem PA */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#ED7203]">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Pendências & Estoque</h4>
            </div>

            <div className="space-y-3">
              {/* Pendências */}
              <button
                onClick={handleFilterPendencias}
                className="w-full text-left p-2.5 bg-orange-50/70 hover:bg-orange-100/70 rounded-xl border border-orange-200/60 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-orange-950">PAs em Manutenção</div>
                  <div className="text-[11px] text-orange-800 mt-0.5">Ocorrência ativa requer atenção</div>
                </div>
                <span className="text-lg font-extrabold text-[#ED7203] tabular-nums">{pasEmManutencao.length}</span>
              </button>

              {/* Equipamentos sem PA */}
              <button
                onClick={handleFilterSemPA}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">Equipamentos Sem PA</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Estoque ou aguardando alocação</div>
                </div>
                <span className="text-lg font-extrabold text-slate-800 tabular-nums">{eqSemPA.length}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Ação recomendada</span>
            <span className="font-semibold text-slate-700">{eqEmManutencao.length} equipamentos c/ defeito</span>
          </div>
        </div>
      </div>

      {/* Critical Pendências Banner / List */}
      {pasEmManutencao.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ED7203]" />
              <h3 className="text-base font-bold text-slate-900">Resumo de Ocorrências e Manutenções Ativas</h3>
            </div>
            <button
              onClick={handleFilterPendencias}
              className="text-xs font-semibold text-[#008C50] hover:underline"
            >
              Ver todas na lista
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pasEmManutencao.map((pa) => (
              <div
                key={pa.id}
                onClick={() => {
                  setActiveTab('planta');
                  useApp().setHighlightedPAId(pa.id);
                }}
                className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-200/70 hover:border-orange-300 cursor-pointer transition-all flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{pa.code}</span>
                    <span className="text-[10px] bg-[#ED7203] text-white px-1.5 py-0.5 rounded font-medium">Manutenção</span>
                    <span className="text-xs text-slate-500">{pa.tipoNome}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1.5 line-clamp-2">
                    {pa.observacoes || 'Status alterado para manutenção.'}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#004F4C] shrink-0 hover:underline">Ver no mapa</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
