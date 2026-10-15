import {
  Equipment,
  EquipmentStatus,
  EquipmentType,
  FloorObject,
  Occurrence,
  PA,
  PAStatus,
  PAType,
  User,
} from '../types';

export const INITIAL_PA_TYPES: PAType[] = [
  { id: 'patype-1', name: 'PA de Operação', active: true },
  { id: 'patype-2', name: 'PA de Liderança', active: true },
  { id: 'patype-3', name: 'Outros', active: true },
];

export const INITIAL_PA_STATUSES: PAStatus[] = [
  { id: 'pastatus-1', name: 'Ativo', requiresOccurrence: false, color: '#008C50', active: true },
  { id: 'pastatus-2', name: 'Manutenção', requiresOccurrence: true, color: '#ED7203', active: true },
  { id: 'pastatus-3', name: 'Inativo', requiresOccurrence: false, color: '#64748B', active: true },
];

export const INITIAL_EQUIPMENT_TYPES: EquipmentType[] = [
  { id: 'eqtype-1', name: 'Thin Client Novo', category: 'Computador', active: true },
  { id: 'eqtype-2', name: 'Thin Client Antigo', category: 'Computador', active: true },
  { id: 'eqtype-3', name: 'Micro', category: 'Computador', active: true },
  { id: 'eqtype-4', name: 'Monitor Dell 22"', category: 'Monitor', active: true },
  { id: 'eqtype-5', name: 'Monitor LG 24"', category: 'Monitor', active: true },
  { id: 'eqtype-6', name: 'Monitor HP 21.5"', category: 'Monitor', active: true },
];

export const INITIAL_EQUIPMENT_STATUSES: EquipmentStatus[] = [
  { id: 'eqstatus-1', name: 'Ativo', requiresOccurrence: false, active: true },
  { id: 'eqstatus-2', name: 'Disponível', requiresOccurrence: false, active: true },
  { id: 'eqstatus-3', name: 'Manutenção', requiresOccurrence: true, active: true },
  { id: 'eqstatus-4', name: 'Inativo', requiresOccurrence: false, active: true },
];

export const INITIAL_USERS: User[] = [
  { id: 'usr-1', username: 'Contactgestao', name: 'Gestor Contact Center', role: 'Administrador', active: true },
  { id: 'usr-2', username: 'operador1', name: 'Supervisão Operacional', role: 'Visualização', active: true },
];

// Helper to pad asset numbers
const padAsset = (num: number, length = 7) => String(num).padStart(length, '0');

// Clean Empty Default State (Start from Scratch)
export function generateSeedData() {
  return {
    pas: [],
    equipments: [],
    occurrences: [],
    floorObjects: [
      {
        id: 'wall-outer',
        category: 'estrutura' as const,
        type: 'parede' as const,
        name: 'Parede Perimetral',
        x: 30,
        y: 30,
        width: 1140,
        height: 780,
        rotation: 0,
        stroke: '#004F4C',
        fill: 'transparent',
      },
      {
        id: 'door-main',
        category: 'estrutura' as const,
        type: 'porta' as const,
        name: 'Entrada Principal',
        x: 550,
        y: 30,
        width: 100,
        height: 12,
        rotation: 0,
        fill: '#ED7203',
      },
      {
        id: 'area-contact-center',
        category: 'ambiente' as const,
        type: 'area' as const,
        name: 'Área do Contact Center',
        x: 60,
        y: 120,
        width: 1070,
        height: 660,
        rotation: 0,
        fill: 'rgba(0, 140, 80, 0.04)',
        stroke: '#008C50',
      },
    ],
  };
}

