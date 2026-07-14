import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  Text,
  VStack,
  Alert,
  AlertIcon,
  HStack,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { cyclesService } from '../services/cycles.service';

export default function CreateCycle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    numero_cycle: '',
    date_reception: new Date().toISOString().slice(0, 10),
    effectif_initial: 0,
    cout_achat_poussins: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await cyclesService.create(form);
      navigate('/cycles');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch" maxW="600px" mx="auto">
      <HStack>
        <Button
          variant="ghost"
          leftIcon={<FiArrowLeft />}
          color="text.2"
          onClick={() => navigate('/cycles')}
        >
          Retour
        </Button>
      </HStack>

      <Heading size="lg" color="text.1">Nouveau cycle</Heading>

      {error && (
        <Alert bg="danger.1" color="white" borderRadius="md" size="sm">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Card bg="surface.1" borderColor="border.1" borderWidth="1px">
        <CardBody>
          <VStack as="form" onSubmit={handleSubmit} spacing={5}>
            <Box w="full">
              <Text mb={1} fontSize="sm" color="text.2">Numéro de cycle</Text>
              <Input
                value={form.numero_cycle}
                onChange={(e) => setForm({ ...form, numero_cycle: e.target.value })}
                bg="surface.2"
                borderColor="border.1"
                _focus={{ borderColor: 'accent.1', boxShadow: '0 0 0 1px var(--chakra-colors-accent-1)' }}
                placeholder="Ex: CYC-2026-001"
                required
                h={8}
                fontSize="sm"
              />
            </Box>

            <Box w="full">
              <Text mb={1} fontSize="sm" color="text.2">Date de réception</Text>
              <Input
                type="date"
                value={form.date_reception}
                onChange={(e) => setForm({ ...form, date_reception: e.target.value })}
                bg="surface.2"
                borderColor="border.1"
                _focus={{ borderColor: 'accent.1', boxShadow: '0 0 0 1px var(--chakra-colors-accent-1)' }}
                required
                h={8}
                fontSize="sm"
              />
            </Box>

            <Box w="full">
              <Text mb={1} fontSize="sm" color="text.2">Effectif initial</Text>
              <Input
                type="number"
                value={form.effectif_initial || ''}
                onChange={(e) => setForm({ ...form, effectif_initial: Number(e.target.value) })}
                bg="surface.2"
                borderColor="border.1"
                _focus={{ borderColor: 'accent.1', boxShadow: '0 0 0 1px var(--chakra-colors-accent-1)' }}
                placeholder="Nombre de poussins"
                min={0}
                required
                h={8}
                fontSize="sm"
              />
            </Box>

            <Box w="full">
              <Text mb={1} fontSize="sm" color="text.2">Coût unitaire poussin (KMF)</Text>
              <Input
                type="number"
                value={form.cout_achat_poussins || ''}
                onChange={(e) => setForm({ ...form, cout_achat_poussins: Number(e.target.value) })}
                bg="surface.2"
                borderColor="border.1"
                _focus={{ borderColor: 'accent.1', boxShadow: '0 0 0 1px var(--chakra-colors-accent-1)' }}
                placeholder="Coût par poussin"
                min={0}
                required
                h={8}
                fontSize="sm"
              />
            </Box>

            <Button
              type="submit"
              bg="accent.1"
              color="gray.900"
              _hover={{ bg: 'accent.2' }}
              w="full"
              isLoading={loading}
              fontWeight="bold"
              size="sm"
            >
              Créer le cycle
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
