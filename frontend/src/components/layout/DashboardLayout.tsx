import { ReactNode } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Badge,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  FiHome,
  FiSettings,
  FiUsers,
  FiGrid,
  FiPackage,
  FiHeart,
  FiDollarSign,
  FiShoppingBag,
  FiUser,
  FiBarChart2,
  FiFileText,
  FiSearch,
  FiBell,
  FiSun,
  FiMoon,
  FiLogOut,
} from 'react-icons/fi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../theme/ThemeMode';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatar } from '../../utils/Avatars';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, path, isActive, onClick }: NavItemProps) {
  return (
    <Box
      as="button"
      w="100%"
      display="flex"
      alignItems="center"
      gap={3}
      px={3}
      py={2}
      borderRadius="md"
      fontSize="sm"
      fontWeight={isActive ? 'medium' : 'normal'}
      color={isActive ? 'accent.1' : 'gray.400'}
      bg={isActive ? 'whiteAlpha.100' : 'transparent'}
      borderLeft={isActive ? '3px solid' : '3px solid transparent'}
      borderColor={isActive ? 'accent.1' : 'transparent'}
      transition="all 0.15s ease"
      _hover={{
        bg: 'whiteAlpha.100',
        color: 'gray.200',
      }}
      onClick={onClick}
      textAlign="left"
    >
      <Box as="span" display="flex" alignItems="center" fontSize="16px">
        {icon}
      </Box>
      <Text noOfLines={1}>{label}</Text>
    </Box>
  );
}

function SidebarHeader() {
  return (
    <HStack justify="space-between" px={4} py={4}>
      <HStack spacing={2}>
        <Text fontSize="xl" fontWeight="bold" color="accent.1">
          AVICOLE
        </Text>
      </HStack>
    </HStack>
  );
}

function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const sections = [
    {
      label: 'ADMINISTRATION',
      items: [
        { icon: <FiHome />, label: 'Vue d\'ensemble', path: '/cycles' },
        { icon: <FiSettings />, label: 'Paramètres', path: '/parametrage' },
        { icon: <FiUsers />, label: 'Utilisateurs', path: '/utilisateurs' },
      ],
    },
    {
      label: 'GESTION',
      items: [
        { icon: <FiGrid />, label: 'Cycles', path: '/cycles' },
        { icon: <FiPackage />, label: 'Stocks', path: '/stocks' },
        { icon: <FiHeart />, label: 'Santé', path: '/sante' },
        { icon: <FiDollarSign />, label: 'Finances', path: '/depenses' },
        { icon: <FiShoppingBag />, label: 'Ventes', path: '/ventes' },
        { icon: <FiUser />, label: 'Clients', path: '/clients' },
      ],
    },
    {
      label: 'RAPPORTS',
      items: [
        { icon: <FiBarChart2 />, label: 'Tableau de bord', path: '/dashboard' },
        { icon: <FiFileText />, label: 'Bilans', path: '/bilans' },
      ],
    },
  ];

  return (
    <VStack spacing={0} align="stretch" flex={1} overflowY="auto" px={2} py={2}>
      {sections.map((section, sIdx) => (
        <Box key={section.label}>
          {sIdx > 0 && <Divider borderColor="whiteAlpha.200" my={3} />}
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="gray.500"
            letterSpacing="wider"
            px={3}
            mb={2}
            mt={sIdx === 0 ? 0 : 1}
          >
            {section.label}
          </Text>
          <VStack spacing={0.5} align="stretch">
            {section.items.map((item) => (
              <NavItem
                key={item.path + item.label}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              />
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}

function SidebarUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <HStack
      px={4}
      py={3}
      spacing={3}
      borderTop="1px solid"
      borderColor="whiteAlpha.200"
    >
      <UserAvatar
        name={user?.nom}
        size={36}
        src={user?.photo ?? null}
      />
      <VStack spacing={0} align="start" flex={1} minW={0}>
        <Text fontSize="sm" fontWeight="medium" color="gray.200" noOfLines={1}>
          {user?.nom || 'Utilisateur'}
        </Text>
        <Text fontSize="xs" color="gray.500" noOfLines={1}>
          {user?.email || 'email@avicole.com'}
        </Text>
      </VStack>
      <Tooltip label="Déconnexion" placement="top">
        <IconButton
          aria-label="Déconnexion"
          icon={<FiLogOut />}
          size="sm"
          variant="ghost"
          color="gray.500"
          _hover={{ color: 'red.300', bg: 'whiteAlpha.100' }}
          onClick={handleLogout}
        />
      </Tooltip>
    </HStack>
  );
}

function Navbar() {
  const { colorMode, toggleThemeMode } = useThemeMode();

  return (
    <Flex
      as="nav"
      h="60px"
      bg="surface.1"
      borderBottom="1px solid"
      borderColor="border.1"
      px={6}
      align="center"
      justify="space-between"
      flexShrink={0}
    >
      <InputGroup maxW="400px" size="md">
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.500" />
        </InputLeftElement>
        <Input
          placeholder="Rechercher..."
          bg="surface.2"
          border="none"
          borderRadius="lg"
          _placeholder={{ color: 'gray.500' }}
          _focus={{ bg: 'surface.3', boxShadow: 'none' }}
        />
      </InputGroup>

      <HStack spacing={3}>
        <Tooltip label="Notifications" placement="bottom">
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              icon={<FiBell />}
              size="sm"
              variant="ghost"
              color="text.2"
            />
            <Badge
              position="absolute"
              top={1}
              right={1}
              w={2}
              h={2}
              bg="red.400"
              borderRadius="full"
              border="2px solid"
              borderColor="surface.1"
            />
          </Box>
        </Tooltip>

        <IconButton
          aria-label="Changer de thème"
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          size="sm"
          variant="ghost"
          color="text.2"
          onClick={toggleThemeMode}
        />

        <Box
          w={8}
          h={8}
          borderRadius="full"
          bg="accent.1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
        >
          <Text fontSize="xs" fontWeight="bold" color="gray.900">
            LS
          </Text>
        </Box>
      </HStack>
    </Flex>
  );
}

export default function DashboardLayout() {
  return (
    <Flex h="100vh" overflow="hidden">
      {/* Sidebar */}
      <Flex
        w="250px"
        minW="250px"
        h="100vh"
        bg="gray.900"
        borderRight="1px solid"
        borderColor="whiteAlpha.200"
        flexDirection="column"
      >
        {/* Bloc 1: Header */}
        <SidebarHeader />

        {/* Bloc 2: Navigation */}
        <SidebarNav />

        {/* Bloc 3: User info */}
        <SidebarUser />
      </Flex>

      {/* Main content area */}
      <Flex flex={1} flexDirection="column" minW={0}>
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <Box
          flex={1}
          bg="surface.0"
          p={6}
          overflow="auto"
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
