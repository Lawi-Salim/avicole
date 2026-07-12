import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <Box minH="100vh" bg="surface.0">
      <Navbar />
      <Box as="main" maxW="1400px" mx="auto" px={4} py={6}>
        <Outlet />
      </Box>
    </Box>
  );
}
