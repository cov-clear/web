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
  layout: {
    page: {
      maxWidth: '600px',
      paddingTop: 6,
      paddingBottom: 5,
      paddingRight: 3,
      paddingLeft: 3,
    },
  },
  spinner: {
    main: {
      position: 'fixed',
      top: '25%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  },
  buttons: {
    primary: {
      cursor: 'pointer',
      fontWeight: semibold,
      fill: 'background',
    },
    block: {
      cursor: 'pointer',
      fontWeight: semibold,
      fill: 'background',
      display: 'block',
      width: '100%',
      '&:hover': {
        color: 'background',
      },
    },
    fab: {
      cursor: 'pointer',
      fontWeight: semibold,
      color: 'primary',
      borderColor: 'primary',
      border: '2px solid',
      backgroundColor: 'background',
      position: 'fixed',
      right: 4,
      bottom: 4,
      boxShadow: '2px 4px 12px rgba(0, 0, 0, 0.24)',
      borderRadius: '24px',
      fill: 'primary',
    },
  },
  messages: {
    warning: {
      background: '#FFFBE6',
      border: '1px solid #FFE58F', // TODO: integrate these colors into the design system
    },
  },
};

export default theme;
