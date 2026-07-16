import api from './api';

export interface ProduitVeterinaire {
  id: string;
  nom: string;
  type_produit: 'vaccin' | 'antibiotique' | 'vitamine' | 'autre';
  quantite_stock: number;
  unite: string;
  seuil_alerte: number;
  date_peremption: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProduitPayload {
  nom: string;
  type_produit: string;
  quantite_stock: number;
  unite: string;
  seuil_alerte: number;
  date_peremption?: string;
}

export const produitsService = {
  getAll: () =>
    api.get<ProduitVeterinaire[]>('/produits-veterinaires').then((r) => r.data),

  getById: (id: string) =>
    api.get<ProduitVeterinaire>(`/produits-veterinaires/${id}`).then((r) => r.data),

  create: (data: CreateProduitPayload) =>
    api.post<ProduitVeterinaire>('/produits-veterinaires', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateProduitPayload>) =>
    api.put<ProduitVeterinaire>(`/produits-veterinaires/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/produits-veterinaires/${id}`).then((r) => r.data),
};
