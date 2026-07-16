import api from './api';

export interface Alerte {
  id: string;
  type_alerte: 'stock_bas' | 'mortalite_anormale' | 'risque' | 'peremption_produit';
  niveau: 'info' | 'warning' | 'critical';
  cycle_id: string | null;
  risque_id: string | null;
  produit_veterinaire_id: string | null;
  message: string;
  resolue: boolean;
  resolue_at: string | null;
  created_at: string;
}

export const alertesService = {
  getAll: () =>
    api.get<Alerte[]>('/alertes').then((r) => r.data),

  getNonResolues: () =>
    api.get<Alerte[]>('/alertes/non-resolues').then((r) => r.data),

  markAsResolue: (id: string) =>
    api.patch<Alerte>(`/alertes/${id}/resoudre`).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/alertes/${id}`).then((r) => r.data),
};
