import { useEffect, useState, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { cyclesService, Cycle } from '../services/cycles.service';
import { ventesService, Vente, CreateVentePayload } from '../services/ventes.service';
import { santeService, Mortalite } from '../services/sante.service';

const MODE_PAIEMENT_LABELS: Record<string, string> = {
  especes: 'Especes',
  cheque: 'Cheque',
  virement: 'Virement',
  credit: 'Credit',
};

const STATUT_PAIEMENT_LABELS: Record<string, string> = {
  paye: 'Paye',
  en_attente: 'En attente',
  annule: 'Annule',
};

const STATUT_COLORS: Record<string, string> = {
  paye: 'success.1',
  en_attente: 'warning.1',
  annule: 'danger.1',
};

export default function Ventes() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
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

  const [form, setForm] = useState<CreateVentePayload>({
    cycle_id: '',
    quantite: 0,
    prix_unitaire: 0,
    date: new Date().toISOString().slice(0, 10),
    mode_paiement: 'especes',
    statut_paiement: 'paye',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    cyclesService.getAll()
      .then((c) => {
        setCycles(c);
        if (c.length > 0 && !selectedCycle) {
          const first = c[0]!;
          setSelectedCycle(first.id);
          setSelectedCycleData(first);
          setForm((prev) => ({ ...prev, cycle_id: first.id }));
        }
      })
      .catch(() => setError('Erreur lors du chargement des cycles'))
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
        showSuccess('Vente modifiee');
      } else {
        await ventesService.create(payload);
        showSuccess('Vente ajoutee');
      }
      setEditingId(null);
      setForm({
        cycle_id: selectedCycle,
        quantite: 0,
        prix_unitaire: 0,
        date: new Date().toISOString().slice(0, 10),
        mode_paiement: 'especes',
        statut_paiement: 'paye',
      });
      await loadVentes();
    } catch {
      setError(editingId ? 'Erreur lors de la modification' : "Erreur lors de l'ajout");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (v: Vente) => {
    setEditingId(v.id);
    setForm({
      cycle_id: v.cycle_id,
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
      quantite: 0,
      prix_unitaire: 0,
      date: new Date().toISOString().slice(0, 10),
      mode_paiement: 'especes',
      statut_paiement: 'paye',
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await ventesService.remove(id);
      setVentes((prev) => prev.filter((v) => v.id !== id));
      showSuccess('Vente supprimee');
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const totalVentes = ventes
    .filter((v) => v.statut_paiement !== 'annule')
    .reduce((sum, v) => sum + Number(v.quantite) * Number(v.prix_unitaire), 0);

  const totalQuantite = ventes
    .filter((v) => v.statut_paiement !== 'annule')
    .reduce((sum, v) => sum + Number(v.quantite), 0);

  const effectifVivant = selectedCycleData
    ? selectedCycleData.effectif_initial - mortalites.reduce((sum, m) => sum + Number(m.nombre), 0)
    : 0;

  const totalDejaVendu = ventes
    .filter((v) => v.statut_paiement !== 'annule' && v.id !== editingId)
    .reduce((sum, v) => sum + Number(v.quantite), 0);

  const resteDisponible = effectifVivant - totalDejaVendu;

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
        <Text mb={1} fontSize="sm" color="text.2">Selectionner un cycle</Text>
        <Select
          value={selectedCycle}
          onChange={(e) => {
            setSelectedCycle(e.target.value);
            const cycle = cycles.find(c => c.id === e.target.value);
            setSelectedCycleData(cycle || null);
            setForm((prev) => ({ ...prev, cycle_id: e.target.value }));
            setEditingId(null);
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
              <SimpleGrid columns={{ base: 2, md: 6 }} spacing={3}>
                <Input
                  type="number"
                  placeholder="Quantite"
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
                  <option value="en_attente">En attente</option>
                  <option value="annule">Annulé</option>
                </Select>
                <HStack>
                  <Button
                    type="submit"
                    size="sm"
                    bg="accent.1"
                    color="gray.900"
                    _hover={{ bg: 'accent.2' }}
                    leftIcon={<FiPlus />}
                    isLoading={submitting}
                    fontWeight="bold"
                    flex={1}
                  >
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </Button>
                  {editingId && (
                    <Button
                      size="sm"
                      variant="ghost"
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
                Disponible : {resteDisponible} poulets sur {effectifVivant} vivants
              </Text>
            )}
          </CardBody>
        </Card>
      ) : null}

      {ventes.length === 0 ? (
        <Text color="text.3" textAlign="center" py={6}>Aucune vente enregistree.</Text>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th color="text.3">Date</Th>
                <Th color="text.3">Quantite</Th>
                <Th color="text.3">Prix unitaire</Th>
                <Th color="text.3">Total</Th>
                <Th color="text.3">Mode paiement</Th>
                <Th color="text.3">Statut</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {ventes.map((v) => (
                <Tr key={v.id}>
                  <Td color="text.2">{new Date(v.date).toLocaleDateString('fr-FR')}</Td>
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
                    {selectedCycleData?.statut === 'en_cours' && (
                      <HStack spacing={1}>
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
                      </HStack>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {ventes.length > 0 && (
        <HStack justify="flex-end" spacing={6}>
          <Text fontSize="sm" color="text.3">
            Total: <strong color="text.1">{totalQuantite} poulets - {Math.round(totalVentes).toLocaleString('fr-FR')} KMF</strong>
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
    </VStack>
  );
}
