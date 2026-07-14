import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  SimpleGrid,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { parametragesService } from '../services/parametrages.service';
import type { Parametrage } from '../services/parametrages.service';

export default function Parametrage() {
  const [data, setData] = useState<Parametrage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    parametragesService.getAll()
      .then((res) => { const first = res[0]; if (first) setData(first); })
      .catch(() => setError('Erreur lors du chargement des paramétrages'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const updated = await parametragesService.update(data.id, {
        cout_standard_poussin: data.cout_standard_poussin,
        prix_vente_standard: data.prix_vente_standard,
        seuil_mortalite_critique_pct: data.seuil_mortalite_critique_pct,
        seuil_stock_bas_jours: data.seuil_stock_bas_jours,
      });
      setData(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Center py={20}><Spinner size="xl" color="accent.1" /></Center>;
  }

  if (!data) {
    return (
      <Alert bg="danger.1" color="white" borderRadius="md">
        <AlertIcon />
        Aucun paramétrage trouvé.
      </Alert>
    );
  }

  const fields = [
    { key: 'cout_standard_poussin' as const, label: 'Coût standard poussin (KMF)', type: 'number' },
    { key: 'prix_vente_standard' as const, label: 'Prix de vente standard (KMF)', type: 'number' },
    { key: 'seuil_mortalite_critique_pct' as const, label: 'Seuil mortalité critique (%)', type: 'number' },
    { key: 'seuil_stock_bas_jours' as const, label: 'Seuil stock bas (jours)', type: 'number' },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="text.1">Paramétrage</Heading>

      {error && (
        <Alert bg="danger.1" color="white" borderRadius="md" size="sm">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {success && (
        <Alert bg="success.1" color="white" borderRadius="md" size="sm">
          <AlertIcon />
          Paramétrage sauvegardé avec succès.
        </Alert>
      )}

      <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {fields.map(({ key, label, type }) => (
              <Box key={key}>
                <Text mb={1} fontSize="sm" color="text.2">{label}</Text>
                <Input
                  type={type}
                  value={data[key]}
                  onChange={(e) => setData({ ...data, [key]: Number(e.target.value) })}
                  bg="surface.2"
                  borderColor="border.1"
                  _focus={{ borderColor: 'accent.1', boxShadow: '0 0 0 1px var(--chakra-colors-accent-1)' }}
                />
              </Box>
            ))}
          </SimpleGrid>

          <HStack justify="flex-end" mt={6}>
            <Button
              bg="accent.1"
              color="gray.900"
              _hover={{ bg: 'accent.2' }}
              onClick={handleSave}
              isLoading={saving}
              fontWeight="bold"
            >
              Sauvegarder
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
