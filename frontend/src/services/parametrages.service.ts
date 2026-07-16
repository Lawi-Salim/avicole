import api from './api';

export interface Parametrage {
  id: string;
  cout_standard_poussin: number;
  prix_vente_standard: number;
  seuil_mortalite_critique_pct: number;
  seuil_stock_bas_jours: number;
  actif: boolean;
  updated_at: string;
}

export const parametragesService = {
  getAll: () =>
    api.get<Parametrage[]>('/parametrages').then((r) => r.data),

  getCurrent: () =>
    api.get<Parametrage>('/parametrages/current').then((r) => r.data),

  update: (id: string, data: Partial<Parametrage>) =>
    api.patch<Parametrage>(`/parametrages/${id}`, data).then((r) => r.data),

  updateCurrent: (data: Partial<Parametrage>) =>
    api.put<Parametrage>('/parametrages/current', data).then((r) => r.data),
};
