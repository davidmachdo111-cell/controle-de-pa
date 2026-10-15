export type PAStatus = 'disponivel' | 'ocupado' | 'manutencao' | 'desativado';

export interface PA {
  id: string;
  codigo: string; // e.g. "PA-01"
  setor: string;
  x: number; // grid coordinate
  y: number; // grid coordinate
  largura: number;
  altura: number;
  rotacao: 0 | 90 | 180 | 270;
  status: PAStatus;
  usuarioAtual?: string;
  ramal?: string;
  criadoEm: string;
}

export type TipoPatrimonio = 'desktop' | 'notebook' | 'monitor' | 'headset' | 'cadeira' | 'outro';
export type StatusPatrimonio = 'em_uso' | 'estoque' | 'defeito' | 'descartado';

export interface Patrimonio {
  id: string;
  tagTombamento: string; // e.g. "PAT-1020"
  tipo: TipoPatrimonio;
  marca: string;
  modelo: string;
  numeroSerie: string;
  paId: string | null; // null = estoque
  status: StatusPatrimonio;
  observacoes?: string;
  criadoEm: string;
}

export interface HistoricoMovimentacao {
  id: string;
  dataHora: string;
  patrimonioId: string;
  patrimonioTag: string;
  paOrigemId: string | null;
  paDestinoId: string | null;
  paOrigemCodigo?: string | null;
  paDestinoCodigo?: string | null;
  motivo: string;
  responsavel: string;
}

export type UserRole = 'Administrador' | 'Visualização';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  active: boolean;
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
