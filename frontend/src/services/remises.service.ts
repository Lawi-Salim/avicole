import api from './api';

export interface RemiseTypeClient {
  [key: string]: number;
}

export interface RemiseVolume {
  seuil_min: number;
  seuil_max: number | null;
  remise_pct: number;
}

export const remisesService = {
  getRemiseMode: () =>
    api.get<'type_client' | 'volume' | 'aucun'>('/remises/mode').then((r) => r.data),

  setRemiseMode: (mode: 'type_client' | 'volume' | 'aucun') =>
    api.put('/remises/mode', { mode }),

  getRemisesByTypeClient: () =>
    api.get<RemiseTypeClient>('/remises/type-client').then((r) => r.data),

  getRemisesByVolume: () =>
    api.get<RemiseVolume[]>('/remises/volume').then((r) => r.data),

  updateRemiseTypeClient: (type_client: string, remise_pct: number) =>
    api.put('/remises/type-client', { type_client, remise_pct }),

  updateRemiseVolume: (seuil_min: number, seuil_max: number | null, remise_pct: number) =>
    api.put('/remises/volume', { seuil_min, seuil_max, remise_pct }),

  calculateRemise: (type_client: string, quantite: number) =>
    api.post('/remises/calculate', { type_client, quantite }).then((r) => r.data),
};
