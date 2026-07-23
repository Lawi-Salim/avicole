import { useState } from 'react';
import { Box, Button, HStack, VStack, IconButton, Text, Menu, MenuButton, MenuList, MenuItem, Heading } from '@chakra-ui/react';
import { FiSun, FiMoon, FiLogOut, FiUser, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import { useThemeMode } from '../theme/ThemeMode';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../utils/Avatars';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { colorMode, toggleThemeMode } = useThemeMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfilModal, setShowProfilModal] = useState(false);

  return (
    <>
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
        <HStack spacing={4}>
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

          <HStack spacing={1}>
            <Box
              as="button"
              px={3}
              py={1}
              borderRadius="md"
              fontSize="sm"
              color="text.2"
              _hover={{ bg: 'surface.2' }}
              onClick={() => navigate('/depenses')}
            >
              <HStack spacing={1}>
                <FiDollarSign />
                <Text display={{ base: 'none', md: 'block' }}>Depenses</Text>
              </HStack>
            </Box>
            <Box
              as="button"
              px={3}
              py={1}
              borderRadius="md"
              fontSize="sm"
              color="text.2"
              _hover={{ bg: 'surface.2' }}
              onClick={() => navigate('/ventes')}
            >
              <HStack spacing={1}>
                <FiShoppingBag />
                <Text display={{ base: 'none', md: 'block' }}>Ventes</Text>
              </HStack>
            </Box>
          </HStack>
        </HStack>

        <HStack spacing={3}>
          <IconButton
            aria-label="Changer de theme"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleThemeMode}
            variant="ghost"
            size="sm"
            color="text.2"
            display={{ base: 'none', md: 'flex' }}
          />

          {user && (
            <Menu>
              <MenuButton as={HStack} spacing={2} cursor="pointer" p={1} borderRadius="md" _hover={{ bg: 'surface.2' }}>
                <Box pointerEvents="auto">
                  <UserAvatar name={`${user.nom} ${user.prenom || ''}`.trim()} size={28} src={user.photo ?? null} />
                </Box>
              </MenuButton>
              <MenuList bg="surface.1" borderColor="border.1">
                <MenuItem
                  bg="transparent"
                  _hover={{ bg: 'surface.2' }}
                  icon={<FiUser />}
                  onClick={() => setShowProfilModal(true)}
                  fontSize={{ base: "md", md: "sm" }}
                >
                  Profil
                </MenuItem>

                <MenuItem
                  bg="transparent"
                  _hover={{ bg: 'surface.2' }}
                  icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                  onClick={toggleThemeMode}
                  display={{ base: 'flex', md: 'none' }}
                  fontSize={{ base: "md", md: "sm" }}
                >
                  {colorMode === 'light' ? 'Mode sombre' : 'Mode clair'}
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
                  fontSize={{ base: "md", md: "sm" }}
                >
                  Déconnexion
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </HStack>
    </Box>

    {showProfilModal && (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.5)"
        zIndex={1000}
        onClick={() => setShowProfilModal(false)}
      >
        <Box
          bg="surface.1"
          borderRadius="lg"
          p={6}
          maxW="500px"
          mx="auto"
          mt={{ base: 4, md: '10vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <HStack justify="space-between" align="center" mb={6}>
            <Heading size="md" color="text.1" fontSize={{ base: "ms", md: "md" }}>Mon profil</Heading>
            <Box
              as="button"
              onClick={() => setShowProfilModal(false)}
              fontSize="xl"
              color="text.2"
              _hover={{ color: 'text.1' }}
              cursor="pointer"
            >
              ×
            </Box>
          </HStack>

          <Box display="flex" alignItems="center" mb={6}>
            <Box pointerEvents="auto">
              <UserAvatar name={`${user?.nom} ${user?.prenom || ''}`.trim()} size={64} src={user?.photo ?? null} />
            </Box>
            <Box ml={4}>
              <Text fontSize="lg" fontWeight="bold" color="text.1">
                {`${user?.nom} ${user?.prenom || ''}`.trim()}
              </Text>
              <Text fontSize="sm" color="text.3">
                {user?.role === 'admin' ? 'Administrateur' : user?.role === 'employe' ? 'Employé' : 'Comptable'}
              </Text>
            </Box>
          </Box>

          <VStack spacing={4} align="stretch">
            <Box>
              <Text mb={1} fontSize={{ base: "sm", md: "ms" }} color="text.3" fontWeight="medium">Email</Text>
              <Text color="text.1" fontSize={{ base: "sm", md: "ms" }}>{user?.email}</Text>
            </Box>

            {user?.telephone && (
              <Box>
                <Text mb={1} fontSize={{ base: "sm", md: "ms" }} color="text.3" fontWeight="medium">Téléphone</Text>
                <Text color="text.1" fontSize={{ base: "sm", md: "ms" }}>{user.telephone}</Text>
              </Box>
            )}

            {user?.adresse && (
              <Box>
                <Text mb={1} fontSize={{ base: "sm", md: "ms" }} color="text.3" fontWeight="medium">Adresse</Text>
                <Text color="text.1" fontSize={{ base: "sm", md: "ms" }}>{user.adresse}</Text>
              </Box>
            )}

            <Box>
              <Text mb={1} fontSize={{ base: "sm", md: "ms" }} color="text.3" fontWeight="medium">Créé le</Text>
              <Text color="text.2" fontSize={{ base: "sm", md: "ms" }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
              </Text>
            </Box>

            {user?.updated_at && (
              <Box>
                <Text mb={1} fontSize={{ base: "sm", md: "ms" }} color="text.3" fontWeight="medium">Mis à jour le</Text>
                <Text color="text.2" fontSize={{ base: "sm", md: "ms" }}>
                  {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                </Text>
              </Box>
            )}
          </VStack>

          <Button
            bg="accent.1"
            color="gray.900"
            _hover={{ bg: 'accent.2' }}
            fontWeight="bold"
            onClick={() => {
              setShowProfilModal(false);
              navigate('/parametrage');
            }}
            size={{ base: "md", md: "sm" }}
            mt={6}
            w="full"
          >
            Modifier mon profil
          </Button>
        </Box>
      </Box>
    )}
    </>
  );
}
