import { extendTheme } from '@chakra-ui/react';

export const COLORS = {
  primary: {
    50: '#E6F6FF',
    100: '#BAE3FF',
    200: '#7CC4FA',
    300: '#47A3F3',
    400: '#2186EB',
    500: '#0967D2',
    600: '#0552B5',
    700: '#03449E',
    800: '#01337D',
    900: '#002159',
  },
  secondary: {
    50: '#E6FFFA',
    100: '#B2F5EA',
    200: '#81E6D9',
    300: '#4FD1C5',
    400: '#38B2AC',
    500: '#2C7A7B',
    600: '#285E61',
    700: '#234E52',
    800: '#1D4044',
    900: '#1A3638',
  },
  accent: {
    50: '#F5E6FF',
    100: '#E2CCFF',
    200: '#C299FF',
    300: '#A366FF',
    400: '#8533FF',
    500: '#6B46C1',
    600: '#553C9A',
    700: '#44337A',
    800: '#322659',
    900: '#1A1A1A',
  },
};

const theme = extendTheme({
  colors: COLORS,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: (props: { colorMode: 'light' | 'dark' }) => ({
      body: {
        bg: props.colorMode === 'light' ? 'gray.50' : 'gray.900',
      },
    }),
  },
});

export default theme;

export const getColorModeValues = (colorMode: string) => ({
  bg: colorMode === 'light' ? 'white' : 'gray.800',
  color: colorMode === 'light' ? 'gray.800' : 'white',
  borderColor: colorMode === 'light' ? 'gray.200' : 'gray.700',
  iconColor: colorMode === 'light' ? 'gray.600' : 'gray.400',
  hoverBg: colorMode === 'light' ? 'gray.50' : 'gray.700',
}); 