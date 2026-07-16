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
  Textarea,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { cyclesService, Cycle } from '../services/cycles.service';
import { santeService, Mortalite, CreateMortalitePayload } from '../services/sante.service';
import { vaccinationsService, Vaccination, CreateVaccinationPayload } from '../services/vaccinations.service';
import ConfirmModal from '../components/ConfirmModal';

export default function Sante() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedCycleData, setSelectedCycleData] = useState<Cycle | null>(null);
  const [mortalites, setMortalites] = useState<Mortalite[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'mortalite' | 'vaccination'>('mortalite');

  const [mortaliteForm, setMortaliteForm] = useState<CreateMortalitePayload>({
    date: new Date().toISOString().slice(0, 10),
    nombre: 0,
    cause: '',
  });

  const [vaccinationForm, setVaccinationForm] = useState<CreateVaccinationPayload>({
    cycle_id: '',
    produit: '',
    date_prevue: new Date().toISOString().slice(0, 10),
    rappel: false,
    notes: '',
  });

  useEffect(() => {
    cyclesService.getAll()
      .then((c) => {
        setCycles(c);
        if (c.length > 0 && !selectedCycle) {
          const first = c[0]!;
          setSelectedCycle(first.id);
          setSelectedCycleData(first);
        }
      })
      .catch(() => setError('Erreur lors du chargement des cycles'))
      .finally(() => setLoading(false));
  }, []);

  const loadMortalites = useCallback(async () => {
    if (!selectedCycle) return;
    try {
      const data = await santeService.getByCycle(selectedCycle);
      setMortalites(data);
    } catch {
      setError('Erreur lors du chargement des mortalités');
    }
  }, [selectedCycle]);

  const loadVaccinations = useCallback(async () => {
    if (!selectedCycle) return;
    try {
      const data = await vaccinationsService.getByCycle(selectedCycle);
      setVaccinations(data);
    } catch {
      setError('Erreur lors du chargement des vaccinations');
    }
  }, [selectedCycle]);

  useEffect(() => { loadMortalites(); loadVaccinations(); }, [loadMortalites, loadVaccinations]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleMortaliteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) return;
    setSubmitting(true);
    setError('');
    try {
      await santeService.create(selectedCycle, mortaliteForm);
      showSuccess('Mortalité enregistrée');
      setMortaliteForm({ date: new Date().toISOString().slice(0, 10), nombre: 0, cause: '' });
      await loadMortalites();
    } catch {
      setError('Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVaccinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) return;
    setSubmitting(true);
    setError('');
    try {
      await vaccinationsService.create({ ...vaccinationForm, cycle_id: selectedCycle });
      showSuccess('Vaccination planifiée');
      setVaccinationForm({ cycle_id: '', produit: '', date_prevue: new Date().toISOString().slice(0, 10), rappel: false, notes: '' });
      await loadVaccinations();
    } catch {
      setError('Erreur lors de la planification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarquerRealisee = async (v: Vaccination) => {
    try {
      await vaccinationsService.update(v.id, { date_realisee: new Date().toISOString().slice(0, 10) });
      showSuccess('Vaccination marquée comme réalisée');
      await loadVaccinations();
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      if (deleteType === 'mortalite') {
        await santeService.remove(deleteTargetId);
        setMortalites((prev) => prev.filter((m) => m.id !== deleteTargetId));
      } else {
        await vaccinationsService.remove(deleteTargetId);
        setVaccinations((prev) => prev.filter((v) => v.id !== deleteTargetId));
      }
      showSuccess('Entrée supprimée');
    } catch {
      setError('Erreur lors de la suppression');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const totalMortalite = mortalites.reduce((sum, m) => sum + Number(m.nombre), 0);
  const effectifInitial = selectedCycleData?.effectif_initial || 0;
  const tauxMortalite = effectifInitial > 0 ? ((totalMortalite / effectifInitial) * 100).toFixed(1) : '0';

  if (loading) {
    return <Box display="flex" justifyContent="center" py={20}><Text color="text.3">Chargement...</Text></Box>;
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="text.1">Santé</Heading>

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
          }}
          bg="surface.1"
          borderColor="border.1"
          maxW="400px"
          fontSize="sm"
          h={8}
        >
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>
              Cycle #{c.numero_cycle} — {new Date(c.date_reception).toLocaleDateString('fr-FR')}
            </option>
          ))}
        </Select>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
          <CardBody py={3} px={4}>
            <Text fontSize="xs" color="text.3">Mortalité cumulée</Text>
            <Text fontSize="2xl" fontWeight="bold" color={Number(tauxMortalite) > 5 ? 'danger.1' : 'text.1'}>{totalMortalite}</Text>
            <Text fontSize="xs" color={Number(tauxMortalite) > 5 ? 'danger.1' : 'text.3'}>{tauxMortalite}% de l'effectif initial</Text>
          </CardBody>
        </Card>
        <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
          <CardBody py={3} px={4}>
            <Text fontSize="xs" color="text.3">Vaccinations</Text>
            <Text fontSize="2xl" fontWeight="bold" color="text.1">{vaccinations.length}</Text>
            <Text fontSize="xs" color="text.3">{vaccinations.filter(v => v.date_realisee).length} réalisées / {vaccinations.filter(v => !v.date_realisee).length} en attente</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Section Mortalité */}
      <Box>
        <Heading size="md" color="text.1" mb={3}>Mortalité</Heading>
        {selectedCycleData?.statut === 'en_cours' && (
          <Card bg="surface.1" borderColor="border.1" borderWidth="1px" mb={4}>
            <CardBody>
              <Box as="form" onSubmit={handleMortaliteSubmit}>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  <Input type="date" value={mortaliteForm.date} onChange={(e) => setMortaliteForm({ ...mortaliteForm, date: e.target.value })} bg="surface.2" borderColor="border.1" borderRadius="md" size="sm" required />
                  <Input type="number" placeholder="Nombre" value={mortaliteForm.nombre || ''} onChange={(e) => setMortaliteForm({ ...mortaliteForm, nombre: Number(e.target.value) })} bg="surface.2" borderColor="border.1" borderRadius="md" size="sm" min={1} required />
                  <Input placeholder="Cause (optionnel)" value={mortaliteForm.cause || ''} onChange={(e) => setMortaliteForm({ ...mortaliteForm, cause: e.target.value })} bg="surface.2" borderColor="border.1" borderRadius="md" size="sm" />
                  <Button type="submit" size="sm" bg="accent.1" color="gray.900" _hover={{ bg: 'accent.2' }} leftIcon={<FiPlus />} isLoading={submitting} fontWeight="bold">Ajouter</Button>
                </SimpleGrid>
              </Box>
            </CardBody>
          </Card>
        )}
        {mortalites.length === 0 ? (
          <Text color="text.3" fontSize="sm" textAlign="center" py={4}>Aucune mortalité enregistrée.</Text>
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
                    <Td color="text.2" fontWeight="bold">{m.nombre}</Td>
                    <Td color="text.2">{m.cause || '—'}</Td>
                    <Td>
                      {selectedCycleData?.statut === 'en_cours' && (
                        <Tooltip label="Supprimer">
                          <IconButton aria-label="Supprimer" icon={<FiTrash2 />} size="xs" variant="ghost" color="danger.1" onClick={() => { setDeleteTargetId(m.id); setDeleteType('mortalite'); }} />
                        </Tooltip>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Section Vaccinations */}
      <Box>
        <Heading size="md" color="text.1" mb={3}>Vaccinations</Heading>
        {selectedCycleData?.statut === 'en_cours' && (
          <Card bg="surface.1" borderColor="border.1" borderWidth="1px" mb={4}>
            <CardBody>
              <Heading size="xs" color="text.2" mb={2}>Planifier une vaccination</Heading>
              <Box as="form" onSubmit={handleVaccinationSubmit}>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                  <Input placeholder="Nom du produit" value={vaccinationForm.produit} onChange={(e) => setVaccinationForm({ ...vaccinationForm, produit: e.target.value })} bg="surface.2" borderColor="border.1" borderRadius="md" size="sm" required />
                  <Input type="date" value={vaccinationForm.date_prevue} onChange={(e) => setVaccinationForm({ ...vaccinationForm, date_prevue: e.target.value })} bg="surface.2" borderColor="border.1" borderRadius="md" size="sm" required />
                  <Input placeholder="Notes (optionnel)" value={vaccinationForm.notes || ''} onChange={(e) => setVaccinationForm({ ...vaccinationForm, notes: e.target.value })} bg="surface.2" borderColor="border.1" borderRadius="md" size="sm" />
                  <Button type="submit" size="sm" bg="accent.1" color="gray.900" _hover={{ bg: 'accent.2' }} leftIcon={<FiPlus />} isLoading={submitting} fontWeight="bold">Planifier</Button>
                </SimpleGrid>
              </Box>
            </CardBody>
          </Card>
        )}
        {vaccinations.length === 0 ? (
          <Text color="text.3" fontSize="sm" textAlign="center" py={4}>Aucune vaccination planifiée.</Text>
        ) : (
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th color="text.3">Produit</Th>
                  <Th color="text.3">Date prévue</Th>
                  <Th color="text.3">Date réalisée</Th>
                  <Th color="text.3">Statut</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {vaccinations.map((v) => (
                  <Tr key={v.id}>
                    <Td color="text.2" fontWeight="medium">{v.produit}</Td>
                    <Td color="text.2">{new Date(v.date_prevue).toLocaleDateString('fr-FR')}</Td>
                    <Td color="text.2">{v.date_realisee ? new Date(v.date_realisee).toLocaleDateString('fr-FR') : '—'}</Td>
                    <Td>
                      <Badge fontSize="xs" colorScheme={v.date_realisee ? 'green' : 'orange'}>
                        {v.date_realisee ? 'Réalisée' : 'En attente'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        {!v.date_realisee && selectedCycleData?.statut === 'en_cours' && (
                          <Tooltip label="Marquer comme réalisée">
                            <IconButton aria-label="Réalisée" icon={<FiCheck />} size="xs" variant="ghost" color="success.1" onClick={() => handleMarquerRealisee(v)} />
                          </Tooltip>
                        )}
                        {selectedCycleData?.statut === 'en_cours' && (
                          <Tooltip label="Supprimer">
                            <IconButton aria-label="Supprimer" icon={<FiTrash2 />} size="xs" variant="ghost" color="danger.1" onClick={() => { setDeleteTargetId(v.id); setDeleteType('vaccination'); }} />
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'entrée"
        message="Êtes-vous sûr de vouloir supprimer cette entrée ?"
      />
    </VStack>
  );
}
