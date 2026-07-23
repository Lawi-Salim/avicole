import api from './api';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: 'admin' | 'employe' | 'comptable';
  actif: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateUtilisateurPayload {
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  mot_de_passe: string;
  role: string;
}

export const utilisateursService = {
  getAll: () =>
    api.get<Utilisateur[]>('/utilisateurs').then((r) => r.data),

  getById: (id: string) =>
    api.get<Utilisateur>(`/utilisateurs/${id}`).then((r) => r.data),

  create: (data: CreateUtilisateurPayload) =>
    api.post<Utilisateur>('/utilisateurs', data).then((r) => r.data),

  update: (id: string, data: Partial<{ nom: string; prenom?: string; email: string; telephone?: string; adresse?: string; role: string; actif: boolean }>) =>
    api.patch<Utilisateur>(`/utilisateurs/${id}`, data).then((r) => r.data),

  toggleActif: (id: string) =>
    api.patch<Utilisateur>(`/utilisateurs/${id}/toggle-actif`).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/utilisateurs/${id}`).then((r) => r.data),
};
