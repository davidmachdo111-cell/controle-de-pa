export type UserRole = 'Administrador' | 'Visualização';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface PAType {
  id: string;
  name: string;
  active: boolean;
}

export interface PAStatus {
  id: string;
  name: string;
  requiresOccurrence: boolean;
  color: string; // hex or tailwind badge class
  active: boolean;
}

export interface EquipmentType {
  id: string;
  name: string;
  category: 'Computador' | 'Monitor' | 'Outros';
  active: boolean;
}

export interface EquipmentStatus {
  id: string;
  name: string;
  requiresOccurrence: boolean;
  active: boolean;
}

export interface Equipment {
  id: string;
  patrimonio: string; // Unique asset tag
  tipoId: string;
  tipoNome: string;
  categoria: 'Computador' | 'Monitor' | 'Outros';
  modelo?: string;
  statusId: string;
  statusNome: string;
  paId: string | null; // Bound PA ID or null
  observacao?: string;
  createdAt: string;
}

export interface PA {
  id: string;
  code: string; // e.g., PA-001 (Unique)
  tipoId: string;
  tipoNome: string;
  statusId: string;
  statusNome: string;
  patrimonioPA?: string; // PA desk/booth asset tag
  computadorId: string | null;
  monitorIds: string[];
  observacoes: string;
  // Visual placement on floor plan
  x: number | null;
  y: number | null;
  rotation: number; // 0, 90, 180, 270
  width: number;
  height: number;
  createdAt: string;
}

export interface Occurrence {
  id: string;
  entityType: 'PA' | 'EQUIPMENT';
  entityId: string;
  entityCode: string;
  data: string; // DD/MM/YYYY - HH:mm
  status: string;
  descricao: string;
}

export type FloorObjectCategory = 'estrutura' | 'ambiente' | 'mobiliario' | 'identificacao' | 'pa';

export type FloorObjectType =
  | 'parede'
  | 'porta'
  | 'janela'
  | 'pilar'
  | 'divisoria'
  | 'area'
  | 'corredor'
  | 'sala'
  | 'mesa'
  | 'bancada'
  | 'armario'
  | 'texto'
  | 'legenda'
  | 'pa';

export interface FloorObject {
  id: string;
  category: FloorObjectCategory;
  type: FloorObjectType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
  color?: string;
  fill?: string;
  stroke?: string;
  patrimonio?: string;
  observacao?: string;
  paCode?: string; // Linked PA code if type === 'pa'
}

export interface GlobalSearchResult {
  id: string;
  type: 'PA' | 'PATRIMONIO';
  codeOrTag: string;
  title: string;
  subtitle: string;
  status: string;
  paId?: string;
  equipmentId?: string;
  hasFloorPosition: boolean;
}
