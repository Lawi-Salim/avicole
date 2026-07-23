import api from './api';

export const exportService = {
  exportCycles: (period?: number) => {
    const params: Record<string, string> = {};
    if (period && period > 0) params.period = String(period);
    return api.get('/export/cycles', { params, responseType: 'blob' });
  },

  exportClients: () =>
    api.get('/export/clients', { responseType: 'blob' }),

  exportVentes: (cycleId?: string, statut?: string) => {
    const params: Record<string, string> = {};
    if (cycleId) params.cycleId = cycleId;
    if (statut) params.statut = statut;
    return api.get('/export/ventes', { params, responseType: 'blob' });
  },

  exportDonneesBrutes: () =>
    api.get('/export/donnees-brutes', { responseType: 'blob' }),
};
