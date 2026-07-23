import { Controller, Get, Header, Query, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  private buildCsvRow(fields: (string | number | null | undefined)[]): string {
    return fields.map((f) => {
      if (f == null) return '';
      const str = String(f);
      if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(';');
  }

  @Get('cycles')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCycles(
    @Res({ passthrough: true }) res: Response,
    @Query('period') period?: string,
  ) {
    try {
      const BOM = '\uFEFF';
      const headers = [
        'Cycle', 'Date réception', 'Effectif initial',
        'Coût total (KMF)', 'Recettes (KMF)', 'Marge (KMF)',
        'Taux mortalité (%)', 'Date clôture',
      ];

      let cycles: any[] = await this.sequelize.query(
        `SELECT * FROM cycles WHERE statut = 'cloture' ORDER BY date_reception DESC`,
        { type: 'SELECT' },
      );

      const periodNum = period ? parseInt(period, 10) : undefined;
      if (periodNum && periodNum > 0) {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - periodNum);
        cycles = cycles.filter((c) => new Date(c.date_reception) >= cutoff);
      }

      const rows = cycles.map((c) => {
        const tauxMortalite =
          Number(c.effectif_initial) > 0 && c.bilan_mortalite_cumulee != null
            ? ((Number(c.bilan_mortalite_cumulee) / Number(c.effectif_initial)) * 100).toFixed(2)
            : '0,00';

        return this.buildCsvRow([
          `Cycle #${c.numero_cycle}`,
          c.date_reception,
          c.effectif_initial,
          (c.bilan_cout_total ?? 0).toLocaleString('fr-FR'),
          (c.bilan_recettes ?? 0).toLocaleString('fr-FR'),
          (c.bilan_marge ?? 0).toLocaleString('fr-FR'),
          tauxMortalite,
          c.date_cloture || '',
        ]);
      });

      const csv = BOM + [headers.join(';'), ...rows].join('\n');
      res.setHeader('Content-Disposition', 'attachment; filename=cycles-export.csv');
      return csv;
    } catch (error) {
      this.logger.error('Erreur export cycles', (error as Error).stack);
      res.status(500);
      return { message: 'Erreur lors de l\'export CSV des cycles' };
    }
  }

  @Get('clients')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportClients(@Res({ passthrough: true }) res: Response) {
    try {
      const BOM = '\uFEFF';
      const headers = [
        'ID', 'Nom', 'Type client', 'Contact', 'Email', 'Adresse', 'Notes', 'Date création',
      ];

      const clients: any[] = await this.sequelize.query(
        `SELECT * FROM clients WHERE deleted_at IS NULL ORDER BY nom ASC`,
        { type: 'SELECT' },
      );

      const rows = clients.map((c) => this.buildCsvRow([
        c.id,
        c.nom,
        c.type_client || '',
        c.contact || '',
        c.email || '',
        c.adresse || '',
        c.notes || '',
        c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '',
      ]));

      const csv = BOM + [headers.join(';'), ...rows].join('\n');
      res.setHeader('Content-Disposition', 'attachment; filename=clients-export.csv');
      return csv;
    } catch (error) {
      this.logger.error('Erreur export clients', (error as Error).stack);
      res.status(500);
      return { message: 'Erreur lors de l\'export CSV des clients' };
    }
  }

  @Get('ventes')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportVentes(
    @Res({ passthrough: true }) res: Response,
    @Query('cycleId') cycleId?: string,
    @Query('statut') statut?: string,
  ) {
    try {
      const BOM = '\uFEFF';
      const headers = [
        'ID', 'Cycle', 'Client', 'Catégorie', 'Quantité', 'Prix unitaire',
        'Remise', 'Total', 'Date', 'Mode paiement', 'Statut',
      ];

      let sql = `SELECT * FROM ventes`;
      const replacements: Record<string, string> = {};
      const conditions: string[] = [];

      if (cycleId) {
        conditions.push(`cycle_id = :cycleId`);
        replacements.cycleId = cycleId;
      }
      if (statut) {
        conditions.push(`statut_paiement = :statut`);
        replacements.statut = statut;
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
      sql += ` ORDER BY date ASC`;

      const ventes: any[] = await this.sequelize.query(sql, {
        replacements,
        type: 'SELECT',
      });

      const cycleIds = [...new Set(ventes.map((v) => v.cycle_id))];
      const clientIds = [...new Set(ventes.map((v) => v.client_id).filter(Boolean))] as string[];

      let cycles: any[] = [];
      let clients: any[] = [];

      if (cycleIds.length > 0) {
        cycles = await this.sequelize.query(
          `SELECT id, numero_cycle FROM cycles WHERE id IN (:cycleIds)`,
          { replacements: { cycleIds }, type: 'SELECT' },
        );
      }
      if (clientIds.length > 0) {
        clients = await this.sequelize.query(
          `SELECT id, nom FROM clients WHERE id IN (:clientIds)`,
          { replacements: { clientIds }, type: 'SELECT' },
        );
      }

      const cycleMap = new Map(cycles.map((c: any) => [c.id, c.numero_cycle]));
      const clientMap = new Map(clients.map((c: any) => [c.id, c.nom]));

      const rows = ventes.map((v) => {
        const montantTotal = (Number(v.quantite) || 0) * (Number(v.prix_unitaire) || 0) - Number(v.remise || 0);
        const cycleNumero = cycleMap.get(v.cycle_id);
        const clientNom = v.client_id ? clientMap.get(v.client_id) || '' : '';

        return this.buildCsvRow([
          v.id,
          cycleNumero != null ? `Cycle #${cycleNumero}` : v.cycle_id,
          clientNom,
          v.categorie_produit || '',
          v.quantite,
          Number(v.prix_unitaire).toLocaleString('fr-FR'),
          Number(v.remise || 0).toLocaleString('fr-FR'),
          montantTotal.toLocaleString('fr-FR'),
          v.date,
          v.mode_paiement,
          v.statut_paiement,
        ]);
      });

      const csv = BOM + [headers.join(';'), ...rows].join('\n');
      res.setHeader('Content-Disposition', 'attachment; filename=ventes-export.csv');
      return csv;
    } catch (error) {
      this.logger.error('Erreur export ventes', (error as Error).stack);
      res.status(500);
      return { message: 'Erreur lors de l\'export CSV des ventes' };
    }
  }

  @Roles('admin')
  @Get('donnees-brutes')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportDonneesBrutes(@Res({ passthrough: true }) res: Response) {
    try {
      const BOM = '\uFEFF';
      const sections: string[] = [];

      sections.push('=== CYCLES ===');
      const cycles: any[] = await this.sequelize.query(
        `SELECT * FROM cycles ORDER BY numero_cycle ASC`,
        { type: 'SELECT' },
      );
      sections.push(this.buildCsvRow([
        'id', 'numero_cycle', 'date_reception', 'effectif_initial',
        'statut', 'phase_courante',
        'bilan_cout_total', 'bilan_recettes', 'bilan_marge',
        'bilan_mortalite_cumulee', 'bilan_cout_revient_par_poulet',
        'bilan_seuil_rentabilite', 'date_cloture',
      ]));
      for (const c of cycles) {
        sections.push(this.buildCsvRow([
          c.id, c.numero_cycle, c.date_reception, c.effectif_initial,
          c.statut, c.phase_courante,
          c.bilan_cout_total ?? '', c.bilan_recettes ?? '', c.bilan_marge ?? '',
          c.bilan_mortalite_cumulee ?? '', c.bilan_cout_revient_par_poulet ?? '',
          c.bilan_seuil_rentabilite ?? '', c.date_cloture ?? '',
        ]));
      }

      sections.push('');
      sections.push('=== MORTALITES ===');
      const mortalites: any[] = await this.sequelize.query(
        `SELECT * FROM mortalites ORDER BY date ASC`,
        { type: 'SELECT' },
      );
      sections.push(this.buildCsvRow(['id', 'cycle_id', 'date', 'nombre', 'cause']));
      for (const m of mortalites) {
        sections.push(this.buildCsvRow([m.id, m.cycle_id, m.date, m.nombre, m.cause || '']));
      }

      sections.push('');
      sections.push('=== VENTES ===');
      const ventes: any[] = await this.sequelize.query(
        `SELECT * FROM ventes ORDER BY date ASC`,
        { type: 'SELECT' },
      );
      sections.push(this.buildCsvRow([
        'id', 'cycle_id', 'client_id', 'quantite', 'prix_unitaire',
        'montant_total', 'date', 'mode_paiement', 'statut_paiement', 'remise',
      ]));
      for (const v of ventes) {
        const montantTotal = (Number(v.quantite) || 0) * (Number(v.prix_unitaire) || 0);
        sections.push(this.buildCsvRow([
          v.id, v.cycle_id, v.client_id ?? '', v.quantite, v.prix_unitaire,
          montantTotal, v.date, v.mode_paiement, v.statut_paiement, v.remise ?? 0,
        ]));
      }

      sections.push('');
      sections.push('=== DEPENSES ===');
      const depenses: any[] = await this.sequelize.query(
        `SELECT * FROM depenses ORDER BY date ASC`,
        { type: 'SELECT' },
      );
      sections.push(this.buildCsvRow(['id', 'cycle_id', 'categorie', 'montant', 'date', 'description']));
      for (const d of depenses) {
        sections.push(this.buildCsvRow([d.id, d.cycle_id, d.categorie, d.montant, d.date, d.description || '']));
      }

      sections.push('');
      sections.push('=== CLIENTS ===');
      const clients: any[] = await this.sequelize.query(
        `SELECT * FROM clients WHERE deleted_at IS NULL ORDER BY nom ASC`,
        { type: 'SELECT' },
      );
      sections.push(this.buildCsvRow(['id', 'nom', 'type_client', 'contact', 'email', 'adresse']));
      for (const cl of clients) {
        sections.push(this.buildCsvRow([cl.id, cl.nom, cl.type_client || '', cl.contact || '', cl.email || '', cl.adresse || '']));
      }

      const csv = BOM + sections.join('\n');
      res.setHeader('Content-Disposition', 'attachment; filename=donnees-brutes-export.csv');
      return csv;
    } catch (error) {
      this.logger.error('Erreur export données brutes', (error as Error).stack);
      res.status(500);
      return { message: 'Erreur lors de l\'export des données brutes' };
    }
  }
}
