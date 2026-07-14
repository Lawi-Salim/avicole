import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
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
import { FiArrowLeft } from 'react-icons/fi';
import { clientsService, Client, ClientVente } from '../services/clients.service';

const TYPE_LABELS: Record<string, string> = {
  menage: 'Ménage',
  restaurant: 'Restaurant',
  hotel: 'Hôtel',
  boucherie: 'Boucherie',
  revendeur: 'Revendeur',
};

const STATUT_PAIEMENT_LABELS: Record<string, string> = {
  paye: 'Payé',
  en_attente: 'En attente',
  annule: 'Annulé',
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [ventes, setVentes] = useState<ClientVente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [c, v] = await Promise.all([
        clientsService.getById(id),
        clientsService.getVentes(id),
      ]);
      setClient(c);
      setVentes(v);
    } catch {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

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

  const totalQuantite = ventes
    .filter((v) => v.statut_paiement !== 'annule')
    .reduce((sum, v) => sum + Number(v.quantite), 0);

  const totalMontant = ventes
    .filter((v) => v.statut_paiement !== 'annule')
    .reduce((sum, v) => sum + Number(v.quantite) * Number(v.prix_unitaire), 0);

  const cyclesUniques = new Set(ventes.map((v) => v.cycle?.id).filter(Boolean)).size;

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
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
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
      </SimpleGrid>

      <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
        <CardBody>
          <Heading size="sm" color="text.1" mb={3}>
            Historique des ventes ({ventes.length} vente{ventes.length > 1 ? 's' : ''} — {cyclesUniques} cycle{cyclesUniques > 1 ? 's' : ''})
          </Heading>

          {ventes.length === 0 ? (
            <Text color="text.3" textAlign="center" py={6}>Aucune vente pour ce client.</Text>
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
                  {ventes.map((v) => (
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
                      <Td color="text.2">
                        {STATUT_PAIEMENT_LABELS[v.statut_paiement] || v.statut_paiement}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
