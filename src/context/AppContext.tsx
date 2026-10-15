import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Equipment,
  EquipmentStatus,
  EquipmentType,
  FloorObject,
  GlobalSearchResult,
  Occurrence,
  PA,
  PAStatus,
  PAType,
  User,
} from '../types';
import {
  generateSeedData,
  INITIAL_EQUIPMENT_STATUSES,
  INITIAL_EQUIPMENT_TYPES,
  INITIAL_PA_STATUSES,
  INITIAL_PA_TYPES,
  INITIAL_USERS,
} from '../utils/initialData';

interface AppContextType {
  // Data
  pas: PA[];
  equipments: Equipment[];
  occurrences: Occurrence[];
  floorObjects: FloorObject[];
  paTypes: PAType[];
  paStatuses: PAStatus[];
  equipmentTypes: EquipmentType[];
  equipmentStatuses: EquipmentStatus[];
  users: User[];
  currentUser: User;

  // View state navigation triggers
  activeTab: 'dashboard' | 'planta' | 'pas' | 'patrimonios' | 'configuracoes';
  setActiveTab: (tab: 'dashboard' | 'planta' | 'pas' | 'patrimonios' | 'configuracoes') => void;
  highlightedPAId: string | null;
  setHighlightedPAId: (id: string | null) => void;
  highlightedEquipmentId: string | null;
  setHighlightedEquipmentId: (id: string | null) => void;
  activePAFilter: { type?: string; status?: string; hasPc?: boolean; monitorCount?: number } | null;
  setActivePAFilter: (filter: { type?: string; status?: string; hasPc?: boolean; monitorCount?: number } | null) => void;
  activePatrimonioFilter: { categoria?: string; status?: string; semPa?: boolean } | null;
  setActivePatrimonioFilter: (filter: { categoria?: string; status?: string; semPa?: boolean } | null) => void;

  // Actions
  addPA: (pa: Omit<PA, 'id' | 'createdAt'>, occurrenceDesc?: string) => { success: boolean; error?: string };
  updatePA: (id: string, updates: Partial<PA>, occurrenceDesc?: string) => { success: boolean; error?: string };
  deletePA: (id: string) => void;
  suggestNextPACode: () => string;

  addEquipment: (eq: Omit<Equipment, 'id' | 'createdAt'>, occurrenceDesc?: string) => { success: boolean; error?: string };
  updateEquipment: (id: string, updates: Partial<Equipment>, occurrenceDesc?: string) => { success: boolean; error?: string };
  transferEquipment: (equipmentId: string, targetPaId: string | null) => { success: boolean; error?: string };
  unbindEquipment: (equipmentId: string) => void;
  deleteEquipment: (id: string) => void;

  addOccurrence: (occ: Omit<Occurrence, 'id' | 'data'>) => void;
  getHistoryForEntity: (entityType: 'PA' | 'EQUIPMENT', entityId: string) => Occurrence[];

  updateFloorObjects: (objects: FloorObject[]) => void;
  addPAToMap: (paCode: string, x?: number, y?: number) => void;
  removePAFromMap: (paCode: string) => void;

