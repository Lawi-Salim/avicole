import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  Input,
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
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { cyclesService, Cycle } from '../services/cycles.service';
import { stocksService, Stock, CreateStockPayload } from '../services/stocks.service';
import { santeService, Mortalite, CreateMortalitePayload } from '../services/sante.service';

const PHASES = [
  { value: 'preparation', label: 'Préparation' },
  { value: 'demarrage', label: 'Démarrage' },
  { value: 'croissance', label: 'Croissance' },
  { value: 'finition', label: 'Finition' },
  { value: 'commercialisation', label: 'Commercialisation' },
  { value: 'nettoyage', label: 'Nettoyage' },
];

const TYPE_STOCK_LABELS: Record<string, string> = {
  aliment: 'Aliment',
  vaccin: 'Vaccin',
  litiere: 'Litière',
};

export default function CycleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [mortalites, setMortalites] = useState<Mortalite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPhase, setNewPhase] = useState('');
  const [cloturing, setCloturing] = useState(false);

  // Stock form
  const [stockForm, setStockForm] = useState<CreateStockPayload>({
    type_stock: 'aliment',
    sens: 'entree',
    quantite: 0,
    cout: 0,
    date: new Date().toISOString().slice(0, 10),
    fournisseur: '',
  });
  const [stockLoading, setStockLoading] = useState(false);

  // Mortalité form
  const [mortForm, setMortForm] = useState<CreateMortalitePayload>({
    date: new Date().toISOString().slice(0, 10),
    nombre: 0,
    cause: '',
  });
  const [mortLoading, setMortLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [c, s, m] = await Promise.all([
        cyclesService.getById(id),
        stocksService.getByCycle(id),
        santeService.getByCycle(id),
      ]);
      setCycle(c);
      setStocks(s);
      setMortalites(m);
      setNewPhase(c.phase_courante);
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleChangePhase = async () => {
    if (!id || !newPhase) return;
    setError('');
    try {
      const updated = await cyclesService.changePhase(id, newPhase);
      setCycle(updated);
      showSuccess('Phase mise à jour');
    } catch {
      setError('Erreur lors du changement de phase');
    }
  };

  const handleCloture = async () => {
    if (!id) return;
    setCloturing(true);
    setError('');
    try {
      const updated = await cyclesService.cloture(id);
      setCycle(updated);
      showSuccess('Cycle clôturé avec succès');
    } catch {
      setError('Erreur lors de la clôture');
    } finally {
      setCloturing(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setStockLoading(true);
    setError('');
    try {
      await stocksService.create(id, stockForm);
      const s = await stocksService.getByCycle(id);
      setStocks(s);
      setStockForm({
        type_stock: 'aliment',
        sens: 'entree',
        quantite: 0,
        cout: 0,
        date: new Date().toISOString().slice(0, 10),
        fournisseur: '',
      });
      showSuccess('Mouvement de stock ajouté');
    } catch {
      setError('Erreur lors de l\'ajout du stock');
    } finally {
      setStockLoading(false);
    }
  };

  const handleDeleteStock = async (stockId: string) => {
    if (!id) return;
    try {
      await stocksService.remove(stockId);
      setStocks((prev) => prev.filter((s) => s.id !== stockId));
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const handleAddMortalite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setMortLoading(true);
    setError('');
    try {
      await santeService.create(id, mortForm);
      const m = await santeService.getByCycle(id);
      setMortalites(m);
      setMortForm({
        date: new Date().toISOString().slice(0, 10),
        nombre: 0,
        cause: '',
      });
      showSuccess('Mortalité enregistrée');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || '';
      if (msg.includes('unique') || msg.includes('dupliquée')) {
        setError('Une mortalité existe déjà pour cette date. Modifiez la date ou la journée précédente.');
      } else {
        setError('Erreur lors de l\'enregistrement');
      }
    } finally {
      setMortLoading(false);
    }
  };

  const handleDeleteMortalite = async (mortId: string) => {
    if (!id) return;
    try {
      await santeService.remove(mortId);
      setMortalites((prev) => prev.filter((m) => m.id !== mortId));
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const totalMortalite = (mortalites || []).reduce((sum, m) => sum + Number(m.nombre), 0);
  const tauxMortalite = cycle && cycle.effectif_initial > 0
    ? ((totalMortalite / cycle.effectif_initial) * 100)
    : 0;
  const totalStockCout = (stocks || []).reduce((sum, s) => sum + Number(s.cout), 0);

  if (loading) {
    return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="accent.1" /></Box>;
  }

  if (!cycle) {
    return (
      <Alert bg="danger.1" color="white" borderRadius="md">
        <AlertIcon />
        Cycle non trouvé.
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {error && (
        <Alert bg="danger.1" color="white" borderRadius="md" size="sm">
          <AlertIcon />
          {error}
        </Alert>
      )}
      {success && (
        <Alert bg="success.1" color="white" borderRadius="md" size="sm">
          <AlertIcon />
          {success}
        </Alert>
      )}

      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <HStack>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            color="text.2"
            onClick={() => navigate('/cycles')}
          >
            Retour
          </Button>
          <Heading size="lg" color="text.1">{cycle.numero_cycle}</Heading>
          <Badge
            bg={cycle.statut === 'en_cours' ? 'success.1' : 'surface.3'}
            color={cycle.statut === 'en_cours' ? 'white' : 'text.2'}
            borderRadius="full"
            px={2}
          >
            {cycle.statut === 'en_cours' ? 'En cours' : 'Clôturé'}
          </Badge>
        </HStack>

        {cycle.statut === 'en_cours' && (
          <HStack>
            <Select
              value={newPhase}
              onChange={(e) => setNewPhase(e.target.value)}
              bg="surface.1"
              borderColor="border.1"
              w="auto"
              size="sm"
              _focus={{ borderColor: 'accent.1' }}
            >
              {PHASES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
            <Button
              size="sm"
              bg="accent.1"
              color="gray.900"
              _hover={{ bg: 'accent.2' }}
              leftIcon={<FiCheck />}
              onClick={handleChangePhase}
              fontWeight="bold"
            >
              Appliquer
            </Button>
            <Button
              size="sm"
              bg="danger.1"
              color="white"
              _hover={{ opacity: 0.8 }}
              onClick={handleCloture}
              isLoading={cloturing}
              fontWeight="bold"
            >
              Clôturer
            </Button>
          </HStack>
        )}
      </HStack>

      {/* Infos du cycle */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {[
          { label: 'Date réception', value: new Date(cycle.date_reception).toLocaleDateString('fr-FR') },
          { label: 'Effectif initial', value: cycle.effectif_initial.toString() },
          { label: 'Phase', value: PHASES.find((p) => p.value === cycle.phase_courante)?.label || cycle.phase_courante },
          { label: 'Coût total', value: `${Math.round(Number(cycle.cout_total) || (Number(cycle.effectif_initial) * Number(cycle.cout_achat_poussins)) + totalStockCout).toLocaleString('fr-FR')} KMF` },
        ].map(({ label, value }) => (
          <Card key={label} bg="surface.1" borderColor="border.1" borderWidth="1px">
            <CardBody py={3} px={4}>
              <Text fontSize="xs" color="text.3">{label}</Text>
              <Text fontSize="md" fontWeight="bold" color="text.1">{value}</Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Bilan mortalité */}
      {cycle.statut === 'cloture' && (
        <Card bg="surface.1" borderColor="danger.1" borderWidth="1px">
          <CardBody>
            <Text fontSize="sm" color="text.3">Bilan clôture — Mortalité cumulée</Text>
            <Text fontSize="2xl" fontWeight="bold" color={tauxMortalite > 5 ? 'danger.1' : 'text.1'}>
              {totalMortalite} morts ({tauxMortalite.toFixed(1)}%)
            </Text>
          </CardBody>
        </Card>
      )}

      {/* Onglets Stocks / Mortalité */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab _selected={{ bg: 'surface.2', color: 'accent.1' }} color="text.3">
            Stocks ({stocks.length})
          </Tab>
          <Tab _selected={{ bg: 'surface.2', color: 'accent.1' }} color="text.3">
            Mortalité ({mortalites.length})
          </Tab>
        </TabList>

        <TabPanels>
          {/* --- ONGLET STOCKS --- */}
          <TabPanel px={0} pt={4}>
            {cycle.statut === 'en_cours' && (
              <Card bg="surface.1" borderColor="border.1" borderWidth="1px" mb={4}>
                <CardBody>
                  <Heading size="sm" color="text.1" mb={3}>Ajouter un mouvement</Heading>
                  <Box as="form" onSubmit={handleAddStock}>
                    <SimpleGrid columns={{ base: 2, md: 6 }} spacing={3}>
                      <Select
                        value={stockForm.type_stock}
                        onChange={(e) => setStockForm({ ...stockForm, type_stock: e.target.value as CreateStockPayload['type_stock'] })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                      >
                        <option value="aliment">Aliment</option>
                        <option value="vaccin">Vaccin</option>
                        <option value="litiere">Litière</option>
                      </Select>
                      <Select
                        value={stockForm.sens}
                        onChange={(e) => setStockForm({ ...stockForm, sens: e.target.value as CreateStockPayload['sens'] })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                      >
                        <option value="entree">Entrée</option>
                        <option value="sortie">Sortie</option>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Quantité"
                        value={stockForm.quantite || ''}
                        onChange={(e) => setStockForm({ ...stockForm, quantite: Number(e.target.value) })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                        min={0}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Coût (FCFA)"
                        value={stockForm.cout || ''}
                        onChange={(e) => setStockForm({ ...stockForm, cout: Number(e.target.value) })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                        min={0}
                        required
                      />
                      <Input
                        type="date"
                        value={stockForm.date}
                        onChange={(e) => setStockForm({ ...stockForm, date: e.target.value })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                        required
                      />
                      <Input
                        placeholder="Fournisseur"
                        value={stockForm.fournisseur}
                        onChange={(e) => setStockForm({ ...stockForm, fournisseur: e.target.value })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                        required
                      />
                    </SimpleGrid>
                    <Button
                      type="submit"
                      mt={3}
                      size="sm"
                      bg="accent.1"
                      color="gray.900"
                      _hover={{ bg: 'accent.2' }}
                      leftIcon={<FiPlus />}
                      isLoading={stockLoading}
                      fontWeight="bold"
                    >
                      Ajouter
                    </Button>
                  </Box>
                </CardBody>
              </Card>
            )}

            {stocks.length === 0 ? (
              <Text color="text.3" textAlign="center" py={6}>Aucun mouvement de stock.</Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="text.3">Date</Th>
                      <Th color="text.3">Type</Th>
                      <Th color="text.3">Sens</Th>
                      <Th color="text.3">Quantité</Th>
                      <Th color="text.3">Coût</Th>
                      <Th color="text.3">Fournisseur</Th>
                      <Th />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stocks.map((s) => (
                      <Tr key={s.id}>
                        <Td color="text.2">{new Date(s.date).toLocaleDateString('fr-FR')}</Td>
                        <Td color="text.2">{TYPE_STOCK_LABELS[s.type_stock] || s.type_stock}</Td>
                        <Td>
                          <Badge bg={s.sens === 'entree' ? 'success.1' : 'warning.1'} color="white" fontSize="xs">
                            {s.sens === 'entree' ? 'Entrée' : 'Sortie'}
                          </Badge>
                        </Td>
                        <Td color="text.2">{Math.round(s.quantite)}</Td>
                        <Td color="text.2">{Math.round(s.cout).toLocaleString('fr-FR')} KMF</Td>
                        <Td color="text.2">{s.fournisseur}</Td>
                        <Td>
                          {cycle.statut === 'en_cours' && (
                            <Tooltip label="Supprimer">
                              <IconButton
                                aria-label="Supprimer"
                                icon={<FiTrash2 />}
                                size="xs"
                                variant="ghost"
                                color="danger.1"
                                onClick={() => handleDeleteStock(s.id)}
                              />
                            </Tooltip>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}

            {stocks.length > 0 && (
              <HStack justify="flex-end" mt={3}>
                <Text fontSize="sm" color="text.3">
                  Total coût: <strong color="text.1">{Math.round(totalStockCout).toLocaleString('fr-FR')} KMF</strong>
                </Text>
              </HStack>
            )}
          </TabPanel>

          {/* --- ONGLET MORTALITÉ --- */}
          <TabPanel px={0} pt={4}>
            {cycle.statut === 'en_cours' && (
              <Card bg="surface.1" borderColor="border.1" borderWidth="1px" mb={4}>
                <CardBody>
                  <Heading size="sm" color="text.1" mb={3}>Enregistrer une mortalité</Heading>
                  <Box as="form" onSubmit={handleAddMortalite}>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                      <Input
                        type="date"
                        value={mortForm.date}
                        onChange={(e) => setMortForm({ ...mortForm, date: e.target.value })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Nombre"
                        value={mortForm.nombre || ''}
                        onChange={(e) => setMortForm({ ...mortForm, nombre: Number(e.target.value) })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                        min={1}
                        required
                      />
                      <Input
                        placeholder="Cause"
                        value={mortForm.cause}
                        onChange={(e) => setMortForm({ ...mortForm, cause: e.target.value })}
                        bg="surface.2"
                        borderColor="border.1"
                        size="sm"
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        bg="accent.1"
                        color="gray.900"
                        _hover={{ bg: 'accent.2' }}
                        leftIcon={<FiPlus />}
                        isLoading={mortLoading}
                        fontWeight="bold"
                      >
                        Ajouter
                      </Button>
                    </SimpleGrid>
                  </Box>
                </CardBody>
              </Card>
            )}

            {/* Résumé mortalité */}
            <Card bg="surface.1" borderColor="border.1" borderWidth="1px" mb={4}>
              <CardBody py={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.3">Total mortalité</Text>
                  <Text fontSize="md" fontWeight="bold" color={tauxMortalite > 5 ? 'danger.1' : 'text.1'}>
                    {totalMortalite} / {cycle.effectif_initial} ({tauxMortalite.toFixed(1)}%)
                  </Text>
                </HStack>
                <Box bg="surface.3" borderRadius="full" h={2} mt={2}>
                  <Box
                    bg={tauxMortalite > 10 ? 'danger.1' : tauxMortalite > 5 ? 'warning.1' : 'success.1'}
                    h={2}
                    borderRadius="full"
                    w={`${Math.min(tauxMortalite, 100)}%`}
                  />
                </Box>
              </CardBody>
            </Card>

            {mortalites.length === 0 ? (
              <Text color="text.3" textAlign="center" py={6}>Aucune mortalité enregistrée.</Text>
            ) : (
              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="text.3">Date</Th>
                      <Th color="text.3">Nombre</Th>
                      <Th color="text.3">Cause</Th>
                      <Th />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {mortalites.map((m) => (
                      <Tr key={m.id}>
                        <Td color="text.2">{new Date(m.date).toLocaleDateString('fr-FR')}</Td>
                        <Td color="text.2">{m.nombre}</Td>
                        <Td color="text.2">{m.cause}</Td>
                        <Td>
                          {cycle.statut === 'en_cours' && (
                            <Tooltip label="Supprimer">
                              <IconButton
                                aria-label="Supprimer"
                                icon={<FiTrash2 />}
                                size="xs"
                                variant="ghost"
                                color="danger.1"
                                onClick={() => handleDeleteMortalite(m.id)}
                              />
                            </Tooltip>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
