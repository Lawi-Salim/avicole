import api from './api';

export interface Cycle {
  id: string;
  numero_cycle: string;
  date_reception: string;
  effectif_initial: number;
  effectif_actuel: number;
  cout_achat_poussins: number;
  phase_courante: string;
  statut: 'en_cours' | 'cloture';
  cout_total?: number;
  mortalite_cumulee?: number;
  taux_mortalite_pct?: number;
  created_at: string;
  updated_at: string;
  cree_par?: { id: string; nom: string; photo?: string };
}

export interface CreateCyclePayload {
  numero_cycle: string;
  date_reception: string;
  effectif_initial: number;
  cout_achat_poussins: number;
}

export const cyclesService = {
  getAll: () => api.get<Cycle[]>('/cycles').then((r) => r.data),

  getById: (id: string) =>
    api.get<Cycle>(`/cycles/${id}`).then((r) => r.data),

  create: (data: CreateCyclePayload) =>
    api.post<Cycle>('/cycles', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateCyclePayload>) =>
    api.patch<Cycle>(`/cycles/${id}`, data).then((r) => r.data),

  changePhase: (id: string, phase_courante: string) =>
    api.patch<Cycle>(`/cycles/${id}/phase`, { phase: phase_courante }).then((r) => r.data),

  cloture: (id: string) =>
    api.post<Cycle>(`/cycles/${id}/cloture`).then((r) => r.data),
};
