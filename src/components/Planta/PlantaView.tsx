import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FloorObject, PA } from '../../types';
import { PADetailDrawer } from './PADetailDrawer';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Edit3,
  Eye,
  Check,
  RotateCcw,
  Grid,
  Trash2,
  Plus,
  Square,
  Maximize,
  RotateCw,
  AlignLeft,
  AlignCenter,
  Save,
  AlertCircle,
  Monitor,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

export const PlantaView: React.FC = () => {
  const {
    pas,
    equipments,
    floorObjects,
    updateFloorObjects,
    addPAToMap,
    removePAFromMap,
    currentUser,
    highlightedPAId,
    setHighlightedPAId,
  } = useApp();

  // Mode: 'view' | 'edit'
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // Selected PA for drawer
  const [selectedDrawerPA, setSelectedDrawerPA] = useState<PA | null>(null);

  // Auto open drawer if highlightedPAId set
  useEffect(() => {
    if (highlightedPAId) {
      const targetPA = pas.find((p) => p.id === highlightedPAId);
      if (targetPA) {
        setSelectedDrawerPA(targetPA);
      }
    }
  }, [highlightedPAId, pas]);

  // Viewport Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Editor State
  const [localObjects, setLocalObjects] = useState<FloorObject[]>([]);
  const [selectedObjIds, setSelectedObjIds] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [activeTool, setActiveTool] = useState<'select' | 'parede' | 'area' | 'porta' | 'mesa' | 'armario' | 'texto' | 'pa'>('select');
  const [showAddPAModal, setShowAddPAModal] = useState(false);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<FloorObject[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Sync floorObjects from context when entering edit or on mount
  useEffect(() => {
    setLocalObjects(floorObjects);
    setHistory([floorObjects]);
    setHistoryStep(0);
    setHasUnsavedChanges(false);
  }, [floorObjects, mode]);

  // Push state to undo history
  const pushHistoryState = (newObjs: FloorObject[]) => {
    const newHist = history.slice(0, historyStep + 1);
    setHistory([...newHist, newObjs]);
    setHistoryStep(newHist.length);
    setLocalObjects(newObjs);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setLocalObjects(history[historyStep - 1]);
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setLocalObjects(history[historyStep + 1]);
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveChanges = () => {
    updateFloorObjects(localObjects);
    setHasUnsavedChanges(false);
  };

  const handleDiscardChanges = () => {
    setLocalObjects(floorObjects);
    setHasUnsavedChanges(false);
    setSelectedObjIds([]);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Dragging / Panning on SVG
  const handleMouseDownSVG = (e: React.MouseEvent) => {
    if (mode === 'view' || activeTool === 'select') {
      if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'bg-grid') {
        setIsPanning(true);
        setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        setSelectedObjIds([]);
      }
    }
  };

  const handleMouseMoveSVG = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUpSVG = () => {
    setIsPanning(false);
  };

  // Snap coordinate helper
  const snap = (val: number) => (snapToGrid ? Math.round(val / 20) * 20 : val);

  // Object dragging in Edit mode
  const [draggingObjId, setDraggingObjId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleObjectMouseDown = (e: React.MouseEvent, objId: string) => {
    e.stopPropagation();
    if (mode === 'view') {
      const clickedObj = localObjects.find((o) => o.id === objId);
      if (clickedObj?.category === 'pa' && clickedObj.paCode) {
        const foundPA = pas.find((p) => p.code === clickedObj.paCode);
        if (foundPA) {
          setSelectedDrawerPA(foundPA);
        }
      }
      return;
    }

    if (mode === 'edit' && activeTool === 'select') {
      if (e.shiftKey) {
        setSelectedObjIds((prev) => (prev.includes(objId) ? prev.filter((id) => id !== objId) : [...prev, objId]));
      } else {
        if (!selectedObjIds.includes(objId)) {
          setSelectedObjIds([objId]);
        }
      }

      const targetObj = localObjects.find((o) => o.id === objId);
      if (targetObj) {
        setDraggingObjId(objId);
        setDragOffset({ x: e.clientX - targetObj.x, y: e.clientY - targetObj.y });
      }
    }
  };

  const handleObjectMouseMove = (e: React.MouseEvent) => {
    if (mode === 'edit' && draggingObjId) {
      const newX = snap(e.clientX - dragOffset.x);
      const newY = snap(e.clientY - dragOffset.y);

      const updated = localObjects.map((o) => {
        if (o.id === draggingObjId) {
          return { ...o, x: newX, y: newY };
        }
        return o;
      });

      setLocalObjects(updated);
    }
  };

  const handleObjectMouseUp = () => {
    if (mode === 'edit' && draggingObjId) {
      setDraggingObjId(null);
      pushHistoryState(localObjects);
    }
  };

  // Tool actions: Adding elements
  const handleAddObject = (type: FloorObject['type']) => {
    const newId = `flobj-${Date.now()}`;
    let newObj: FloorObject = {
      id: newId,
      category: 'mobiliario',
      type,
      name: `Novo ${type}`,
      x: 300,
      y: 300,
      width: 100,
      height: 60,
      rotation: 0,
    };

    if (type === 'parede') {
      newObj.category = 'estrutura';
      newObj.width = 200;
      newObj.height = 8;
      newObj.stroke = '#004F4C';
    } else if (type === 'area') {
      newObj.category = 'ambiente';
      newObj.width = 250;
      newObj.height = 180;
      newObj.fill = 'rgba(0, 140, 80, 0.05)';
      newObj.stroke = '#008C50';
    } else if (type === 'porta') {
      newObj.category = 'estrutura';
      newObj.width = 60;
      newObj.height = 10;
      newObj.fill = '#ED7203';
    } else if (type === 'armario') {
      newObj.category = 'mobiliario';
      newObj.width = 60;
      newObj.height = 40;
    } else if (type === 'texto') {
      newObj.category = 'identificacao';
      newObj.width = 120;
      newObj.height = 30;
      newObj.name = 'Texto / Rótulo';
    }

    pushHistoryState([...localObjects, newObj]);
    setSelectedObjIds([newId]);
    setActiveTool('select');
  };

  // Rotate selected objects 90 degrees
  const handleRotateSelected = () => {
    if (selectedObjIds.length === 0) return;
    const updated = localObjects.map((o) => {
      if (selectedObjIds.includes(o.id)) {
        return { ...o, rotation: (o.rotation + 90) % 360 };
      }
      return o;
    });
    pushHistoryState(updated);
  };

  // Delete selected objects from map (Preserves PA entity in database!)
  const handleDeleteSelected = () => {
    if (selectedObjIds.length === 0) return;
    const updated = localObjects.filter((o) => !selectedObjIds.includes(o.id));
    pushHistoryState(updated);
    setSelectedObjIds([]);
  };

  // Align helpers
  const handleAlign = (alignment: 'left' | 'center' | 'top' | 'bottom') => {
    if (selectedObjIds.length < 2) return;
    const selectedObjs = localObjects.filter((o) => selectedObjIds.includes(o.id));

    let targetVal = 0;
    if (alignment === 'left') targetVal = Math.min(...selectedObjs.map((o) => o.x));
    if (alignment === 'top') targetVal = Math.min(...selectedObjs.map((o) => o.y));

    const updated = localObjects.map((o) => {
      if (selectedObjIds.includes(o.id)) {
        if (alignment === 'left') return { ...o, x: targetVal };
        if (alignment === 'top') return { ...o, y: targetVal };
      }
      return o;
    });

    pushHistoryState(updated);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden relative select-none">
      {/* Top Bar Controls */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-2xs">
        {/* Left: View/Edit Toggle & Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                if (hasUnsavedChanges && !window.confirm('Existem alterações não salvas. Deseja descartar?')) return;
                setMode('view');
                setSelectedObjIds([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mode === 'view' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#008C50]" />
              <span>Visualizar</span>
            </button>

            {currentUser.role === 'Administrador' && (
              <button
                onClick={() => setMode('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mode === 'edit' ? 'bg-[#004F4C] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Planta</span>
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium pl-2 border-l border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008C50]" />
            <span>PA Ativa</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ED7203] ml-2" />
            <span>Em Manutenção (•)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ml-2" />
            <span>Inativa</span>
          </div>
        </div>

        {/* Right: Save / Discard Bar or View Controls */}
        {mode === 'edit' ? (
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Alterações não salvas</span>
              </div>
            )}

            <button
              onClick={handleDiscardChanges}
              disabled={!hasUnsavedChanges}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 rounded-lg transition-colors"
            >
              Descartar
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges}
              className="px-4 py-1.5 bg-[#008C50] hover:bg-[#007342] text-white text-xs font-bold rounded-lg shadow-2xs disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Zoom: {Math.round(zoom * 100)}%</span>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button onClick={handleZoomOut} className="p-1.5 hover:bg-white text-slate-700 rounded-md" title="Diminuir Zoom">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleResetZoom} className="p-1.5 hover:bg-white text-slate-700 rounded-md" title="Resetar Visualização">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleZoomIn} className="p-1.5 hover:bg-white text-slate-700 rounded-md" title="Aumentar Zoom">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas Area + Drawer */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Editor Floating Toolbar (Edit mode only) */}
        {mode === 'edit' && (
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-1 w-48">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Ferramentas</div>

            <button
              onClick={() => setActiveTool('select')}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTool === 'select' ? 'bg-[#004F4C] text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Selecionar</span>
            </button>

            <button
              onClick={() => handleAddObject('parede')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <Square className="w-3.5 h-3.5 text-[#004F4C]" />
              <span>Parede</span>
            </button>

            <button
              onClick={() => handleAddObject('area')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <Square className="w-3.5 h-3.5 text-[#008C50]" />
              <span>Área / Sala</span>
            </button>

            <button
              onClick={() => handleAddObject('porta')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <Square className="w-3.5 h-3.5 text-[#ED7203]" />
              <span>Porta</span>
            </button>

            <button
              onClick={() => handleAddObject('mesa')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <Square className="w-3.5 h-3.5 text-slate-600" />
              <span>Mesa / Bancada</span>
            </button>

            <button
              onClick={() => handleAddObject('armario')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <Square className="w-3.5 h-3.5 text-amber-800" />
              <span>Armário</span>
            </button>

            <button
              onClick={() => setShowAddPAModal(true)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-[#008C50]/10 hover:bg-[#008C50]/20 text-[#008C50] rounded-xl text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar PA</span>
            </button>

            <div className="pt-2 mt-1 border-t border-slate-100 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Ações</div>

              <div className="flex items-center gap-1 px-1">
                <button
                  onClick={handleRotateSelected}
                  disabled={selectedObjIds.length === 0}
                  className="p-1.5 hover:bg-slate-100 disabled:opacity-30 rounded-lg text-slate-700"
                  title="Girar 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedObjIds.length === 0}
                  className="p-1.5 hover:bg-red-50 text-red-600 disabled:opacity-30 rounded-lg"
                  title="Remover da planta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleUndo}
                  disabled={historyStep <= 0}
                  className="p-1.5 hover:bg-slate-100 disabled:opacity-30 rounded-lg text-slate-700"
                  title="Desfazer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded-lg ${showGrid ? 'bg-slate-200 text-slate-900' : 'text-slate-400'}`}
                  title="Alternar Grade"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SVG Interactive Canvas */}
        <div
          className="flex-1 h-full w-full overflow-hidden bg-slate-50 cursor-grab active:cursor-grabbing relative"
          onMouseDown={handleMouseDownSVG}
          onMouseMove={(e) => {
            handleMouseMoveSVG(e);
            handleObjectMouseMove(e);
          }}
          onMouseUp={() => {
            handleMouseUpSVG();
            handleObjectMouseUp();
          }}
        >
          <svg
            id="bg-grid"
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
              </pattern>
            </defs>

            {showGrid && <rect width="2000" height="1500" fill="url(#gridPattern)" />}

            {/* Render Floor Objects */}
            {localObjects.map((obj) => {
              const isSelected = selectedObjIds.includes(obj.id);
              const isPA = obj.category === 'pa' || obj.type === 'pa';
              const paObj = isPA ? pas.find((p) => p.code === obj.paCode) : null;
              const isHighlighted = paObj && paObj.id === highlightedPAId;

              // PA Status styling
              let paBgColor = '#FFFFFF';
              let paBorderColor = '#008C50';
              let paTextColor = '#004F4C';
              let isMaintenance = false;

              if (paObj) {
                if (paObj.statusNome === 'Ativo') {
                  paBgColor = '#F0FDF4';
                  paBorderColor = '#008C50';
                  paTextColor = '#004F4C';
                } else if (paObj.statusNome === 'Manutenção') {
                  paBgColor = '#FFF7ED';
                  paBorderColor = '#ED7203';
                  paTextColor = '#C2410C';
                  isMaintenance = true;
                } else if (paObj.statusNome === 'Inativo') {
                  paBgColor = '#F8FAFC';
                  paBorderColor = '#94A3B8';
                  paTextColor = '#64748B';
                }
              }

              return (
                <g
                  key={obj.id}
                  transform={`translate(${obj.x}, ${obj.y}) rotate(${obj.rotation}, ${obj.width / 2}, ${obj.height / 2})`}
                  onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
                  className="cursor-pointer"
                >
                  {/* Highlight ring for target search match */}
                  {isHighlighted && (
                    <rect
                      x={-6}
                      y={-6}
                      width={obj.width + 12}
                      height={obj.height + 12}
                      rx={10}
                      fill="none"
                      stroke="#ED7203"
                      strokeWidth={3}
                      className="animate-pulse"
                    />
                  )}

                  {/* 1. Áreas e Ambientes */}
                  {obj.type === 'area' && (
                    <g>
                      <rect
                        width={obj.width}
                        height={obj.height}
                        rx={8}
                        fill={obj.fill || 'rgba(0, 140, 80, 0.05)'}
                        stroke={obj.stroke || '#008C50'}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                      />
                      <text
                        x={12}
                        y={24}
                        fontSize={12}
                        fontWeight="bold"
                        fill="#004F4C"
                        fontFamily="sans-serif"
                      >
                        {obj.name}
                      </text>
                    </g>
                  )}

                  {/* 2. Paredes e Divisórias */}
                  {(obj.type === 'parede' || obj.type === 'divisoria') && (
                    <rect
                      width={obj.width}
                      height={obj.height}
                      rx={2}
                      fill={obj.fill || '#004F4C'}
                      stroke={isSelected ? '#ED7203' : 'none'}
                      strokeWidth={2}
                    />
                  )}

                  {/* 3. Portas */}
                  {obj.type === 'porta' && (
                    <g>
                      <rect width={obj.width} height={obj.height} rx={2} fill="#ED7203" />
                      <path
                        d={`M 0 0 A ${obj.width} ${obj.width} 0 0 1 ${obj.width} ${obj.width}`}
                        fill="none"
                        stroke="#ED7203"
                        strokeWidth={1.5}
                        strokeDasharray="2 2"
                      />
                    </g>
                  )}

                  {/* 4. Móveis (Mesas, Bancadas, Armários) */}
                  {(obj.type === 'mesa' || obj.type === 'bancada' || obj.type === 'armario') && (
                    <g>
                      <rect
                        width={obj.width}
                        height={obj.height}
                        rx={6}
                        fill="#F1F5F9"
                        stroke={isSelected ? '#008C50' : '#CBD5E1'}
                        strokeWidth={2}
                      />
                      <text
                        x={obj.width / 2}
                        y={obj.height / 2 + 4}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight="600"
                        fill="#64748B"
                      >
                        {obj.name}
                      </text>
                    </g>
                  )}

                  {/* 5. PA Native Station Box */}
                  {isPA && (
                    <g>
                      <rect
                        width={obj.width}
                        height={obj.height}
                        rx={6}
                        fill={paBgColor}
                        stroke={isSelected ? '#004F4C' : paBorderColor}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all hover:opacity-90 shadow-2xs"
                      />

                      {/* PA Code Label */}
                      <text
                        x={obj.width / 2}
                        y={18}
                        textAnchor="middle"
                        fontSize={11}
                        fontWeight="bold"
                        fill={paTextColor}
                        fontFamily="sans-serif"
                      >
                        {obj.paCode || obj.name}
                      </text>

                      {/* Equipment indicator details */}
                      {paObj && (
                        <text
                          x={obj.width / 2}
                          y={32}
                          textAnchor="middle"
                          fontSize={8}
                          fontWeight="500"
                          fill="#64748B"
                          fontFamily="sans-serif"
                        >
                          {paObj.monitorIds.length} mon · {paObj.computadorId ? 'PC' : 's/ PC'}
                        </text>
                      )}

                      {/* Maintenance Warning Indicator Dot (•) */}
                      {isMaintenance && (
                        <circle
                          cx={obj.width - 8}
                          cy={8}
                          r={4}
                          fill="#ED7203"
                          className="animate-ping opacity-75"
                        />
                      )}
                      {isMaintenance && (
                        <circle
                          cx={obj.width - 8}
                          cy={8}
                          r={4}
                          fill="#ED7203"
                        />
                      )}
                    </g>
                  )}

                  {/* Selection Box Handles (Edit mode) */}
                  {mode === 'edit' && isSelected && (
                    <rect
                      x={-4}
                      y={-4}
                      width={obj.width + 8}
                      height={obj.height + 8}
                      fill="none"
                      stroke="#008C50"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* PA Detail Drawer on Right */}
        {selectedDrawerPA && (
          <PADetailDrawer
            pa={selectedDrawerPA}
            onClose={() => setSelectedDrawerPA(null)}
          />
        )}
      </div>

      {/* Modal: Add PA to Floor Plan */}
      {showAddPAModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Adicionar PA à Planta</h3>
            <p className="text-xs text-slate-500 mb-4">
              Selecione uma PA do cadastro para posicionar visualmente na planta.
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 my-3">
              {pas.map((p) => {
                const isPlaced = localObjects.some((o) => o.paCode === p.code);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isPlaced) {
                        const newId = `flobj-pa-${Date.now()}`;
                        const newFloorObj: FloorObject = {
                          id: newId,
                          category: 'pa',
                          type: 'pa',
                          name: p.code,
                          x: 400,
                          y: 300,
                          width: p.width || 70,
                          height: p.height || 48,
                          rotation: 0,
                          paCode: p.code,
                        };
                        pushHistoryState([...localObjects, newFloorObj]);
                        setShowAddPAModal(false);
                      }
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isPlaced
                        ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 hover:border-[#008C50] hover:bg-[#008C50]/5 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{p.code}</span>
                        <span className="text-xs text-slate-500">({p.tipoNome})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Status: {p.statusNome} · {p.monitorIds.length} monitores
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        isPlaced ? 'bg-slate-200 text-slate-600' : 'bg-[#008C50] text-white'
                      }`}
                    >
                      {isPlaced ? 'Já posicionada' : 'Posicionar'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAddPAModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
