import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { PlantaView } from './components/Planta/PlantaView';
import { PAListView } from './components/PAs/PAListView';
import { PatrimonioListView } from './components/Patrimonios/PatrimonioListView';
import { ConfiguracoesView } from './components/Configuracoes/ConfiguracoesView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 bg-slate-100 overflow-y-auto">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'planta' && <PlantaView />}
      {activeTab === 'pas' && <PAListView />}
      {activeTab === 'patrimonios' && <PatrimonioListView />}
      {activeTab === 'configuracoes' && <ConfiguracoesView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}
