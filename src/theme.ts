import { system } from '@theme-ui/presets';

const baseTheme = system;
console.log(baseTheme);

const theme = {
  ...baseTheme,
  buttons: {
    primary: {
      cursor: 'pointer',
    },
    secondary: {
      cursor: 'pointer',
    },
  },
};

export default theme;
