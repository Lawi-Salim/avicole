import { Box, HStack, IconButton, Text, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { FiSun, FiMoon, FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { useThemeMode } from '../theme/ThemeMode';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../utils/Avatars';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { colorMode, toggleThemeMode } = useThemeMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      as="nav"
      bg="surface.1"
      borderBottom="1px solid"
      borderColor="border.1"
      px={4}
      py={2}
      position="sticky"
      top={0}
      zIndex={100}
    >
      <HStack justify="space-between" maxW="1400px" mx="auto">
        <HStack
          spacing={2}
          cursor="pointer"
          onClick={() => navigate('/cycles')}
          _hover={{ opacity: 0.8 }}
        >
          <Text fontSize="lg" fontWeight="bold" color="accent.1">
            AVICOLE
          </Text>
        </HStack>

        <HStack spacing={3}>
          <IconButton
            aria-label="Changer de thème"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleThemeMode}
            variant="ghost"
            size="sm"
            color="text.2"
          />

          {user && (
            <Menu>
              <MenuButton as={HStack} spacing={2} cursor="pointer" p={1} borderRadius="md" _hover={{ bg: 'surface.2' }}>
                <UserAvatar name={user.nom} size={28} src={user.photo ?? null} />
                <Text fontSize="sm" color="text.2" display={{ base: 'none', md: 'block' }}>
                  {user.nom}
                </Text>
              </MenuButton>
              <MenuList bg="surface.1" borderColor="border.1">
                <MenuItem
                  bg="transparent"
                  _hover={{ bg: 'surface.2' }}
                  icon={<FiUser />}
                  onClick={() => {}}
                >
                  Profil
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  _hover={{ bg: 'surface.2' }}
                  icon={<FiSettings />}
                  onClick={() => navigate('/parametrage')}
                >
                  Paramétrage
                </MenuItem>
                <MenuItem
                  bg="transparent"
                  _hover={{ bg: 'surface.2' }}
                  icon={<FiLogOut />}
                  color="danger.1"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Déconnexion
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </HStack>
    </Box>
  );
}
