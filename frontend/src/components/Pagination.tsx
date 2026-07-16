import { HStack, Button, Text } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages === 0) return null;

  return (
    <HStack spacing={2} justify="center">
      <Button
        size="xs"
        variant="ghost"
        color="text.3"
        leftIcon={<FiChevronLeft />}
        isDisabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Précédent
      </Button>
      <Text fontSize="sm" color="text.3">
        Page {currentPage} / {totalPages}
      </Text>
      <Button
        size="xs"
        variant="ghost"
        color="text.3"
        rightIcon={<FiChevronRight />}
        isDisabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Suivant
      </Button>
    </HStack>
  );
}
