import api from './api';

export interface Parametrage {
  id: string;
  cout_standard_poussin: number;
  prix_vente_standard: number;
  seuil_mortalite_critique_pct: number;
  seuil_stock_bas_jours: number;
  updated_at: string;
}

export const parametragesService = {
  getAll: () =>
    api.get<Parametrage[]>('/parametrages').then((r) => r.data),

  update: (id: string, data: Partial<Parametrage>) =>
    api.patch<Parametrage>(`/parametrages/${id}`, data).then((r) => r.data),
};
