import { system } from '@theme-ui/presets';

const baseTheme = system;

const normalWeight = 400;
const semibold = 600;

const commonBadgeStyles = {
  fontWeight: normalWeight,
  paddingLeft: 2,
  paddingRight: 2,
  border: '1px solid',
};

const theme = {
  ...baseTheme,
  space: [0, 4, 8, 16, 24, 40, 64, 128, 256, 512],
  colors: {
    ...baseTheme.colors,
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
  alerts: {
    warning: {
      background: '#FFFBE6',
      border: '1px solid #FFE58F', // TODO: integrate these colors into the design system
      color: 'text',
      fontWeight: 'inherit',
      paddingTop: 3,
      paddingBottom: 3,
      paddingLeft: 4,
      paddingRight: 4,
    },
    success: {
      background: '#52c41a', // Primary green from https://ant.design/docs/spec/colors
    },
    error: {
      background: '#f5222d', // Primary red from https://ant.design/docs/spec/colors
    },
  },
  badges: {
    neutral: {
      ...commonBadgeStyles,
      color: '#2F54EB',
      borderColor: '#2F54EB',
      backgroundColor: '#F0F5FF',
    },
    negative: {
      ...commonBadgeStyles,
      color: '#EB2F96',
      borderColor: '#EB2F96',
      backgroundColor: '#FFF0F6',
    },
    muted: {
      ...commonBadgeStyles,
      color: '#8F8F8F',
      borderColor: '#8F8F8F',
      backgroundColor: 'background',
    },
  },
  styles: {
    ...baseTheme.styles,
    hr: {
      borderBottom: '1px solid #DEDEDE',
    },
  },
};

export default theme;
