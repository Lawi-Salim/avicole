import { Center, VStack, Text, Button, Icon } from '@chakra-ui/react';
import { FiTool } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <Center h="100%">
      <VStack spacing={6} textAlign="center">
        <Icon as={FiTool} boxSize={16} color="accent.1" />
        <Text fontSize="2xl" fontWeight="bold" color="text.1">
          Page en construction
        </Text>
        <Text fontSize="sm" color="text.2">
          Cette page sera implémentée dans une version future.
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
