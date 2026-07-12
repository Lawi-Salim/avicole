import React from 'react';
import { Box } from '@chakra-ui/react';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { resolvePublicApiUrl } from './auth/apiAuth';

interface UserAvatarProps {
  name?: string;
  size?: number;
  borderColor?: string;
  bg?: string;
  fgColor?: string;
  src?: string | null;
}

export function UserAvatar({
  name,
  size = 32,
  borderColor = 'border.1',
  bg = 'transparent',
  fgColor = '',
  src,
}: UserAvatarProps) {
  const resolved = resolvePublicApiUrl(src ?? null)
  // Si une image personnalisée est fournie, l'afficher
  if (resolved) {
    return (
      <Box
        position="relative"
        w={`${size}px`}
        h={`${size}px`}
        borderRadius="full"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
        bg={bg}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          as="img"
          src={resolved}
          alt={name || 'Avatar'}
          w="100%"
          h="100%"
          objectFit="cover"
        />
      </Box>
    );
  }

  // Sinon, générer un avatar à partir du nom
  const seed = String(name || 'User').trim() || 'User';

  const svg = createAvatar(micah, {
    seed,
    backgroundColor: ['transparent'],
  }).toString();

  return (
    <Box
      position="relative"
      w={`${size}px`}
      h={`${size}px`}
      borderRadius="full"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bg}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        w="100%"
        h="100%"
        sx={{
          '& svg': { width: '100%', height: '100%', display: 'block' },
          ...(fgColor
            ? {
                '& svg path, & svg circle, & svg rect, & svg ellipse, & svg polygon, & svg line, & svg polyline': {
                  fill: fgColor,
                  stroke: fgColor,
                },
              }
            : null),
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </Box>
  );
}
