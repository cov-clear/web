import { system } from '@theme-ui/presets';

const baseTheme = system;

const theme = {
  ...baseTheme,
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
