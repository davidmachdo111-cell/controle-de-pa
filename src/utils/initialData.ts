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

// Generate initial PAs and Equipment dynamically for realistic volume
export function generateSeedData() {
  const pas: PA[] = [];
  const equipments: Equipment[] = [];
  const occurrences: Occurrence[] = [];
  const floorObjects: FloorObject[] = [];

  let assetCounter = 1000100;

  // 1. Generate 35 Operação PAs
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

    // Computer assignment
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

    // Monitors (Most have 2 monitors, some have 1)
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
      x: null, // Will be set in layout
      y: null,
      rotation: 0,
      width: 60,
      height: 45,
      createdAt: '2026-01-10 08:00',
    });
  }

  // Add initial maintenance occurrences
  occurrences.push({
    id: 'occ-1',
    entityType: 'PA',
    entityId: 'pa-27',
    entityCode: 'PA-027',
    data: '15/09/2026 - 14:20',
    status: 'Manutenção',
    descricao: 'Computador apresentou falha de inicialização e foi encaminhado para avaliação de TI.',
  });

  occurrences.push({
    id: 'occ-2',
    entityType: 'PA',
    entityId: 'pa-32',
    entityCode: 'PA-032',
    data: '10/10/2026 - 09:15',
    status: 'Manutenção',
    descricao: 'Monitor 1 com oscilação na imagem. Aguardando substituição de cabo DisplayPort.',
  });

  // 2. Generate 5 Liderança PAs (PA-036 to PA-040)
  // Per requirement: PA de Liderança standard is "Sem computador, 1 monitor".
  for (let i = 36; i <= 40; i++) {
    const code = `PA-${String(i).padStart(3, '0')}`;
    const paId = `pa-${i}`;
    const paAsset = padAsset(assetCounter++);

    // 1 monitor
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
      computadorId: null, // Sem computador (padrão Liderança)
      monitorIds: [monEqId],
      observacoes: 'Estação de Liderança / Supervisão - Uso com notebook do gestor.',
      x: null,
      y: null,
      rotation: 0,
      width: 70,
      height: 50,
      createdAt: '2026-01-10 08:00',
    });
  }

  // 3. Generate 5 Outros PAs (PA-041 to PA-045)
  for (let i = 41; i <= 45; i++) {
    const code = `PA-${String(i).padStart(3, '0')}`;
    const paId = `pa-${i}`;
    const paAsset = padAsset(assetCounter++);

    const pcEqId = `eq-pc-${i}`;
    const pcAsset = padAsset(assetCounter++);
    equipments.push({
      id: pcEqId,
      patrimonio: pcAsset,
      tipoId: 'eqtype-3',
      tipoNome: 'Micro',
      categoria: 'Computador',
      statusId: 'eqstatus-1',
      statusNome: 'Ativo',
      paId: paId,
      createdAt: '2026-01-10 08:00',
    });

    pas.push({
      id: paId,
      code,
      tipoId: 'patype-3',
      tipoNome: 'Outros',
      statusId: 'pastatus-1',
      statusNome: 'Ativo',
      patrimonioPA: paAsset,
      computadorId: pcEqId,
      monitorIds: [],
      observacoes: 'Estação de Apoio/Consultoria.',
      x: null,
      y: null,
      rotation: 0,
      width: 60,
      height: 45,
      createdAt: '2026-01-10 08:00',
    });
  }

  // 4. Unbound Equipment (Equipamentos sem PA)
  equipments.push({
    id: 'eq-unbound-1',
    patrimonio: padAsset(assetCounter++),
    tipoId: 'eqtype-1',
    tipoNome: 'Thin Client Novo',
    categoria: 'Computador',
    statusId: 'eqstatus-2',
    statusNome: 'Disponível',
    paId: null,
    observacao: 'Reserva técnica no estoque de TI.',
    createdAt: '2026-02-01 10:00',
  });

  equipments.push({
    id: 'eq-unbound-2',
    patrimonio: padAsset(assetCounter++),
    tipoId: 'eqtype-1',
    tipoNome: 'Thin Client Novo',
    categoria: 'Computador',
    statusId: 'eqstatus-2',
    statusNome: 'Disponível',
    paId: null,
    observacao: 'Reserva técnica no estoque de TI.',
    createdAt: '2026-02-01 10:00',
  });

  equipments.push({
    id: 'eq-unbound-3',
    patrimonio: padAsset(assetCounter++),
    tipoId: 'eqtype-4',
    tipoNome: 'Monitor Dell 22"',
    categoria: 'Monitor',
    statusId: 'eqstatus-3',
    statusNome: 'Manutenção',
    paId: null,
    observacao: 'Tela trincada enviada para garantia.',
    createdAt: '2026-02-05 11:30',
  });

  equipments.push({
    id: 'eq-unbound-4',
    patrimonio: padAsset(assetCounter++),
    tipoId: 'eqtype-5',
    tipoNome: 'Monitor LG 24"',
    categoria: 'Monitor',
    statusId: 'eqstatus-2',
    statusNome: 'Disponível',
    paId: null,
    observacao: 'Pronto para substituição imediata.',
    createdAt: '2026-02-10 14:00',
  });

  // 5. Floor Plan Layout Creation
  // Floor Canvas size reference: 1200 x 850

  // Outer Boundaries & Walls
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

  // Main Entrance Door
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

  // Zones / Areas
  floorObjects.push({
    id: 'area-op-a',
    category: 'ambiente',
    type: 'area',
    name: 'Área de Operação A',
    x: 60,
    y: 120,
    width: 500,
    height: 420,
    rotation: 0,
    fill: 'rgba(0, 140, 80, 0.04)',
    stroke: '#008C50',
  });

  floorObjects.push({
    id: 'area-op-b',
    category: 'ambiente',
    type: 'area',
    name: 'Área de Operação B',
    x: 600,
    y: 120,
    width: 530,
    height: 420,
    rotation: 0,
    fill: 'rgba(0, 140, 80, 0.04)',
    stroke: '#008C50',
  });

  floorObjects.push({
    id: 'area-lid',
    category: 'ambiente',
    type: 'area',
    name: 'Supervisão & Liderança',
    x: 60,
    y: 570,
    width: 500,
    height: 210,
    rotation: 0,
    fill: 'rgba(0, 79, 76, 0.05)',
    stroke: '#004F4C',
  });

  floorObjects.push({
    id: 'area-ti',
    category: 'ambiente',
    type: 'area',
    name: 'Sala de TI & Suporte',
    x: 600,
    y: 570,
    width: 250,
    height: 210,
    rotation: 0,
    fill: 'rgba(187, 207, 51, 0.08)',
    stroke: '#BBCF33',
  });

  floorObjects.push({
    id: 'area-desconts',
    category: 'ambiente',
    type: 'area',
    name: 'Área de Descompressão',
    x: 880,
    y: 570,
    width: 250,
    height: 210,
    rotation: 0,
    fill: 'rgba(237, 114, 3, 0.04)',
    stroke: '#ED7203',
  });

  // Dividers / Internal Walls
  floorObjects.push({
    id: 'wall-mid-vert',
    category: 'estrutura',
    type: 'divisoria',
    name: 'Divisória Central',
    x: 580,
    y: 120,
    width: 6,
    height: 660,
    rotation: 0,
    stroke: '#CBD5E1',
    fill: '#CBD5E1',
  });

  floorObjects.push({
    id: 'wall-mid-horiz',
    category: 'estrutura',
    type: 'divisoria',
    name: 'Divisória Horizontal',
    x: 60,
    y: 550,
    width: 1070,
    height: 6,
    rotation: 0,
    stroke: '#CBD5E1',
    fill: '#CBD5E1',
  });

  // Place PAs on the map systematically
  // Operação A (PAs 1 to 18)
  // 3 double-sided islands of 6 PAs each
  let paIndex = 1;

  // Island A1 (PAs 1-6)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      if (paIndex <= 18) {
        const paCode = `PA-${String(paIndex).padStart(3, '0')}`;
        const x = 90 + col * 120;
        const y = 160 + row * 110;

        const paObj = pas.find((p) => p.code === paCode);
        if (paObj) {
          paObj.x = x;
          paObj.y = y;
          paObj.rotation = col === 0 ? 0 : 180;
        }

        floorObjects.push({
          id: `flobj-pa-${paIndex}`,
          category: 'pa',
          type: 'pa',
          name: paCode,
          x,
          y,
          width: 70,
          height: 48,
          rotation: col === 0 ? 0 : 180,
          paCode,
        });

        paIndex++;
      }
    }
  }

  // Island A2 (PAs 7-18)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      if (paIndex <= 18) {
        const paCode = `PA-${String(paIndex).padStart(3, '0')}`;
        const x = 340 + col * 120;
        const y = 160 + row * 110;

        const paObj = pas.find((p) => p.code === paCode);
        if (paObj) {
          paObj.x = x;
          paObj.y = y;
          paObj.rotation = col === 0 ? 0 : 180;
        }

        floorObjects.push({
          id: `flobj-pa-${paIndex}`,
          category: 'pa',
          type: 'pa',
          name: paCode,
          x,
          y,
          width: 70,
          height: 48,
          rotation: col === 0 ? 0 : 180,
          paCode,
        });

        paIndex++;
      }
    }
  }

  // Operação B (PAs 19 to 35)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (paIndex <= 35) {
        const paCode = `PA-${String(paIndex).padStart(3, '0')}`;
        const x = 630 + col * 150;
        const y = 160 + row * 110;

        const paObj = pas.find((p) => p.code === paCode);
        if (paObj) {
          paObj.x = x;
          paObj.y = y;
          paObj.rotation = 0;
        }

        floorObjects.push({
          id: `flobj-pa-${paIndex}`,
          category: 'pa',
          type: 'pa',
          name: paCode,
          x,
          y,
          width: 70,
          height: 48,
          rotation: 0,
          paCode,
        });

        paIndex++;
      }
    }
  }

  // Liderança PAs (PA-036 to PA-040)
  for (let i = 36; i <= 40; i++) {
    const paCode = `PA-${String(i).padStart(3, '0')}`;
    const x = 90 + (i - 36) * 95;
    const y = 620;

    const paObj = pas.find((p) => p.code === paCode);
    if (paObj) {
      paObj.x = x;
      paObj.y = y;
      paObj.rotation = 0;
    }

    floorObjects.push({
      id: `flobj-pa-${i}`,
      category: 'pa',
      type: 'pa',
      name: paCode,
      x,
      y,
      width: 75,
      height: 52,
      rotation: 0,
      paCode,
    });
  }

  // Outros PAs (PA-041 to PA-045) in TI / Support room
  for (let i = 41; i <= 45; i++) {
    const paCode = `PA-${String(i).padStart(3, '0')}`;
    const col = (i - 41) % 2;
    const row = Math.floor((i - 41) / 2);
    const x = 630 + col * 100;
    const y = 620 + row * 70;

    const paObj = pas.find((p) => p.code === paCode);
    if (paObj) {
      paObj.x = x;
      paObj.y = y;
      paObj.rotation = 0;
    }

    floorObjects.push({
      id: `flobj-pa-${i}`,
      category: 'pa',
      type: 'pa',
      name: paCode,
      x,
      y,
      width: 70,
      height: 48,
      rotation: 0,
      paCode,
    });
  }

  // Add furniture items to floor plan
  floorObjects.push({
    id: 'mob-armario-1',
    category: 'mobiliario',
    type: 'armario',
    name: 'Armário TI 01',
    x: 780,
    y: 710,
    width: 55,
    height: 40,
    rotation: 0,
    patrimonio: '0098120',
    observacao: 'Armário com cabeamento de rede e switches.',
  });

  floorObjects.push({
    id: 'mob-bancada-1',
    category: 'mobiliario',
    type: 'bancada',
    name: 'Bancada de Testes TI',
    x: 620,
    y: 730,
    width: 140,
    height: 35,
    rotation: 0,
    patrimonio: '0098121',
    observacao: 'Bancada para manutenção de Thin Clients.',
  });

  floorObjects.push({
    id: 'mob-mesa-desc',
    category: 'mobiliario',
    type: 'mesa',
    name: 'Mesa Reunião Rápida',
    x: 930,
    y: 630,
    width: 140,
    height: 80,
    rotation: 0,
    observacao: 'Mesa para alinhamento da equipe.',
  });

  return {
    pas,
    equipments,
    occurrences,
    floorObjects,
  };
}
