import { system } from '@theme-ui/presets';

const baseTheme = system;

const theme = {
  ...baseTheme,
  space: [0, 4, 8, 16, 24, 40, 64, 128, 256, 512],
  colors: {
    ...baseTheme.colors,
    primary: '#1890FF',
  },
  buttons: {
    primary: {
      cursor: 'pointer',
    },
    block: {
      cursor: 'pointer',
      display: 'block',
      width: '100%',
    },
  },
};

export default theme;
