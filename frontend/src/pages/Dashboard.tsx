import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { cyclesService, Cycle } from '../services/cycles.service';
import { santeService, Mortalite } from '../services/sante.service';
import { ventesService, Vente } from '../services/ventes.service';
import { depensesService, Depense } from '../services/depenses.service';

export default function Dashboard() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [mortalites, setMortalites] = useState<Mortalite[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [closedCycles, setClosedCycles] = useState<Cycle[]>([]);

  const loadData = useCallback(async () => {
    try {
      const allCycles = await cyclesService.getAll();
      setCycles(allCycles);

      const enCours = allCycles.find((c) => c.statut === 'en_cours');
      const clotures = allCycles.filter((c) => c.statut === 'cloture');
      setClosedCycles(clotures);

      if (enCours) {
        setCurrentCycle(enCours);
        const [m, v, d] = await Promise.all([
          santeService.getByCycle(enCours.id),
          ventesService.getByCycle(enCours.id),
          depensesService.getByCycle(enCours.id),
        ]);
        setMortalites(m);
        setVentes(v);
        setDepenses(d);
      }
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalMortalite = mortalites.reduce((sum, m) => sum + Number(m.nombre), 0);
  const effectifVivant = currentCycle
    ? currentCycle.effectif_initial - totalMortalite
    : 0;
  const tauxMortalite = currentCycle && currentCycle.effectif_initial > 0
    ? (totalMortalite / currentCycle.effectif_initial) * 100
    : 0;

  const totalVentesCycle = ventes
    .filter((v) => v.statut_paiement !== 'impaye')
    .reduce((sum, v) => sum + Number(v.quantite) * Number(v.prix_unitaire), 0);

  const totalDepensesCycle = depenses.reduce((sum, d) => sum + Number(d.montant), 0);
  const tresorerie = totalVentesCycle - totalDepensesCycle;
  const margeEstimee = totalVentesCycle - (totalDepensesCycle + (currentCycle
    ? Number(currentCycle.cout_achat_poussins) * currentCycle.effectif_initial
    : 0));

  if (loading) {
    return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="accent.1" /></Box>;
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="text.1">Vue d'ensemble</Heading>

      {error && (
        <Alert bg="danger.1" color="white" borderRadius="md" size="sm">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Section: Cycle en cours */}
      <Box>
        <Heading size="md" color="text.1" mb={4}>Cycle en cours</Heading>
        {currentCycle ? (
          <>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
                <CardBody py={3} px={4}>
                  <Text fontSize="xs" color="text.3">Effectif vivant</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="text.1">
                    {effectifVivant}
                  </Text>
                  <Text fontSize="xs" color="text.3">
                    sur {currentCycle.effectif_initial} initial
                  </Text>
                </CardBody>
              </Card>
              <Card bg="surface.1" borderColor={tauxMortalite > 5 ? 'danger.1' : 'border.1'} borderWidth="1px">
                <CardBody py={3} px={4}>
                  <Text fontSize="xs" color="text.3">Mortalité cumulée</Text>
                  <Text fontSize="2xl" fontWeight="bold" color={tauxMortalite > 5 ? 'danger.1' : 'text.1'}>
                    {totalMortalite}
                  </Text>
                  <Text fontSize="xs" color={tauxMortalite > 5 ? 'danger.1' : 'text.3'}>
                    {tauxMortalite.toFixed(1)}%
                  </Text>
                </CardBody>
              </Card>
              <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
                <CardBody py={3} px={4}>
                  <Text fontSize="xs" color="text.3">Trésorerie</Text>
                  <Text fontSize="2xl" fontWeight="bold" color={tresorerie >= 0 ? 'success.1' : 'danger.1'}>
                    {tresorerie >= 0 ? '+' : ''}{Math.round(tresorerie).toLocaleString('fr-FR')} KMF
                  </Text>
                  <Text fontSize="xs" color="text.3">
                    Ventes: {Math.round(totalVentesCycle).toLocaleString('fr-FR')} — Dépenses: {Math.round(totalDepensesCycle).toLocaleString('fr-FR')}
                  </Text>
                </CardBody>
              </Card>
              <Card bg="surface.1" borderColor={margeEstimee >= 0 ? 'border.1' : 'danger.1'} borderWidth="1px">
                <CardBody py={3} px={4}>
                  <Text fontSize="xs" color="text.3">Marge estimée</Text>
                  <Text fontSize="2xl" fontWeight="bold" color={margeEstimee >= 0 ? 'success.1' : 'danger.1'}>
                    {margeEstimee >= 0 ? '+' : ''}{Math.round(margeEstimee).toLocaleString('fr-FR')} KMF
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          </>
        ) : (
          <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
            <CardBody>
              <Text color="text.3" textAlign="center" py={4}>Aucun cycle en cours.</Text>
            </CardBody>
          </Card>
        )}
      </Box>

      {/* Section: Comparatif cycles clôturés */}
      <Box>
        <Heading size="md" color="text.1" mb={4}>Comparatif des cycles clôturés</Heading>
        {closedCycles.length === 0 ? (
          <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
            <CardBody>
              <Text color="text.3" textAlign="center" py={4}>Aucun cycle clôturé.</Text>
            </CardBody>
          </Card>
        ) : (
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th color="text.3">Cycle</Th>
                  <Th color="text.3">Date réception</Th>
                  <Th color="text.3">Effectif initial</Th>
                  <Th color="text.3">Coût total</Th>
                  <Th color="text.3">Recettes</Th>
                  <Th color="text.3">Marge</Th>
                  <Th color="text.3">Taux mortalité</Th>
                </Tr>
              </Thead>
              <Tbody>
                {closedCycles.map((c) => {
                  const mortalitePct = c.effectif_initial > 0 && c.bilan_mortalite_cumulee != null
                    ? ((c.bilan_mortalite_cumulee / c.effectif_initial) * 100)
                    : 0;
                  return (
                    <Tr key={c.id}>
                      <Td color="text.2" fontWeight="medium">Cycle #{c.numero_cycle}</Td>
                      <Td color="text.2">{new Date(c.date_reception).toLocaleDateString('fr-FR')}</Td>
                      <Td color="text.2">{c.effectif_initial}</Td>
                      <Td color="text.2">{(c.bilan_cout_total ?? 0).toLocaleString('fr-FR')} KMF</Td>
                      <Td color="text.2">{(c.bilan_recettes ?? 0).toLocaleString('fr-FR')} KMF</Td>
                      <Td>
                        <Text
                          fontWeight="bold"
                          color={(c.bilan_marge ?? 0) >= 0 ? 'success.1' : 'danger.1'}
                          fontSize="sm"
                        >
                          {(c.bilan_marge ?? 0) >= 0 ? '+' : ''}{(c.bilan_marge ?? 0).toLocaleString('fr-FR')} KMF
                        </Text>
                      </Td>
                      <Td>
                        <Text
                          color={mortalitePct > 5 ? 'danger.1' : 'text.2'}
                          fontSize="sm"
                        >
                          {mortalitePct.toFixed(1)}%
                        </Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </VStack>
  );
}
