import { Center, VStack, Text, Button, Icon } from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Center h="100%">
      <VStack spacing={6} textAlign="center">
        <Icon as={FiAlertTriangle} boxSize={16} color="warning.1" />
        <Text fontSize="2xl" fontWeight="bold" color="text.1">
          Page non trouvée
        </Text>
        <Text fontSize="md" color="text.2">
          La page que vous recherchez n'existe pas.
        </Text>
        <Text fontSize="sm" color="text.3">
          URL demandée : {location.pathname}
        </Text>
        <Button
          mt={2}
          colorScheme="blue"
          onClick={() => navigate('/cycles')}
          size="sm"
        >
          Retour à l'accueil
        </Button>
      </VStack>
    </Center>
  );
}