  // Configuration management
  addPAType: (name: string) => void;
  updatePAType: (id: string, updates: Partial<PAType>) => void;
  addPAStatus: (name: string, requiresOccurrence: boolean, color: string) => void;
  updatePAStatus: (id: string, updates: Partial<PAStatus>) => void;
  addEquipmentType: (name: string, category: 'Computador' | 'Monitor' | 'Outros') => void;
  updateEquipmentType: (id: string, updates: Partial<EquipmentType>) => void;
  addEquipmentStatus: (name: string, requiresOccurrence: boolean) => void;
  updateEquipmentStatus: (id: string, updates: Partial<EquipmentStatus>) => void;
  addUser: (username: string, name: string, role: 'Administrador' | 'Visualização') => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  // Auth & Search
  setCurrentUserRole: (role: 'Administrador' | 'Visualização') => void;
  globalSearch: (query: string) => GlobalSearchResult[];
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'controle_pas_contact_center_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pas, setPas] = useState<PA[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [floorObjects, setFloorObjects] = useState<FloorObject[]>([]);
  const [paTypes, setPaTypes] = useState<PAType[]>(INITIAL_PA_TYPES);
  const [paStatuses, setPaStatuses] = useState<PAStatus[]>(INITIAL_PA_STATUSES);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>(INITIAL_EQUIPMENT_TYPES);
  const [equipmentStatuses, setEquipmentStatuses] = useState<EquipmentStatus[]>(INITIAL_EQUIPMENT_STATUSES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default Admin

  // Navigation and filter states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planta' | 'pas' | 'patrimonios' | 'configuracoes'>('dashboard');
  const [highlightedPAId, setHighlightedPAId] = useState<string | null>(null);
  const [highlightedEquipmentId, setHighlightedEquipmentId] = useState<string | null>(null);
  const [activePAFilter, setActivePAFilter] = useState<{ type?: string; status?: string; hasPc?: boolean; monitorCount?: number } | null>(null);
  const [activePatrimonioFilter, setActivePatrimonioFilter] = useState<{ categoria?: string; status?: string; semPa?: boolean } | null>(null);

  // Load state from localStorage or initialize seed
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pas && parsed.equipments && parsed.floorObjects) {
          setPas(parsed.pas);
          setEquipments(parsed.equipments);
          setOccurrences(parsed.occurrences || []);
          setFloorObjects(parsed.floorObjects);
          if (parsed.paTypes) setPaTypes(parsed.paTypes);
          if (parsed.paStatuses) setPaStatuses(parsed.paStatuses);
          if (parsed.equipmentTypes) setEquipmentTypes(parsed.equipmentTypes);
          if (parsed.equipmentStatuses) setEquipmentStatuses(parsed.equipmentStatuses);
          if (parsed.users) setUsers(parsed.users);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }

