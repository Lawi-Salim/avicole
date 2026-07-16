import api from './api';

export interface Vaccination {
  id: string;
  cycle_id: string;
  produit_id: string | null;
  produit: string;
  date_prevue: string;
  date_realisee: string | null;
  rappel: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVaccinationPayload {
  cycle_id: string;
  produit_id?: string;
  produit: string;
  date_prevue: string;
  date_realisee?: string;
  rappel?: boolean;
  notes?: string;
}

export const vaccinationsService = {
  getByCycle: (cycleId: string) =>
    api.get<Vaccination[]>(`/cycles/${cycleId}/vaccinations`).then((r) => r.data),

  create: (data: CreateVaccinationPayload) =>
    api.post<Vaccination>('/vaccinations', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateVaccinationPayload>) =>
    api.put<Vaccination>(`/vaccinations/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/vaccinations/${id}`).then((r) => r.data),
};
