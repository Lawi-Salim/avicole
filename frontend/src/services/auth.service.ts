import api from './api';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
  photo?: string;
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
};