    // Default seed initialization
    resetToInitialData();
  }, []);

  // Save to localStorage whenever core state updates
  useEffect(() => {
    if (pas.length > 0) {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            pas,
            equipments,
            occurrences,
            floorObjects,
            paTypes,
            paStatuses,
            equipmentTypes,
            equipmentStatuses,
            users,
          })
        );
      } catch (e) {
        console.error('Error saving state to localStorage:', e);
      }
    }
  }, [pas, equipments, occurrences, floorObjects, paTypes, paStatuses, equipmentTypes, equipmentStatuses, users]);

  const resetToInitialData = () => {
    const seed = generateSeedData();
    setPas(seed.pas);
    setEquipments(seed.equipments);
    setOccurrences(seed.occurrences);
    setFloorObjects(seed.floorObjects);
    setPaTypes(INITIAL_PA_TYPES);
    setPaStatuses(INITIAL_PA_STATUSES);
    setEquipmentTypes(INITIAL_EQUIPMENT_TYPES);
    setEquipmentStatuses(INITIAL_EQUIPMENT_STATUSES);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  // Helper date formatter
  const formatDateNow = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  // Helper code generator
  const suggestNextPACode = (): string => {
    let maxNum = 0;
    pas.forEach((pa) => {
      const match = pa.code.match(/PA-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `PA-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Asset Tag Uniqueness Check
  const isPatrimonioUnique = (tag: string, excludeEquipmentId?: string): { unique: boolean; existingDetail?: string } => {
    if (!tag.trim()) return { unique: true };

    const cleanTag = tag.trim().toUpperCase();

    // Check equipments
    const foundEq = equipments.find((eq) => eq.patrimonio.toUpperCase() === cleanTag && eq.id !== excludeEquipmentId);
    if (foundEq) {
      const boundPA = foundEq.paId ? pas.find((p) => p.id === foundEq.paId) : null;
      const paText = boundPA ? `vinculado à ${boundPA.code}` : 'sem PA vinculada';
      return {
        unique: false,
        existingDetail: `Equipamento (${foundEq.tipoNome}, ${foundEq.statusNome}) ${paText}`,
      };
    }

    return { unique: true };
  };

  // ---------------- ACTIONS ----------------

  // Add PA
  const addPA = (paData: Omit<PA, 'id' | 'createdAt'>, occurrenceDesc?: string): { success: boolean; error?: string } => {
    const code = paData.code.trim().toUpperCase();

    // Validate PA Code uniqueness
    if (pas.some((p) => p.code.toUpperCase() === code)) {
      return { success: false, error: `A PA com o código ${code} já está cadastrada.` };
    }

    // Validate PA Asset tag if provided
    if (paData.patrimonioPA) {
      const check = isPatrimonioUnique(paData.patrimonioPA);
      if (!check.unique) {
        return { success: false, error: `Patrimônio da PA (${paData.patrimonioPA}) já cadastrado: ${check.existingDetail}.` };
      }
    }

    // Check if status requires occurrence
    const statusObj = paStatuses.find((s) => s.id === paData.statusId || s.name === paData.statusNome);
    if (statusObj?.requiresOccurrence && !occurrenceDesc?.trim()) {
      return { success: false, error: `O status "${paData.statusNome}" exige a descrição de uma ocorrência.` };
    }

    const newId = `pa-${Date.now()}`;
    const newPA: PA = {
      ...paData,
      id: newId,
      code,
      createdAt: formatDateNow(),
    };

    setPas((prev) => [...prev, newPA]);

    // Update equipment bindings if computers or monitors specified
    if (newPA.computadorId) {
      setEquipments((prev) => prev.map((eq) => (eq.id === newPA.computadorId ? { ...eq, paId: newId } : eq)));
    }
    if (newPA.monitorIds.length > 0) {
      setEquipments((prev) =>
        prev.map((eq) => (newPA.monitorIds.includes(eq.id) ? { ...eq, paId: newId } : eq))
      );
    }

    // Record occurrence if description provided
    if (occurrenceDesc?.trim()) {
      addOccurrence({
        entityType: 'PA',
        entityId: newId,
        entityCode: code,
        status: paData.statusNome,
        descricao: occurrenceDesc.trim(),
      });
    }

    return { success: true };
  };

  // Update PA
  const updatePA = (id: string, updates: Partial<PA>, occurrenceDesc?: string): { success: boolean; error?: string } => {
    const currentPA = pas.find((p) => p.id === id);
    if (!currentPA) return { success: false, error: 'PA não encontrada.' };

    // If code is being changed, check uniqueness
    if (updates.code && updates.code.toUpperCase() !== currentPA.code.toUpperCase()) {
      const newCode = updates.code.trim().toUpperCase();
      if (pas.some((p) => p.id !== id && p.code.toUpperCase() === newCode)) {
        return { success: false, error: `O código ${newCode} já pertence a outra PA.` };
      }
    }

    // Check status change requirement for occurrence
    const targetStatusName = updates.statusNome || currentPA.statusNome;
    const targetStatusObj = paStatuses.find((s) => s.name === targetStatusName);
    if (targetStatusObj?.requiresOccurrence && !occurrenceDesc?.trim() && updates.statusNome !== currentPA.statusNome) {
      return { success: false, error: `O status "${targetStatusName}" exige a descrição de uma ocorrência.` };
    }

    // Check asset tag uniqueness if changed
    if (updates.patrimonioPA && updates.patrimonioPA !== currentPA.patrimonioPA) {
      const check = isPatrimonioUnique(updates.patrimonioPA);
      if (!check.unique) {
        return { success: false, error: `Patrimônio (${updates.patrimonioPA}) já cadastrado: ${check.existingDetail}.` };
      }
    }

    setPas((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        return p;
      })
    );

    // Sync computer link if changed
    if (updates.computadorId !== undefined && updates.computadorId !== currentPA.computadorId) {
      setEquipments((prev) =>
        prev.map((eq) => {
          if (currentPA.computadorId && eq.id === currentPA.computadorId) {
            return { ...eq, paId: null };
          }
          if (updates.computadorId && eq.id === updates.computadorId) {
            return { ...eq, paId: id };
          }
          return eq;
        })
      );
    }

    // Sync monitor links if changed
    if (updates.monitorIds !== undefined) {
      const oldMonitors = currentPA.monitorIds;
      const newMonitors = updates.monitorIds;

      setEquipments((prev) =>
        prev.map((eq) => {
          if (oldMonitors.includes(eq.id) && !newMonitors.includes(eq.id)) {
            return { ...eq, paId: null };
          }
          if (newMonitors.includes(eq.id) && !oldMonitors.includes(eq.id)) {
            return { ...eq, paId: id };
          }
          return eq;
        })
      );
    }

    // If floor code changed, sync floor object
    if (updates.code && updates.code !== currentPA.code) {
      setFloorObjects((prev) =>
        prev.map((f) => (f.paCode === currentPA.code ? { ...f, paCode: updates.code!, name: updates.code! } : f))
      );
    }

    // Log occurrence
    if (occurrenceDesc?.trim()) {
      addOccurrence({
        entityType: 'PA',
        entityId: id,
        entityCode: updates.code || currentPA.code,
        status: targetStatusName,
        descricao: occurrenceDesc.trim(),
      });
    }

    return { success: true };
  };

  // Delete PA
  const deletePA = (id: string) => {
    const targetPA = pas.find((p) => p.id === id);
    if (!targetPA) return;

    // Unbind equipments
    setEquipments((prev) => prev.map((eq) => (eq.paId === id ? { ...eq, paId: null } : eq)));

    // Remove from floor objects
    setFloorObjects((prev) => prev.filter((f) => f.paCode !== targetPA.code));

    // Delete PA
    setPas((prev) => prev.filter((p) => p.id !== id));
  };

  // Add Equipment
  const addEquipment = (eqData: Omit<Equipment, 'id' | 'createdAt'>, occurrenceDesc?: string): { success: boolean; error?: string } => {
    const cleanTag = eqData.patrimonio.trim().toUpperCase();

    if (!cleanTag) {
      return { success: false, error: 'O número do patrimônio é obrigatório.' };
    }

    const check = isPatrimonioUnique(cleanTag);
    if (!check.unique) {
      return { success: false, error: `Patrimônio já cadastrado: ${check.existingDetail}.` };
    }

    const statusObj = equipmentStatuses.find((s) => s.id === eqData.statusId || s.name === eqData.statusNome);
    if (statusObj?.requiresOccurrence && !occurrenceDesc?.trim()) {
      return { success: false, error: `O status "${eqData.statusNome}" exige a descrição de uma ocorrência.` };
    }

    const newId = `eq-${Date.now()}`;
    const newEquipment: Equipment = {
      ...eqData,
      id: newId,
      patrimonio: cleanTag,
      createdAt: formatDateNow(),
    };

    setEquipments((prev) => [...prev, newEquipment]);

    // If bound to a PA, update PA references
    if (newEquipment.paId) {
      setPas((prev) =>
        prev.map((p) => {
          if (p.id === newEquipment.paId) {
            if (newEquipment.categoria === 'Computador') {
              return { ...p, computadorId: newId };
            } else if (newEquipment.categoria === 'Monitor') {
              return { ...p, monitorIds: [...p.monitorIds.filter((m) => m !== newId), newId] };
            }
          }
          return p;
        })
      );
    }

    if (occurrenceDesc?.trim()) {
      addOccurrence({
        entityType: 'EQUIPMENT',
        entityId: newId,
        entityCode: `Patrimônio ${cleanTag}`,
        status: eqData.statusNome,
        descricao: occurrenceDesc.trim(),
      });
    }

    return { success: true };
  };

  // Update Equipment
  const updateEquipment = (id: string, updates: Partial<Equipment>, occurrenceDesc?: string): { success: boolean; error?: string } => {
    const currentEq = equipments.find((e) => e.id === id);
    if (!currentEq) return { success: false, error: 'Equipamento não encontrado.' };

    if (updates.patrimonio && updates.patrimonio.toUpperCase() !== currentEq.patrimonio.toUpperCase()) {
      const check = isPatrimonioUnique(updates.patrimonio, id);
      if (!check.unique) {
        return { success: false, error: `Patrimônio já cadastrado: ${check.existingDetail}.` };
      }
    }

    const targetStatusName = updates.statusNome || currentEq.statusNome;
    const targetStatusObj = equipmentStatuses.find((s) => s.name === targetStatusName);
    if (targetStatusObj?.requiresOccurrence && !occurrenceDesc?.trim() && updates.statusNome !== currentEq.statusNome) {
      return { success: false, error: `O status "${targetStatusName}" exige a descrição de uma ocorrência.` };
    }

    setEquipments((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return { ...e, ...updates };
        }
        return e;
      })
    );

    // If paId was updated directly, sync PA references
    if (updates.paId !== undefined && updates.paId !== currentEq.paId) {
      const oldPaId = currentEq.paId;
      const newPaId = updates.paId;

      setPas((prev) =>
        prev.map((p) => {
          let updatedP = { ...p };

          // Unbind from old PA
          if (oldPaId && p.id === oldPaId) {
            if (currentEq.categoria === 'Computador' && p.computadorId === id) {
              updatedP.computadorId = null;
            }
            if (currentEq.categoria === 'Monitor') {
              updatedP.monitorIds = p.monitorIds.filter((mId) => mId !== id);
            }
          }

          // Bind to new PA
          if (newPaId && p.id === newPaId) {
            if (currentEq.categoria === 'Computador') {
              updatedP.computadorId = id;
            }
            if (currentEq.categoria === 'Monitor' && !p.monitorIds.includes(id)) {
              updatedP.monitorIds = [...p.monitorIds, id];
            }
          }

          return updatedP;
        })
      );
    }

    if (occurrenceDesc?.trim()) {
      addOccurrence({
        entityType: 'EQUIPMENT',
        entityId: id,
        entityCode: `Patrimônio ${updates.patrimonio || currentEq.patrimonio}`,
        status: targetStatusName,
        descricao: occurrenceDesc.trim(),
      });
    }

    return { success: true };
  };

  // Transfer equipment between PAs or unbind
  const transferEquipment = (equipmentId: string, targetPaId: string | null): { success: boolean; error?: string } => {
    return updateEquipment(equipmentId, { paId: targetPaId });
  };

  // Unbind equipment
  const unbindEquipment = (equipmentId: string) => {
    updateEquipment(equipmentId, { paId: null });
  };

  // Delete Equipment
  const deleteEquipment = (id: string) => {
    const targetEq = equipments.find((e) => e.id === id);
    if (!targetEq) return;

    // Remove from PA references
    if (targetEq.paId) {
      setPas((prev) =>
        prev.map((p) => {
          if (p.id === targetEq.paId) {
            return {
              ...p,
              computadorId: p.computadorId === id ? null : p.computadorId,
              monitorIds: p.monitorIds.filter((m) => m !== id),
            };
          }
          return p;
        })
      );
    }

    setEquipments((prev) => prev.filter((e) => e.id !== id));
  };

  // Add Occurrence
  const addOccurrence = (occ: Omit<Occurrence, 'id' | 'data'>) => {
    const newOcc: Occurrence = {
      ...occ,
      id: `occ-${Date.now()}`,
      data: formatDateNow(),
    };
    setOccurrences((prev) => [newOcc, ...prev]);
  };

  // Get occurrences history
  const getHistoryForEntity = (entityType: 'PA' | 'EQUIPMENT', entityId: string): Occurrence[] => {
    return occurrences.filter((o) => o.entityType === entityType && o.entityId === entityId);
  };

  // Update Floor Objects (Floor plan editor save)
  const updateFloorObjects = (objects: FloorObject[]) => {
    setFloorObjects(objects);

    // Sync PA position fields on PA objects
    const paMapPositions = new Map<string, { x: number; y: number; rotation: number }>();
    objects.forEach((obj) => {
      if (obj.type === 'pa' && obj.paCode) {
        paMapPositions.set(obj.paCode, { x: obj.x, y: obj.y, rotation: obj.rotation });
      }
    });

    setPas((prev) =>
      prev.map((p) => {
        const pos = paMapPositions.get(p.code);
        if (pos) {
          return { ...p, x: pos.x, y: pos.y, rotation: pos.rotation };
        } else {
          return { ...p, x: null, y: null };
        }
      })
    );
  };

  // Add PA to floor plan map
  const addPAToMap = (paCode: string, x = 200, y = 200) => {
    const existing = floorObjects.find((f) => f.paCode === paCode);
    if (existing) return; // Already on map

    const paObj = pas.find((p) => p.code === paCode);
    const newFloorObj: FloorObject = {
      id: `flobj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      category: 'pa',
      type: 'pa',
      name: paCode,
      x,
      y,
      width: paObj?.width || 70,
      height: paObj?.height || 48,
      rotation: paObj?.rotation || 0,
      paCode,
    };

    setFloorObjects((prev) => [...prev, newFloorObj]);
    setPas((prev) => prev.map((p) => (p.code === paCode ? { ...p, x, y } : p)));
  };

  // Remove PA from floor plan map (Does NOT delete PA or assets!)
  const removePAFromMap = (paCode: string) => {
    setFloorObjects((prev) => prev.filter((f) => f.paCode !== paCode));
    setPas((prev) => prev.map((p) => (p.code === paCode ? { ...p, x: null, y: null } : p)));
  };

  // Configuration management methods
  const addPAType = (name: string) => {
    setPaTypes((prev) => [...prev, { id: `patype-${Date.now()}`, name, active: true }]);
  };

  const updatePAType = (id: string, updates: Partial<PAType>) => {
    setPaTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const addPAStatus = (name: string, requiresOccurrence: boolean, color: string) => {
    setPaStatuses((prev) => [...prev, { id: `pastatus-${Date.now()}`, name, requiresOccurrence, color, active: true }]);
  };

  const updatePAStatus = (id: string, updates: Partial<PAStatus>) => {
    setPaStatuses((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addEquipmentType = (name: string, category: 'Computador' | 'Monitor' | 'Outros') => {
    setEquipmentTypes((prev) => [...prev, { id: `eqtype-${Date.now()}`, name, category, active: true }]);
  };

  const updateEquipmentType = (id: string, updates: Partial<EquipmentType>) => {
    setEquipmentTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const addEquipmentStatus = (name: string, requiresOccurrence: boolean) => {
    setEquipmentStatuses((prev) => [...prev, { id: `eqstatus-${Date.now()}`, name, requiresOccurrence, active: true }]);
  };

  const updateEquipmentStatus = (id: string, updates: Partial<EquipmentStatus>) => {
    setEquipmentStatuses((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addUser = (username: string, name: string, role: 'Administrador' | 'Visualização') => {
    setUsers((prev) => [...prev, { id: `usr-${Date.now()}`, username, name, role, active: true }]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const setCurrentUserRole = (role: 'Administrador' | 'Visualização') => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  // Global search across PA codes and equipment asset tags
  const globalSearch = (query: string): GlobalSearchResult[] => {
    if (!query.trim()) return [];

    const q = query.trim().toLowerCase();
    const results: GlobalSearchResult[] = [];

    // Search PAs
    pas.forEach((pa) => {
      if (pa.code.toLowerCase().includes(q) || (pa.patrimonioPA && pa.patrimonioPA.toLowerCase().includes(q))) {
        const hasPos = floorObjects.some((f) => f.paCode === pa.code);
        results.push({
          id: `search-pa-${pa.id}`,
          type: 'PA',
          codeOrTag: pa.code,
          title: `${pa.code} (${pa.tipoNome})`,
          subtitle: `Patrimônio PA: ${pa.patrimonioPA || 'Sem tag'} · Status: ${pa.statusNome}`,
          status: pa.statusNome,
          paId: pa.id,
          hasFloorPosition: hasPos,
        });
      }
    });

    // Search Equipments/Patrimônios
    equipments.forEach((eq) => {
      if (eq.patrimonio.toLowerCase().includes(q) || eq.tipoNome.toLowerCase().includes(q)) {
        const boundPA = eq.paId ? pas.find((p) => p.id === eq.paId) : null;
        const hasPos = boundPA ? floorObjects.some((f) => f.paCode === boundPA.code) : false;

        results.push({
          id: `search-eq-${eq.id}`,
          type: 'PATRIMONIO',
          codeOrTag: eq.patrimonio,
          title: `Patrimônio ${eq.patrimonio} (${eq.tipoNome})`,
          subtitle: boundPA ? `Vinculado à ${boundPA.code}` : 'Equipamento sem PA',
          status: eq.statusNome,
          equipmentId: eq.id,
          paId: boundPA?.id,
          hasFloorPosition: hasPos,
        });
      }
    });

    return results;
  };

  return (
    <AppContext.Provider
      value={{
        pas,
        equipments,
        occurrences,
        floorObjects,
        paTypes,
        paStatuses,
        equipmentTypes,
        equipmentStatuses,
        users,
        currentUser,
        activeTab,
        setActiveTab,
        highlightedPAId,
        setHighlightedPAId,
        highlightedEquipmentId,
        setHighlightedEquipmentId,
        activePAFilter,
        setActivePAFilter,
        activePatrimonioFilter,
        setActivePatrimonioFilter,
        addPA,
        updatePA,
        deletePA,
        suggestNextPACode,
        addEquipment,
        updateEquipment,
        transferEquipment,
        unbindEquipment,
        deleteEquipment,
        addOccurrence,
        getHistoryForEntity,
        updateFloorObjects,
        addPAToMap,
        removePAFromMap,
        addPAType,
        updatePAType,
        addPAStatus,
        updatePAStatus,
        addEquipmentType,
        updateEquipmentType,
        addEquipmentStatus,
        updateEquipmentStatus,
        addUser,
        updateUser,
        setCurrentUserRole,
        globalSearch,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
