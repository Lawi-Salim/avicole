import api from './api';

export interface Vente {
  id: string;
  cycle_id: string;
  client_id: string | null;
  quantite: number;
  prix_unitaire: number;
  date: string;
  mode_paiement: 'especes' | 'mobile_money' | 'virement' | 'cheque' | 'credit';
  statut_paiement: 'paye' | 'partiel' | 'impaye';
  client?: { id: string; nom: string; type_client: string };
}

export interface CreateVentePayload {
  cycle_id: string;
  client_id?: string;
  quantite: number;
  prix_unitaire: number;
  date: string;
  mode_paiement: 'especes' | 'mobile_money' | 'virement' | 'cheque' | 'credit';
  statut_paiement: 'paye' | 'partiel' | 'impaye';
}

export interface FinancesData {
  cycle_id: string;
  numero_cycle: number;
  cout_total: number;
  total_ventes: number;
  marge: number;
  cout_revient_par_poulet: number;
  seuil_rentabilite: number;
  effectif_vivant: number;
}

export const ventesService = {
  getByCycle: (cycleId: string) =>
    api.get<Vente[]>(`/cycles/${cycleId}/ventes`).then((r) => r.data),

  create: (data: CreateVentePayload) =>
    api.post<Vente>('/ventes', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateVentePayload>) =>
    api.put<Vente>(`/ventes/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/ventes/${id}`).then((r) => r.data),
};
