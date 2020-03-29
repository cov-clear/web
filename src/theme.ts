import { system } from '@theme-ui/presets';

const baseTheme = system;

const normalWeight = 400;
const semibold = 600;

const theme = {
  ...baseTheme,
  space: [0, 4, 8, 16, 24, 40, 64, 128, 256, 512],
  colors: {
    ...baseTheme.colors,
    // primary: '#1890FF',
    primary: '#096DD9',
  },
  links: {
    tab: {
      textAlign: 'center',
      borderBottom: '1px solid',
      borderColor: '#DEDEDE', // TODO: grab this from the design system
      display: 'block',
      width: '100%',
      padding: 2,
      fontWeight: normalWeight,
      '&.active': {
        fill: 'primary',
        borderBottom: '4px solid',
        borderColor: 'primary',
        fontWeight: semibold,
      },
      '&:hover': {
        fill: 'primary',
      },
    },
  },
  buttons: {
    primary: {
      cursor: 'pointer',
      fontWeight: semibold,
    },
    block: {
      cursor: 'pointer',
      fontWeight: semibold,
      display: 'block',
      width: '100%',
    },
  },
};

export default theme;
