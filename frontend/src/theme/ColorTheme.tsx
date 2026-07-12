import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// TypeScript a besoin de savoir que ces imports de fichiers statiques sont des chaînes de caractères
import geistRegular from '../assets/fonts/geist/Geist-Regular.ttf';
import geistMedium from '../assets/fonts/geist/Geist-Medium.ttf';
import geistBold from '../assets/fonts/geist/Geist-Bold.ttf';
import geistMonoVariable from '../assets/fonts/geist/GeistMono-VariableFont_wght.ttf';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const semanticTokens = {
  colors: {
    'surface.0': { default: 'gray.50', _dark: 'gray.900' },
    'surface.1': { default: 'white', _dark: 'gray.850' },
    'surface.2': { default: 'gray.100', _dark: 'gray.800' },
    'surface.3': { default: 'gray.200', _dark: 'gray.750' },

    'border.1': { default: 'gray.200', _dark: 'gray.700' },
    'border.2': { default: 'gray.300', _dark: 'gray.600' },

    'text.1': { default: 'gray.900', _dark: 'gray.100' },
    'text.2': { default: 'gray.700', _dark: 'gray.300' },
    'text.3': { default: 'gray.600', _dark: 'gray.400' },

    'accent.1': { default: 'blue.500', _dark: '#90CDF4' },
    'accent.2': { default: 'blue.600', _dark: 'blue.300' },
    'accent.60': { default: 'blue.300', _dark: 'blue.200' },
    'accent.bg': { default: 'rgba(66, 153, 225, 0.10)', _dark: 'rgba(144, 205, 244, 0.10)' },
    'accent.bdr': { default: 'rgba(66, 153, 225, 0.30)', _dark: 'rgba(144, 205, 244, 0.26)' },
    'accent.glow': { default: 'rgba(66, 153, 225, 0.35)', _dark: 'rgba(144, 205, 244, 0.35)' },

    'admin.1': { default: 'purple.500', _dark: '#B794F4' },
    'admin.60': { default: 'rgba(128, 90, 213, 0.60)', _dark: 'rgba(183,148,244,0.60)' },
    'admin.bg': { default: 'rgba(128, 90, 213, 0.10)', _dark: 'rgba(183,148,244,0.08)' },
    'admin.bdr': { default: 'rgba(128, 90, 213, 0.28)', _dark: 'rgba(183,148,244,0.22)' },
    'admin.glow': { default: 'rgba(128, 90, 213, 0.35)', _dark: 'rgba(183,148,244,0.30)' },

    'danger.1': { default: 'red.500', _dark: 'red.300' },
    'success.1': { default: 'green.500', _dark: 'green.300' },
    'warning.1': { default: 'orange.500', _dark: 'yellow.200' },
  },
};

const styles = {
  global: {
    '@font-face': [
      {
        fontFamily: 'Geist',
        src: `url(${geistRegular as string}) format('truetype')`,
        fontWeight: 400,
        fontStyle: 'normal',
        fontDisplay: 'swap',
      },
      {
        fontFamily: 'Geist',
        src: `url(${geistMedium as string}) format('truetype')`,
        fontWeight: 500,
        fontStyle: 'normal',
        fontDisplay: 'swap',
      },
      {
        fontFamily: 'Geist',
        src: `url(${geistBold as string}) format('truetype')`,
        fontWeight: 700,
        fontStyle: 'normal',
        fontDisplay: 'swap',
      },
      {
        fontFamily: 'Geist Mono',
        src: `url(${geistMonoVariable as string}) format('truetype')`,
        fontWeight: '100 900',
        fontStyle: 'normal',
        fontDisplay: 'swap',
      },
    ],
    '*::selection': {
      background: '#90CDF4',
      color: '#0B1220',
    },
    'html, body': {
      bg: 'surface.0',
      color: 'text.1',
      height: '100%',
      overflowX: 'hidden',
      overflowY: 'auto',
    },
    '#root': {
      height: '100%',
    },
  },
};

const theme = extendTheme({
  config,
  fonts: {
    heading: "Geist, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    body: "Geist, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    mono: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  colors: {
    gray: {
      750: '#242F3D',
      850: '#141A22',
    },
  },
  semanticTokens,
  styles,
});

export default theme;
