import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  Textarea,
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
  Badge,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Switch,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { risquesService, Risque, CreateRisquePayload } from '../services/risques.service';
import ConfirmModal from '../components/ConfirmModal';

const CATEGORIES = [
  { value: 'sanitaire', label: 'Sanitaire' },
  { value: 'financier', label: 'Financier' },
  { value: 'marche', label: 'Marché' },
  { value: 'approvisionnement', label: 'Approvisionnement' },
];

const CATEGORY_COLORS: Record<string, string> = {
  sanitaire: 'red.400',
  financier: 'blue.400',
  marche: 'purple.400',
  approvisionnement: 'orange.400',
};

export default function Risques() {
  const [risques, setRisques] = useState<Risque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('tous');
  const [editingRisque, setEditingRisque] = useState<Risque | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Risque | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [form, setForm] = useState<CreateRisquePayload>({
    categorie: 'sanitaire',
    description: '',
    mesure_preventive: '',
    seuil_alerte: '',
    actif: true,
  });

  const loadData = useCallback(async () => {
    try {
      const data = await risquesService.getAll();
      setRisques(data);
    } catch {
      setError('Erreur lors du chargement des risques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredRisques = useMemo(() => {
    if (filter === 'tous') return risques;
    return risques.filter((r) => r.categorie === filter);
  }, [risques, filter]);

  const openCreate = () => {
    setEditingRisque(null);
    setForm({ categorie: 'sanitaire', description: '', mesure_preventive: '', seuil_alerte: '', actif: true });
    onOpen();
  };

  const openEdit = (risque: Risque) => {
    setEditingRisque(risque);
    setForm({
      categorie: risque.categorie,
      description: risque.description,
      mesure_preventive: risque.mesure_preventive || '',
      seuil_alerte: risque.seuil_alerte || '',
      actif: risque.actif,
    });
    onOpen();
  };

  const handleSave = async () => {
    try {
      if (editingRisque) {
        await risquesService.update(editingRisque.id, form);
        setSuccess('Risque modifié avec succès');
      } else {
        await risquesService.create(form);
        setSuccess('Risque créé avec succès');
      }
      onClose();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await risquesService.remove(deleteTarget.id);
      setSuccess('Risque supprimé');
      onDeleteClose();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  const toggleActif = async (risque: Risque) => {
    try {
      await risquesService.update(risque.id, { actif: !risque.actif });
      loadData();
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <Center py={20}><Spinner size="xl" color="accent.1" /></Center>;
  }

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <Heading size="lg" color="text.1">Risques</Heading>
        <Button
          leftIcon={<FiPlus />}
          bg="accent.1"
          color="gray.900"
          _hover={{ bg: 'accent.2' }}
          fontWeight="bold"
          size="sm"
          onClick={openCreate}
        >
          Nouveau risque
        </Button>
      </HStack>

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

      <HStack spacing={2} flexWrap="wrap">
        <Button
          size="xs"
          variant={filter === 'tous' ? 'solid' : 'ghost'}
          bg={filter === 'tous' ? 'accent.1' : 'transparent'}
          color={filter === 'tous' ? 'gray.900' : 'text.2'}
          onClick={() => setFilter('tous')}
        >
          Tous
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            size="xs"
            variant={filter === cat.value ? 'solid' : 'ghost'}
            bg={filter === cat.value ? 'accent.1' : 'transparent'}
            color={filter === cat.value ? 'gray.900' : 'text.2'}
            onClick={() => setFilter(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </HStack>

      {filteredRisques.length === 0 ? (
        <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
          <CardBody>
            <Text color="text.3" fontSize="sm" textAlign="center" py={6}>Aucun risque enregistré.</Text>
          </CardBody>
        </Card>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th color="text.3">Catégorie</Th>
                <Th color="text.3">Description</Th>
                <Th color="text.3">Mesure préventive</Th>
                <Th color="text.3">Seuil alerte</Th>
                <Th color="text.3">Actif</Th>
                <Th color="text.3">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRisques.map((risque) => (
                <Tr key={risque.id}>
                  <Td>
                    <Badge colorScheme={risque.categorie === 'sanitaire' ? 'red' : risque.categorie === 'financier' ? 'blue' : risque.categorie === 'marche' ? 'purple' : 'orange'} fontSize="xs">
                      {CATEGORIES.find((c) => c.value === risque.categorie)?.label || risque.categorie}
                    </Badge>
                  </Td>
                  <Td color="text.2" maxW="300px">{risque.description}</Td>
                  <Td color="text.2" maxW="250px">{risque.mesure_preventive || '-'}</Td>
                  <Td color="text.2">{risque.seuil_alerte || '-'}</Td>
                  <Td>
                    <Switch
                      size="sm"
                      isChecked={risque.actif}
                      onChange={() => toggleActif(risque)}
                      colorScheme="green"
                    />
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Button size="xs" variant="ghost" color="accent.1" onClick={() => openEdit(risque)}>
                        <FiEdit2 />
                      </Button>
                      <Button size="xs" variant="ghost" color="danger.1" onClick={() => { setDeleteTarget(risque); onDeleteOpen(); }}>
                        <FiTrash2 />
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="surface.1">
          <ModalHeader color="text.1">{editingRisque ? 'Modifier le risque' : 'Nouveau risque'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="100%">
                <Text mb={1} fontSize="sm" color="text.2">Catégorie</Text>
                <Select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  bg="surface.2"
                  borderColor="border.1"
                  size="sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Select>
              </Box>
              <Box w="100%">
                <Text mb={1} fontSize="sm" color="text.2">Description</Text>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  bg="surface.2"
                  borderColor="border.1"
                  size="sm"
                  rows={3}
                />
              </Box>
              <Box w="100%">
                <Text mb={1} fontSize="sm" color="text.2">Mesure préventive</Text>
                <Textarea
                  value={form.mesure_preventive || ''}
                  onChange={(e) => setForm({ ...form, mesure_preventive: e.target.value })}
                  bg="surface.2"
                  borderColor="border.1"
                  size="sm"
                  rows={2}
                />
              </Box>
              <Box w="100%">
                <Text mb={1} fontSize="sm" color="text.2">Seuil d'alerte</Text>
                <Input
                  value={form.seuil_alerte || ''}
                  onChange={(e) => setForm({ ...form, seuil_alerte: e.target.value })}
                  bg="surface.2"
                  borderColor="border.1"
                  size="sm"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" fontSize="sm" size="sm" color="text.2" mr={3} onClick={onClose}>Annuler</Button>
            <Button
              bg="accent.1"
              color="gray.900"
              _hover={{ bg: 'accent.2' }}
              fontWeight="bold"
              onClick={handleSave}
              isDisabled={!form.description}
              fontSize="sm"
              size="sm"
            >
              {editingRisque ? 'Modifier' : 'Créer'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title="Supprimer le risque"
        message={`Êtes-vous sûr de vouloir supprimer ce risque ?`}
        confirmLabel="Supprimer"
      />
    </VStack>
  );
}
