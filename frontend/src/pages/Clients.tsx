import { useEffect, useState } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { clientsService, Client, CreateClientPayload } from '../services/clients.service';
import ConfirmModal from '../components/ConfirmModal';

const TYPE_LABELS: Record<string, string> = {
  menage: 'Ménage',
  restaurant: 'Restaurant',
  hotel: 'Hôtel',
  boucherie: 'Boucherie',
  revendeur: 'Revendeur',
};

const TYPE_COLORS: Record<string, string> = {
  menage: '#3182CE',
  restaurant: '#DD6B20',
  hotel: '#805AD5',
  boucherie: '#3c6396',
  revendeur: '#38A169 ',
};

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateClientPayload>({
    nom: '',
    type_client: 'menage',
    contact: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    clientsService.getAll()
      .then(setClients)
      .catch(() => setError('Erreur lors du chargement des clients'))
      .finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await clientsService.update(editingId, form);
        showSuccess('Client modifié');
      } else {
        await clientsService.create(form);
        showSuccess('Client ajouté');
      }
      setEditingId(null);
      setForm({ nom: '', type_client: 'menage', contact: '' });
      const updated = await clientsService.getAll();
      setClients(updated);
    } catch {
      setError(editingId ? 'Erreur lors de la modification' : "Erreur lors de l'ajout");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c: Client) => {
    setEditingId(c.id);
    setForm({ nom: c.nom, type_client: c.type_client, contact: c.contact || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ nom: '', type_client: 'menage', contact: '' });
  };

  const handleDelete = async (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await clientsService.remove(deleteTargetId);
      setClients((prev) => prev.filter((c) => c.id !== deleteTargetId));
      showSuccess('Client supprimé');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Erreur lors de la suppression';
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setDeleteTargetId(null);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" py={20}><Text color="text.3">Chargement...</Text></Box>;
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="text.1">Clients</Heading>

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

      <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
        <CardBody>
          <Heading size="sm" color="text.1" mb={3}>
            {editingId ? 'Modifier le client' : 'Ajouter un client'}
          </Heading>
          <Box as="form" onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
              <Input
                placeholder="Nom du client"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                bg="surface.2"
                borderColor="border.1"
                borderRadius="md"
                size="sm"
                required
              />
              <Select
                value={form.type_client}
                onChange={(e) => setForm({ ...form, type_client: e.target.value as CreateClientPayload['type_client'] })}
                bg="surface.2"
                borderColor="border.1"
                borderRadius="md"
                size="sm"
              >
                <option value="menage">Ménage</option>
                <option value="restaurant">Restaurant</option>
                <option value="hotel">Hôtel</option>
                <option value="boucherie">Boucherie</option>
                <option value="revendeur">Revendeur</option>
              </Select>
              <Input
                placeholder="Contact"
                value={form.contact || ''}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                bg="surface.2"
                borderColor="border.1"
                borderRadius="md"
                size="sm"
                required
              />
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
        </CardBody>
      </Card>

      {clients.length === 0 ? (
        <Text color="text.3" textAlign="center" py={6}>Aucun client enregistré.</Text>
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th color="text.3">Nom</Th>
                <Th color="text.3">Type</Th>
                <Th color="text.3">Contact</Th>
                <Th color="text.3">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {clients.map((c) => (
                <Tr
                  key={c.id}
                  cursor="pointer"
                  _hover={{ bg: 'surface.2' }}
                  onClick={() => navigate(`/clients/${c.id}`)}
                >
                  <Td color="text.2" fontWeight="medium">{c.nom}</Td>
                  <Td>
                    <Box
                      as="span"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="medium"
                      bg={TYPE_COLORS[c.type_client] || 'surface.3'}
                      color={['surface.3'].includes(TYPE_COLORS[c.type_client] || '') ? 'text.2' : 'white'}
                    >
                      {TYPE_LABELS[c.type_client] || c.type_client}
                    </Box>
                  </Td>
                  <Td color="text.2">{c.contact || '—'}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <HStack spacing={1}>
                      <Tooltip label="Modifier">
                        <IconButton
                          aria-label="Modifier"
                          icon={<FiEdit2 />}
                          size="xs"
                          variant="ghost"
                          color="accent.1"
                          onClick={() => handleEdit(c)}
                        />
                      </Tooltip>
                      <Tooltip label="Supprimer">
                        <IconButton
                          aria-label="Supprimer"
                          icon={<FiTrash2 />}
                          size="xs"
                          variant="ghost"
                          color="danger.1"
                          onClick={() => handleDelete(c.id)}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {clients.length > 0 && (
        <HStack justify="flex-end">
          <Text fontSize="sm" color="text.3">
            Total: <strong color="text.1">{clients.length} client{clients.length > 1 ? 's' : ''}</strong>
          </Text>
        </HStack>
      )}

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Supprimer le client"
        message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
      />
      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="text.1">Erreur de suppression</ModalHeader>
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
