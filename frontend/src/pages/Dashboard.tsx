import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Select,
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
  HStack,
} from '@chakra-ui/react';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cyclesService, Cycle } from '../services/cycles.service';
import { santeService, Mortalite } from '../services/sante.service';
import { ventesService, Vente } from '../services/ventes.service';
import { depensesService, Depense } from '../services/depenses.service';
import Pagination from '../components/Pagination';

const TREND_THRESHOLD = 0.05;
const ITEMS_PER_PAGE = 10;

function TrendArrow({ value, invert }: { value: number; invert?: boolean }) {
  const isPositive = invert ? value < 0 : value > 0;
  if (Math.abs(value) < TREND_THRESHOLD) return null;
  return (
    <HStack spacing={0} color={isPositive ? 'success.1' : 'danger.1'} fontSize="xs" fontWeight="bold">
      {isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />}
      <Text>{Math.abs(value).toFixed(1)}%</Text>
    </HStack>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredClosedCycles = useMemo(() => {
    let result = period === 0 ? closedCycles : (() => {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - period);
      return closedCycles.filter((c) => new Date(c.date_reception) >= cutoff);
    })();
    result = [...result].sort((a, b) => Number(a.numero_cycle) - Number(b.numero_cycle));
    return result;
  }, [closedCycles, period]);

  const totalPages = Math.ceil(filteredClosedCycles.length / ITEMS_PER_PAGE);
  const paginatedClosedCycles = filteredClosedCycles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [period]);

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

  const chartData = useMemo(() => {
    return filteredClosedCycles.map((c) => ({
      name: `C#${c.numero_cycle}`,
      marge: c.bilan_marge ?? 0,
      recettes: c.bilan_recettes ?? 0,
      couts: c.bilan_cout_total ?? 0,
    }));
  }, [filteredClosedCycles]);

  const prevMarge = filteredClosedCycles.length >= 2
    ? filteredClosedCycles[filteredClosedCycles.length - 2]?.bilan_marge ?? 0
    : 0;
  const currMarge = filteredClosedCycles.length >= 1
    ? filteredClosedCycles[filteredClosedCycles.length - 1]?.bilan_marge ?? 0
    : 0;
  const margeTrend = prevMarge !== 0 ? ((currMarge - prevMarge) / Math.abs(prevMarge)) * 100 : 0;

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
                  <HStack align="baseline" spacing={2}>
                    <Text fontSize="2xl" fontWeight="bold" color={tauxMortalite > 5 ? 'danger.1' : 'text.1'}>
                      {totalMortalite}
                    </Text>
                  </HStack>
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

      <Box>
        <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
          <HStack spacing={3} align="baseline">
            <Heading size="md" color="text.1">Comparatif des cycles clôturés</Heading>
            <TrendArrow value={margeTrend} />
          </HStack>
          <Select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            bg="surface.1"
            borderColor="border.1"
            w="auto"
            fontSize="sm"
            size="sm"
            borderRadius="md"
          >
            <option value={3}>3 derniers mois</option>
            <option value={6}>6 derniers mois</option>
            <option value={12}>12 derniers mois</option>
            <option value={0}>Tout afficher</option>
          </Select>
        </HStack>

        {chartData.length > 0 && (
          <Card bg="surface.1" borderColor="border.1" borderWidth="1px" mb={4}>
            <CardBody py={4}>
              <Text fontSize="sm" fontWeight="medium" color="text.2" mb={3}>Évolution des marges</Text>
              <Box h="200px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: unknown) => [`${Number(value).toLocaleString('fr-FR')} KMF`]}
                      contentStyle={{ backgroundColor: '#a5a7ab', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    />
                    <Bar dataKey="marge" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.marge >= 0 ? '#38A169' : '#E53E3E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        )}

        {filteredClosedCycles.length === 0 ? (
          <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
            <CardBody>
              <Text color="text.3" textAlign="center" py={4}>Aucun cycle clôturé sur cette période.</Text>
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
                  <Th color="text.3">Détails</Th>
                </Tr>
              </Thead>
              <Tbody>
                {[...paginatedClosedCycles].reverse().map((c) => {
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
                      <Td>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="accent.1"
                          onClick={() => navigate(`/cycles/${c.id}`)}
                        >
                          Voir détails
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
        {filteredClosedCycles.length > 0 && (
          <Box mt={4}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </Box>
        )}
      </Box>
    </VStack>
  );
}
