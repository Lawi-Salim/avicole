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
  Badge,
} from '@chakra-ui/react';
import { parametragesService } from '../services/parametrages.service';
import type { Parametrage } from '../services/parametrages.service';

const DEFAULTS = {
  cout_standard_poussin: 0,
  prix_vente_standard: 0,
  seuil_mortalite_critique_pct: 5,
  seuil_stock_bas_jours: 3,
};

const FIELDS = [
  { key: 'cout_standard_poussin' as const, label: 'Coût standard poussin (KMF)', desc: 'Coût d\'achat unitaire des poussins' },
  { key: 'prix_vente_standard' as const, label: 'Prix de vente standard (KMF)', desc: 'Prix de vente unitaire recommandé' },
  { key: 'seuil_mortalite_critique_pct' as const, label: 'Seuil mortalité critique (%)', desc: 'Pourcentage déclenchant une alerte criticité' },
  { key: 'seuil_stock_bas_jours' as const, label: 'Seuil stock bas (jours)', desc: 'Nombre de jours de stock restant déclenchant une alerte' },
];

export default function Parametrage() {
  const [data, setData] = useState<Parametrage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    parametragesService.getCurrent()
      .then((res) => setData(res))
      .catch(() => setError('Erreur lors du chargement du paramétrage'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const updated = await parametragesService.updateCurrent({
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

  const form = data || DEFAULTS;

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <Heading size="lg" color="text.1">Paramétrage</Heading>
        <Badge bg="accent.1" color="gray.900" borderRadius="full" px={3} py={1} fontSize="xs">
          Configuration globale
        </Badge>
      </HStack>

      {!data && (
        <Alert bg="warning.1" color="white" borderRadius="md" size="sm">
          <AlertIcon />
          Aucun paramétrage actif. Définissez les valeurs par défaut ci-dessous.
        </Alert>
      )}

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
            {FIELDS.map(({ key, label, desc }) => (
              <Box key={key}>
                <Text mb={1} fontSize="sm" color="text.2" fontWeight="medium">{label}</Text>
                <Input
                  type="number"
                  value={form[key]}
                  onChange={(e) => setData({ ...form, [key]: Number(e.target.value) } as Parametrage)}
                  bg="surface.2"
                  borderColor="border.1"
                  borderRadius="md"
                  size="sm"
                  _focus={{ borderColor: 'accent.1', boxShadow: '0 0 0 1px var(--chakra-colors-accent-1)' }}
                />
                <Text mt={1} fontSize="xs" color="text.3">{desc}</Text>
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
              size="sm"
            >
              {data ? 'Sauvegarder' : 'Créer le paramétrage'}
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
