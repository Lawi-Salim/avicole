import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, motDePasse);
      navigate('/cycles');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="surface.0" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Card bg="surface.1" borderColor="border.1" borderWidth="1px" maxW="420px" w="full">
        <CardBody p={8}>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <VStack spacing={1}>
              <Heading size="lg" color="accent.1">AVICOLE</Heading>
              <Text color="text.3" fontSize="sm">Gestion avicole — Connexion</Text>
            </VStack>

            {error && (
              <Alert bg="danger.1" color="white" borderRadius="md" size="sm">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <VStack spacing={4} w="full">
              <Box w="full">
                <Text mb={1} fontSize="sm" color="text.2">Email</Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="surface.2"
                  borderColor="border.1"
                  _focus={{ borderColor: 'accent.1', boxShadow: '0 0 0 1px var(--chakra-colors-accent-1)' }}
                  placeholder="adresse@email.com"
                  required
                />
              </Box>

              <Box w="full">
                <Text mb={1} fontSize="sm" color="text.2">Mot de passe</Text>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    bg="surface.2"
                    borderColor="border.1"
                    _focus={{ borderColor: 'accent.1', boxShadow: '0 0 0 1px var(--chakra-colors-accent-1)' }}
                    placeholder="••••••••"
                    required
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      color="text.3"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </Box>
            </VStack>

            <Button
              type="submit"
              bg="accent.1"
              color="gray.900"
              _hover={{ bg: 'accent.2' }}
              w="full"
              isLoading={loading}
              fontWeight="bold"
            >
              Se connecter
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
