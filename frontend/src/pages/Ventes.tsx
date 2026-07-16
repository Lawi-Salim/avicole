import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { cyclesService, Cycle } from '../services/cycles.service';
import { ventesService, Vente, CreateVentePayload } from '../services/ventes.service';
import { santeService, Mortalite } from '../services/sante.service';
import { clientsService, Client } from '../services/clients.service';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';

const MODE_PAIEMENT_LABELS: Record<string, string> = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  cheque: 'Chèque',
  virement: 'Virement',
  credit: 'Crédit',
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

const ITEMS_PER_PAGE = 10;

export default function Ventes() {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedCycleData, setSelectedCycleData] = useState<Cycle | null>(null);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [mortalites, setMortalites] = useState<Mortalite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [searchClient, setSearchClient] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState<CreateVentePayload>({
    cycle_id: '',
    client_id: '',
    quantite: 0,
    prix_unitaire: 0,
    date: new Date().toISOString().slice(0, 10),
    mode_paiement: 'especes',
    statut_paiement: 'paye',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      cyclesService.getAll(),
      clientsService.getAll(),
    ])
      .then(([c, cl]) => {
        setCycles(c);
        setClients(cl);
        if (c.length > 0 && !selectedCycle) {
          const first = c[0]!;
          setSelectedCycle(first.id);
          setSelectedCycleData(first);
          setForm((prev) => ({ ...prev, cycle_id: first.id }));
        }
      })
      .catch(() => setError('Erreur lors du chargement des données'))
      .finally(() => setLoading(false));
  }, []);

  const loadVentes = useCallback(async () => {
    if (!selectedCycle) return;
    try {
      const data = await ventesService.getByCycle(selectedCycle);
      setVentes(data);
    } catch {
      setError('Erreur lors du chargement des ventes');
    }
  }, [selectedCycle]);

  useEffect(() => { loadVentes(); }, [loadVentes]);

  useEffect(() => {
    if (!selectedCycle) return;
    santeService.getByCycle(selectedCycle)
      .then((m) => setMortalites(m))
      .catch(() => setMortalites([]));
  }, [selectedCycle]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) return;

    if (form.quantite > resteDisponible) {
      setErrorMessage(
        `Quantité invalide : Il ne reste que ${resteDisponible} poulets vivants disponibles à la vente. ` +
        `Effectif vivant : ${effectifVivant}, Déjà vendu : ${totalDejaVendu}.`
      );
      setShowErrorModal(true);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form, cycle_id: selectedCycle };
      if (editingId) {
        await ventesService.update(editingId, payload);
        showSuccess('Vente modifiée');
      } else {
        await ventesService.create(payload);
        showSuccess('Vente ajoutée');
      }
      setEditingId(null);
      setForm({
        cycle_id: selectedCycle,
        client_id: '',
        quantite: 0,
        prix_unitaire: 0,
        date: new Date().toISOString().slice(0, 10),
        mode_paiement: 'especes',
        statut_paiement: 'paye',
      });
      await loadVentes();
    } catch (err: unknown) {
      console.error('Erreur création vente:', (err as any)?.response?.data);
      setError(editingId ? 'Erreur lors de la modification' : "Erreur lors de l'ajout");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (v: Vente) => {
    setEditingId(v.id);
    setForm({
      cycle_id: v.cycle_id,
      client_id: v.client_id || '',
      quantite: v.quantite,
      prix_unitaire: v.prix_unitaire,
      date: v.date,
      mode_paiement: v.mode_paiement,
      statut_paiement: v.statut_paiement,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      cycle_id: selectedCycle,
      client_id: '',
      quantite: 0,
      prix_unitaire: 0,
      date: new Date().toISOString().slice(0, 10),
      mode_paiement: 'especes',
      statut_paiement: 'paye',
    });
  };

  const handleDelete = async (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await ventesService.remove(deleteTargetId);
      setVentes((prev) => prev.filter((v) => v.id !== deleteTargetId));
      showSuccess('Vente supprimée');
    } catch {
      setError('Erreur lors de la suppression');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await ventesService.update(id, { statut_paiement: 'paye' });
      setVentes((prev) =>
        prev.map((v) => (v.id === id ? { ...v, statut_paiement: 'paye' as const } : v))
      );
      showSuccess('Vente marquée comme payée');
    } catch {
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const filteredVentes = useMemo(() => {
    let result = [...ventes];
    if (searchClient) {
      const q = searchClient.toLowerCase();
      result = result.filter((v) =>
        v.client?.nom.toLowerCase().includes(q)
      );
    }
    if (filterStatut !== 'tous') {
      result = result.filter((v) => v.statut_paiement === filterStatut);
    }
    return result;
  }, [ventes, searchClient, filterStatut]);

  const totalPages = Math.ceil(filteredVentes.length / ITEMS_PER_PAGE);
  const paginatedVentes = filteredVentes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [searchClient, filterStatut]);

  const totalVentesFiltered = filteredVentes
    .filter((v) => v.statut_paiement !== 'impaye')
    .reduce((sum, v) => sum + Number(v.quantite) * Number(v.prix_unitaire), 0);

  const totalQuantiteFiltered = filteredVentes
    .filter((v) => v.statut_paiement !== 'impaye')
    .reduce((sum, v) => sum + Number(v.quantite), 0);

  const effectifVivant = selectedCycleData
    ? selectedCycleData.effectif_initial - mortalites.reduce((sum, m) => sum + Number(m.nombre), 0)
    : 0;

  const totalDejaVendu = ventes
    .filter((v) => v.statut_paiement !== 'impaye' && v.id !== editingId)
    .reduce((sum, v) => sum + Number(v.quantite), 0);

  const resteDisponible = effectifVivant - totalDejaVendu;

  const totalImpayeCycle = ventes
    .filter((v) => v.statut_paiement === 'impaye' && v.id !== editingId)
    .reduce((sum, v) => sum + Number(v.quantite), 0);

  if (loading) {
    return <Box display="flex" justifyContent="center" py={20}><Text color="text.3">Chargement...</Text></Box>;
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="text.1">Ventes</Heading>

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

      <Box>
        <Text mb={1} fontSize="sm" color="text.2">Sélectionner un cycle</Text>
        <Select
          value={selectedCycle}
          onChange={(e) => {
            setSelectedCycle(e.target.value);
            const cycle = cycles.find(c => c.id === e.target.value);
            setSelectedCycleData(cycle || null);
            setForm((prev) => ({ ...prev, cycle_id: e.target.value }));
            setEditingId(null);
            setSearchClient('');
            setFilterStatut('tous');
          }}
          bg="surface.1"
          borderColor="border.1"
          maxW="400px"
          fontSize="sm"
          h={8}
        >
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              Cycle #{c.numero_cycle} - {new Date(c.date_reception).toLocaleDateString('fr-FR')}
            </option>
          ))}
        </Select>
      </Box>

      {selectedCycleData?.statut === 'en_cours' ? (
        <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
          <CardBody>
            <Heading size="sm" color="text.1" mb={3}>
              {editingId ? 'Modifier la vente' : 'Ajouter une vente'}
            </Heading>
            <Box as="form" onSubmit={handleSubmit}>
              <SimpleGrid columns={{ base: 2, md: 7 }} spacing={3}>
                <Input
                  type="number"
                  placeholder="Quantité"
                  value={form.quantite || ''}
                  onChange={(e) => setForm({ ...form, quantite: Number(e.target.value) })}
                  bg="surface.2"
                  borderColor="border.1"
                  borderRadius="md"
                  size="sm"
                  min={1}
                  required
                />
                <Input
                  type="number"
                  placeholder="Prix unitaire (KMF)"
                  value={form.prix_unitaire || ''}
                  onChange={(e) => setForm({ ...form, prix_unitaire: Number(e.target.value) })}
                  bg="surface.2"
                  borderColor="border.1"
                  borderRadius="md"
                  size="sm"
                  min={0}
                  required
                />
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  bg="surface.2"
                  borderColor="border.1"
                  borderRadius="md"
                  size="sm"
                  required
                />
                <Select
                  value={form.mode_paiement}
                  onChange={(e) => setForm({ ...form, mode_paiement: e.target.value as CreateVentePayload['mode_paiement'] })}
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
                  value={form.statut_paiement}
                  onChange={(e) => setForm({ ...form, statut_paiement: e.target.value as CreateVentePayload['statut_paiement'] })}
                  bg="surface.2"
                  borderColor="border.1"
                  size="sm"
                  borderRadius="md"
                >
                  <option value="paye">Payé</option>
                  <option value="partiel">Partiel</option>
                  <option value="impaye">Impayé</option>
                </Select>
                <Select
                  value={form.client_id || ''}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value || undefined })}
                  bg="surface.2"
                  borderColor="border.1"
                  size="sm"
                  borderRadius="md"
                  required
                >
                  <option value="">Choisir un client</option>
                  {clients.map((cl) => (
                    <option key={cl.id} value={cl.id}>{cl.nom}</option>
                  ))}
                </Select>
                <HStack>
                  <Button
                    type="submit"
                    size="sm"
                    bg="accent.1"
                    color="gray.900"
                    _hover={{ bg: 'accent.2' }}
                    leftIcon={editingId ? <FiEdit2 /> : <FiPlus />}
                    isLoading={submitting}
                    fontWeight="bold"
                    flex={1}
                  >
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </Button>
                  {editingId && (
                    <Button
                      size="sm"
                      variant="outline"
                      color="text.3"
                      onClick={handleCancelEdit}
                    >
                      Annuler
                    </Button>
                  )}
                </HStack>
              </SimpleGrid>
            </Box>
            {selectedCycle && (
              <Text fontSize="xs" color="text.3" mt={2}>
                {totalImpayeCycle > 0
                  ? `Disponible : ${resteDisponible} poulets, ${totalImpayeCycle} impayés sur ${effectifVivant} vivants`
                  : `Disponible : ${resteDisponible} poulets sur ${effectifVivant} vivants`}
              </Text>
            )}
          </CardBody>
        </Card>
      ) : null}

      <HStack spacing={3} flexWrap="wrap" position="relative" zIndex={1}>
        <InputGroup maxW="250px" size="sm">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Rechercher client..."
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
            bg="surface.1"
            borderColor="border.1"
            borderRadius="md"
            fontSize="sm"
          />
        </InputGroup>
        <Select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          bg="surface.1"
          borderColor="border.1"
          w="auto"
          fontSize="sm"
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
          {ventes.length === 0 ? 'Aucune vente enregistrée.' : 'Aucune vente ne correspond aux filtres.'}
        </Text>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th color="text.3">Date</Th>
                <Th color="text.3">Client</Th>
                <Th color="text.3">Quantité</Th>
                <Th color="text.3">Prix unitaire</Th>
                <Th color="text.3">Total</Th>
                <Th color="text.3">Mode paiement</Th>
                <Th color="text.3">Statut</Th>
                <Th color="text.3">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedVentes.map((v) => (
                <Tr key={v.id}>
                  <Td color="text.2">{new Date(v.date).toLocaleDateString('fr-FR')}</Td>
                  <Td>
                    {v.client ? (
                      <HStack spacing={1}>
                        <Text color="accent.1" fontSize="sm">{v.client.nom}</Text>
                        <Tooltip label="Voir le client">
                          <IconButton
                            aria-label="Voir le client"
                            icon={<FiExternalLink />}
                            size="xs"
                            variant="ghost"
                            color="accent.1"
                            onClick={() => navigate(`/clients/${v.client!.id}`)}
                          />
                        </Tooltip>
                      </HStack>
                    ) : (
                      <Text color="text.3" fontSize="sm">—</Text>
                    )}
                  </Td>
                  <Td color="text.2">{v.quantite}</Td>
                  <Td color="text.2">{Number(v.prix_unitaire).toLocaleString('fr-FR')} KMF</Td>
                  <Td color="text.2">{(Number(v.quantite) * Number(v.prix_unitaire)).toLocaleString('fr-FR')} KMF</Td>
                  <Td color="text.2">{MODE_PAIEMENT_LABELS[v.mode_paiement] || v.mode_paiement}</Td>
                  <Td>
                    <Badge bg={STATUT_COLORS[v.statut_paiement] || 'surface.3'} color="white" fontSize="xs">
                      {STATUT_PAIEMENT_LABELS[v.statut_paiement] || v.statut_paiement}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      {(v.statut_paiement === 'impaye' || v.statut_paiement === 'partiel') && (
                        <Tooltip label="Marquer comme payé">
                          <IconButton
                            aria-label="Marquer comme payé"
                            icon={<FiCheckCircle />}
                            size="xs"
                            variant="ghost"
                            color="green.400"
                            onClick={() => handleMarkAsPaid(v.id)}
                          />
                        </Tooltip>
                      )}
                      {selectedCycleData?.statut === 'en_cours' && (
                        <>
                          <Tooltip label="Modifier">
                            <IconButton
                              aria-label="Modifier"
                              icon={<FiEdit2 />}
                              size="xs"
                              variant="ghost"
                              color="accent.1"
                              onClick={() => handleEdit(v)}
                            />
                          </Tooltip>
                          <Tooltip label="Supprimer">
                            <IconButton
                              aria-label="Supprimer"
                              icon={<FiTrash2 />}
                              size="xs"
                              variant="ghost"
                              color="danger.1"
                              onClick={() => handleDelete(v.id)}
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {filteredVentes.length > 0 && (
        <HStack justify="space-between" spacing={6}>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          <Text fontSize="sm" color="text.3">
            {filteredVentes.length !== ventes.length && `${filteredVentes.length} sur ${ventes.length} — `}
            Total: <strong color="text.1">{totalQuantiteFiltered} poulets — {Math.round(totalVentesFiltered).toLocaleString('fr-FR')} KMF</strong>
          </Text>
        </HStack>
      )}

      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="text.1">Erreur de validation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm">{errorMessage}</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" size="sm" onClick={() => setShowErrorModal(false)}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Supprimer la vente"
        message="Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible."
      />
    </VStack>
  );
}
