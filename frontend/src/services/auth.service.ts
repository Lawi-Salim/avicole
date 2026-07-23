import api from './api';

export interface User {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: string;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginPayload {
  email: string;
  mot_de_passe: string;
}

export interface RegisterPayload {
  nom: string;
  email: string;
  mot_de_passe: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: User;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/connexion', data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/auth/inscription', data).then((r) => r.data),

  getProfile: () =>
    api.get<User>('/auth/profil').then((r) => r.data),

  changePassword: (data: { mot_de_passe_actuel: string; nouveau_mot_de_passe: string }) =>
    api.patch<{ message: string }>('/auth/profil/mot-de-passe', data).then((r) => r.data),
};