// Full Demo Seed Data (Available in Configurações)
export function generateFullDemoData() {
  const pas: PA[] = [];
  const equipments: Equipment[] = [];
  const occurrences: Occurrence[] = [];
  const floorObjects: FloorObject[] = [];

  let assetCounter = 1000100;

  // Generate 35 Operação PAs
  for (let i = 1; i <= 35; i++) {
    const code = `PA-${String(i).padStart(3, '0')}`;
    const paId = `pa-${i}`;
    const paAsset = padAsset(assetCounter++);

    let paStatusName = 'Ativo';
    let paStatusId = 'pastatus-1';

    if (i === 27) {
      paStatusName = 'Manutenção';
      paStatusId = 'pastatus-2';
    } else if (i === 32) {
      paStatusName = 'Manutenção';
      paStatusId = 'pastatus-2';
    } else if (i === 35) {
      paStatusName = 'Inativo';
      paStatusId = 'pastatus-3';
    }

    const isThinNovo = i % 2 === 0;
    const isMicro = i % 7 === 0;
    const pcTypeName = isMicro ? 'Micro' : isThinNovo ? 'Thin Client Novo' : 'Thin Client Antigo';
    const pcTypeId = isMicro ? 'eqtype-3' : isThinNovo ? 'eqtype-1' : 'eqtype-2';
    const pcAsset = padAsset(assetCounter++);

    let pcStatusId = 'eqstatus-1';
    let pcStatusName = 'Ativo';
    if (i === 27) {
      pcStatusId = 'eqstatus-3';
      pcStatusName = 'Manutenção';
    }

    const pcEqId = `eq-pc-${i}`;
    equipments.push({
      id: pcEqId,
      patrimonio: pcAsset,
      tipoId: pcTypeId,
      tipoNome: pcTypeName,
      categoria: 'Computador',
      statusId: pcStatusId,
      statusNome: pcStatusName,
      paId: paId,
      createdAt: '2026-01-10 08:00',
    });

    const monitorCount = i % 5 === 0 ? 1 : 2;
    const monitorIds: string[] = [];

    for (let m = 1; m <= monitorCount; m++) {
      const monEqId = `eq-mon-${i}-${m}`;
      const monAsset = padAsset(assetCounter++);
      const monTypeId = m === 1 ? 'eqtype-4' : 'eqtype-5';
      const monTypeName = m === 1 ? 'Monitor Dell 22"' : 'Monitor LG 24"';

      let monStatusId = 'eqstatus-1';
      let monStatusName = 'Ativo';
      if (i === 32 && m === 1) {
        monStatusId = 'eqstatus-3';
        monStatusName = 'Manutenção';
      }

      equipments.push({
        id: monEqId,
        patrimonio: monAsset,
        tipoId: monTypeId,
        tipoNome: monTypeName,
        categoria: 'Monitor',
        statusId: monStatusId,
        statusNome: monStatusName,
        paId: paId,
        createdAt: '2026-01-10 08:00',
      });

      monitorIds.push(monEqId);
    }

    pas.push({
      id: paId,
      code,
      tipoId: 'patype-1',
      tipoNome: 'PA de Operação',
      statusId: paStatusId,
      statusNome: paStatusName,
      patrimonioPA: paAsset,
      computadorId: pcEqId,
      monitorIds,
      observacoes: i === 27 ? 'Encaminhado chamado para verificação de cabo e fonte.' : '',
      x: null,
      y: null,
      rotation: 0,
      width: 60,
      height: 45,
      createdAt: '2026-01-10 08:00',
    });
  }

  // 5 Liderança PAs
  for (let i = 36; i <= 40; i++) {
    const code = `PA-${String(i).padStart(3, '0')}`;
    const paId = `pa-${i}`;
    const paAsset = padAsset(assetCounter++);

    const monEqId = `eq-mon-${i}-1`;
    const monAsset = padAsset(assetCounter++);
    equipments.push({
      id: monEqId,
      patrimonio: monAsset,
      tipoId: 'eqtype-5',
      tipoNome: 'Monitor LG 24"',
      categoria: 'Monitor',
      statusId: 'eqstatus-1',
      statusNome: 'Ativo',
      paId: paId,
      createdAt: '2026-01-10 08:00',
    });

    pas.push({
      id: paId,
      code,
      tipoId: 'patype-2',
      tipoNome: 'PA de Liderança',
      statusId: 'pastatus-1',
      statusNome: 'Ativo',
      patrimonioPA: paAsset,
      computadorId: null,
      monitorIds: [monEqId],
      observacoes: 'Estação de Liderança.',
      x: null,
      y: null,
      rotation: 0,
      width: 75,
      height: 52,
      createdAt: '2026-01-10 08:00',
    });
  }

  // Layout elements
  floorObjects.push({
    id: 'wall-outer',
    category: 'estrutura',
    type: 'parede',
    name: 'Parede Perimetral',
    x: 30,
    y: 30,
    width: 1140,
    height: 780,
    rotation: 0,
    stroke: '#004F4C',
    fill: 'transparent',
  });

  floorObjects.push({
    id: 'door-main',
    category: 'estrutura',
    type: 'porta',
    name: 'Entrada Principal',
    x: 550,
    y: 30,
    width: 100,
    height: 12,
    rotation: 0,
    fill: '#ED7203',
  });

  floorObjects.push({
    id: 'area-op-a',
    category: 'ambiente',
    type: 'area',
    name: 'Área do Contact Center',
    x: 60,
    y: 120,
    width: 1070,
    height: 660,
    rotation: 0,
    fill: 'rgba(0, 140, 80, 0.04)',
    stroke: '#008C50',
  });

  return {
    pas,
    equipments,
    occurrences,
    floorObjects,
  };
}
