import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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
  Badge,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { clientsService, Client, ClientVente } from '../services/clients.service';
import { cyclesService, Cycle } from '../services/cycles.service';
import { ventesService, CreateVentePayload } from '../services/ventes.service';
import { santeService, Mortalite } from '../services/sante.service';

const TYPE_LABELS: Record<string, string> = {
  menage: 'Ménage',
  restaurant: 'Restaurant',
  hotel: 'Hôtel',
  boucherie: 'Boucherie',
  revendeur: 'Revendeur',
};

const STATUT_PAIEMENT_LABELS: Record<string, string> = {
  paye: 'Payé',
  partiel: 'Partiel',
  impaye: 'Impayé',
};

const STATUT_COLORS: Record<string, string> = {
  paye: 'success.1',
  partiel: 'warning.1',
  impaye: 'danger.1',
};

const MODE_PAIEMENT_LABELS: Record<string, string> = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  cheque: 'Chèque',
  virement: 'Virement',
  credit: 'Crédit',
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [ventes, setVentes] = useState<ClientVente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [showVenteForm, setShowVenteForm] = useState(false);
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [mortalites, setMortalites] = useState<Mortalite[]>([]);
  const [venteForm, setVenteForm] = useState<CreateVentePayload>({
    cycle_id: '',
    client_id: '',
    quantite: 0,
    prix_unitaire: 0,
    date: new Date().toISOString().slice(0, 10),
    mode_paiement: 'especes',
    statut_paiement: 'paye',
  });
  const [submittingVente, setSubmittingVente] = useState(false);
  const [venteError, setVenteError] = useState('');
  const [venteSuccess, setVenteSuccess] = useState('');
  const [showVenteErrorModal, setShowVenteErrorModal] = useState(false);
  const [venteErrorMessage, setVenteErrorMessage] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [c, v, cycles] = await Promise.all([
        clientsService.getById(id),
        clientsService.getVentes(id),
        cyclesService.getAll(),
      ]);
      setClient(c);
      setVentes(v);
      
      const enCours = cycles.find((cycle) => cycle.statut === 'en_cours');
      if (enCours) {
        setCurrentCycle(enCours);
        const m = await santeService.getByCycle(enCours.id);
        setMortalites(m);
        setVenteForm((prev) => ({ ...prev, cycle_id: enCours.id, client_id: id }));
      }
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateVente = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVente(true);
    setVenteError('');
    try {
      const { client_id, ...rest } = venteForm;
      const payload = { ...rest, ...(client_id ? { client_id } : {}) };
      await ventesService.create(payload);
      setVenteSuccess('Vente créée avec succès');
      setShowVenteForm(false);
      setVenteForm({
        cycle_id: currentCycle?.id || '',
        client_id: id,
        quantite: 0,
        prix_unitaire: 0,
        date: new Date().toISOString().slice(0, 10),
        mode_paiement: 'especes',
        statut_paiement: 'paye',
      });
      const updatedVentes = await clientsService.getVentes(id!);
      setVentes(updatedVentes);
      setTimeout(() => setVenteSuccess(''), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Erreur lors de la création de la vente';
      setVenteErrorMessage(msg);
      setShowVenteErrorModal(true);
    } finally {
      setSubmittingVente(false);
    }
  };

  const effectifVivant = currentCycle
    ? currentCycle.effectif_initial - mortalites.reduce((sum, m) => sum + Number(m.nombre), 0)
    : 0;

  const filteredVentes = useMemo(() => {
    if (filterStatut === 'tous') return ventes;
    return ventes.filter((v) => v.statut_paiement === filterStatut);
  }, [ventes, filterStatut]);

  const totalQuantite = ventes
    .filter((v) => v.statut_paiement !== 'impaye')
    .reduce((sum, v) => sum + Number(v.quantite), 0);

  const totalMontant = ventes
    .filter((v) => v.statut_paiement !== 'impaye')
    .reduce((sum, v) => sum + Number(v.quantite) * Number(v.prix_unitaire), 0);

  const totalImpaye = ventes
    .filter((v) => v.statut_paiement === 'impaye')
    .reduce((sum, v) => sum + Number(v.quantite) * Number(v.prix_unitaire), 0);

  const cyclesUniques = new Set(ventes.map((v) => v.cycle?.id).filter(Boolean)).size;

  const chartData = useMemo(() => {
    const byCycle = new Map<string, { cycle: string; quantite: number; montant: number; numero: number }>();
    for (const v of ventes) {
      const key = v.cycle_id;
      const label = v.cycle ? `Cycle #${v.cycle.numero_cycle}` : key.slice(0, 6);
      const numero = v.cycle?.numero_cycle || 0;
      const existing = byCycle.get(key);
      if (existing) {
        existing.quantite += Number(v.quantite);
        existing.montant += Number(v.quantite) * Number(v.prix_unitaire);
      } else {
        byCycle.set(key, { cycle: label, quantite: Number(v.quantite), montant: Number(v.quantite) * Number(v.prix_unitaire), numero });
      }
    }
    return Array.from(byCycle.values()).sort((a, b) => a.numero - b.numero);
  }, [ventes]);

  if (loading) {
    return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" color="accent.1" /></Box>;
  }

  if (!client) {
    return (
      <Alert bg="danger.1" color="white" borderRadius="md">
        <AlertIcon />
        Client non trouvé.
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

      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        <HStack>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            color="text.2"
            onClick={() => navigate('/clients')}
            fontSize="sm"
            size="sm"
          >
            Retour
          </Button>
          <Heading size="lg" color="text.1">{client.nom}</Heading>
          <Box
            as="span"
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="medium"
            bg="accent.1"
            color="gray.900"
          >
            {TYPE_LABELS[client.type_client] || client.type_client}
          </Box>
        </HStack>
        <Button
          size="sm"
          bg="accent.1"
          color="gray.900"
          _hover={{ bg: 'accent.2' }}
          leftIcon={<FiPlus />}
          fontWeight="bold"
          onClick={() => setShowVenteForm(true)}
          isDisabled={!currentCycle}
        >
          {currentCycle ? 'Créer une vente' : 'Aucun cycle en cours'}
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
          <CardBody py={3} px={4}>
            <Text fontSize="xs" color="text.3">Contact</Text>
            <Text fontSize="md" fontWeight="bold" color="text.1">{client.contact || '—'}</Text>
          </CardBody>
        </Card>
        <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
          <CardBody py={3} px={4}>
            <Text fontSize="xs" color="text.3">Total poulets achetés</Text>
            <Text fontSize="md" fontWeight="bold" color="text.1">{totalQuantite}</Text>
          </CardBody>
        </Card>
        <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
          <CardBody py={3} px={4}>
            <Text fontSize="xs" color="text.3">Montant total</Text>
            <Text fontSize="md" fontWeight="bold" color="text.1">
              {Math.round(totalMontant).toLocaleString('fr-FR')} KMF
            </Text>
          </CardBody>
        </Card>
        <Card bg="surface.1" borderColor={totalImpaye > 0 ? 'danger.1' : 'border.1'} borderWidth="1px">
          <CardBody py={3} px={4}>
            <Text fontSize="xs" color="text.3">Impayés</Text>
            <Text fontSize="md" fontWeight="bold" color={totalImpaye > 0 ? 'danger.1' : 'text.1'}>
              {Math.round(totalImpaye).toLocaleString('fr-FR')} KMF
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {chartData.length > 0 && (
        <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
          <CardBody py={4}>
            <Text fontSize="sm" fontWeight="medium" color="text.2" mb={3}>Historique des achats par cycle</Text>
            <Box h="200px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip
                    formatter={(value: unknown, name?: string | number) =>
                      name === 'quantite'
                        ? [`${value} poulets`]
                        : [`${Number(value).toLocaleString('fr-FR')} KMF`]
                    }
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{ backgroundColor: '#1a202c', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  />
                  <Bar dataKey="quantite" name="quantite" fill="#3182CE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      )}

      <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
        <CardBody>
          <HStack justify="space-between" mb={3} flexWrap="wrap" gap={2}>
            <Heading size="sm" color="text.1">
              Historique des ventes ({filteredVentes.length} vente{filteredVentes.length > 1 ? 's' : ''} — {cyclesUniques} cycle{cyclesUniques > 1 ? 's' : ''})
            </Heading>
            <Select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              bg="surface.2"
              borderColor="border.1"
              w="auto"
              fontSize="xs"
              size="sm"
              borderRadius="md"
            >
              <option value="tous">Tous les statuts</option>
              <option value="paye">Payé</option>
              <option value="partiel">Partiel</option>
              <option value="impaye">Impayé</option>
            </Select>
          </HStack>

          {filteredVentes.length === 0 ? (
            <Text color="text.3" textAlign="center" py={6}>
              {ventes.length === 0 ? 'Aucune vente pour ce client.' : 'Aucune vente ne correspond au filtre.'}
            </Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th color="text.3">Date</Th>
                    <Th color="text.3">Cycle</Th>
                    <Th color="text.3">Quantité</Th>
                    <Th color="text.3">Prix unitaire</Th>
                    <Th color="text.3">Total</Th>
                    <Th color="text.3">Statut</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredVentes.map((v) => (
                    <Tr key={v.id}>
                      <Td color="text.2">{new Date(v.date).toLocaleDateString('fr-FR')}</Td>
                      <Td color="text.2">
                        {v.cycle ? `Cycle #${v.cycle.numero_cycle}` : '—'}
                      </Td>
                      <Td color="text.2">{v.quantite}</Td>
                      <Td color="text.2">{Number(v.prix_unitaire).toLocaleString('fr-FR')} KMF</Td>
                      <Td color="text.2">
                        {(Number(v.quantite) * Number(v.prix_unitaire)).toLocaleString('fr-FR')} KMF
                      </Td>
                      <Td>
                        <Badge bg={STATUT_COLORS[v.statut_paiement] || 'surface.3'} color="white" fontSize="xs">
                          {STATUT_PAIEMENT_LABELS[v.statut_paiement] || v.statut_paiement}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {venteSuccess && (
        <Alert bg="success.1" color="white" borderRadius="md" size="sm">
          <AlertIcon />
          {venteSuccess}
        </Alert>
      )}

      <Modal isOpen={showVenteForm} onClose={() => setShowVenteForm(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="text.1">Créer une vente pour {client?.nom}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" onSubmit={handleCreateVente}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Input
                  type="number"
                  placeholder="Quantité"
                  value={venteForm.quantite || ''}
                  onChange={(e) => setVenteForm({ ...venteForm, quantite: Number(e.target.value) })}
                  bg="surface.2"
                  borderColor="border.1"
                  borderRadius="md"
                  size="sm"
                  min={1}
                  step={1}
                  required
                />
                <Input
                  type="number"
                  placeholder="Prix unitaire (KMF)"
                  value={venteForm.prix_unitaire || ''}
                  onChange={(e) => setVenteForm({ ...venteForm, prix_unitaire: Number(e.target.value) })}
                  bg="surface.2"
                  borderColor="border.1"
                  borderRadius="md"
                  size="sm"
                  min={0}
                  required
                />
                <Input
                  type="date"
                  value={venteForm.date}
                  onChange={(e) => setVenteForm({ ...venteForm, date: e.target.value })}
                  bg="surface.2"
                  borderColor="border.1"
                  borderRadius="md"
                  size="sm"
                  required
                />
                <Select
                  value={venteForm.mode_paiement}
                  onChange={(e) => setVenteForm({ ...venteForm, mode_paiement: e.target.value as CreateVentePayload['mode_paiement'] })}
                  bg="surface.2"
                  borderColor="border.1"
                  size="sm"
                  borderRadius="md"
                >
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="credit">Crédit</option>
                </Select>
                <Select
                  value={venteForm.statut_paiement}
                  onChange={(e) => setVenteForm({ ...venteForm, statut_paiement: e.target.value as CreateVentePayload['statut_paiement'] })}
                  bg="surface.2"
                  borderColor="border.1"
                  size="sm"
                  borderRadius="md"
                >
                  <option value="paye">Payé</option>
                  <option value="partiel">Partiel</option>
                  <option value="impaye">Impayé</option>
                </Select>
              </SimpleGrid>
              {currentCycle && (
                <Text fontSize="xs" color="text.3" mt={3}>
                  Cycle en cours : #{currentCycle.numero_cycle} — Effectif vivant : {effectifVivant}
                </Text>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowVenteForm(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              bg="accent.1"
              color="gray.900"
              _hover={{ bg: 'accent.2' }}
              leftIcon={<FiPlus />}
              isLoading={submittingVente}
              fontWeight="bold"
              onClick={handleCreateVente}
            >
              Créer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showVenteErrorModal} onClose={() => setShowVenteErrorModal(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="text.1">Erreur de création</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm">{venteErrorMessage}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" size="sm" onClick={() => setShowVenteErrorModal(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
