import { createThemes, defaultComponentThemes } from '@tamagui/theme-builder';
import * as Colors from '@tamagui/colors';

const darkPalette = ['hsla(300, 18%, 9%, 1)', 'hsla(300, 18%, 17%, 1)', 'hsla(300, 18%, 25%, 1)', 'hsla(300, 18%, 34%, 1)', 'hsla(300, 18%, 42%, 1)', 'hsla(300, 18%, 50%, 1)', 'hsla(300, 18%, 58%, 1)', 'hsla(300, 18%, 66%, 1)', 'hsla(300, 18%, 74%, 1)', 'hsla(300, 18%, 83%, 1)', 'hsla(300, 18%, 91%, 1)', 'hsla(300, 18%, 99%, 1)'];
const lightPalette = ['hsla(300, 18%, 99%, 1)', 'hsla(300, 18%, 90%, 1)', 'hsla(300, 18%, 81%, 1)', 'hsla(300, 18%, 72%, 1)', 'hsla(300, 18%, 63%, 1)', 'hsla(300, 18%, 54%, 1)', 'hsla(300, 18%, 46%, 1)', 'hsla(300, 18%, 37%, 1)', 'hsla(300, 18%, 28%, 1)', 'hsla(300, 18%, 19%, 1)', 'hsla(300, 18%, 10%, 1)', 'hsla(300, 18%, 1%, 1)'];

const lightShadows = {
  shadow1: 'rgba(0,0,0,0.04)',
  shadow2: 'rgba(0,0,0,0.08)',
  shadow3: 'rgba(0,0,0,0.16)',
  shadow4: 'rgba(0,0,0,0.24)',
  shadow5: 'rgba(0,0,0,0.32)',
  shadow6: 'rgba(0,0,0,0.4)',
};

const darkShadows = {
  shadow1: 'rgba(0,0,0,0.2)',
  shadow2: 'rgba(0,0,0,0.3)',
  shadow3: 'rgba(0,0,0,0.4)',
  shadow4: 'rgba(0,0,0,0.5)',
  shadow5: 'rgba(0,0,0,0.6)',
  shadow6: 'rgba(0,0,0,0.7)',
};

// we're adding some example sub-themes for you to show how they are done, "success" "warning", "error":

const builtThemes = createThemes({

  componentThemes: {
    ...defaultComponentThemes,
    Button: {
      ...defaultComponentThemes.Button,
      success: {
        background: '$color9',
        color: '$color1',
      },
      error: {
        background: '$color9',
        color: '$color1',
      },
    },
  },

  base: {
    palette: {
      dark: darkPalette,
      light: lightPalette,
    },

    extra: {
      light: {
        ...Colors.green,
        ...Colors.red,
        ...Colors.yellow,
        ...lightShadows,
        shadowColor: lightShadows.shadow1,
      },
      dark: {
        ...Colors.greenDark,
        ...Colors.redDark,
        ...Colors.yellowDark,
        ...darkShadows,
        shadowColor: darkShadows.shadow1,
      },
    },
  },

  accent: {
    palette: {
      dark: ['hsla(347, 50%, 35%, 1)', 'hsla(347, 50%, 38%, 1)', 'hsla(346, 50%, 41%, 1)', 'hsla(346, 50%, 44%, 1)', 'hsla(346, 50%, 47%, 1)', 'hsla(345, 50%, 51%, 1)', 'hsla(345, 50%, 54%, 1)', 'hsla(345, 51%, 57%, 1)', 'hsla(344, 51%, 60%, 1)', 'hsla(344, 51%, 63%, 1)', 'hsla(344, 51%, 79%, 1)', 'hsla(344, 51%, 95%, 1)'],
      light: ['hsla(347, 50%, 51%, 1)', 'hsla(347, 50%, 53%, 1)', 'hsla(347, 51%, 55%, 1)', 'hsla(347, 51%, 56%, 1)', 'hsla(347, 51%, 58%, 1)', 'hsla(346, 51%, 60%, 1)', 'hsla(346, 51%, 62%, 1)', 'hsla(346, 51%, 63%, 1)', 'hsla(346, 51%, 65%, 1)', 'hsla(346, 52%, 67%, 1)', 'hsla(345, 51%, 81%, 1)', 'hsla(344, 51%, 95%, 1)'],
    },
  },

  childrenThemes: {
    warning: {
      palette: {
        dark: Object.values(Colors.yellowDark),
        light: Object.values(Colors.yellow),
      },
      template: 'base',
    },

    error: {
      palette: {
        dark: Object.values(Colors.redDark),
        light: Object.values(Colors.red),
      },
      template: 'base',
    },

    success: {
      palette: {
        dark: Object.values(Colors.greenDark),
        light: Object.values(Colors.green),
      },
      extra: {
        dark: {
          background: Colors.greenDark.green9,
          color: Colors.greenDark.green1,
        },
        light: {
          background: Colors.green.green9,
          color: Colors.green.green1,
        },
      },
      template: 'base',
    },
  },

  // optionally add more, can pass palette or template

  // grandChildrenThemes: {
  //   alt1: {
  //     template: 'alt1',
  //   },
  //   alt2: {
  //     template: 'alt2',
  //   },
  //   surface1: {
  //     template: 'surface1',
  //   },
  //   surface2: {
  //     template: 'surface2',
  //   },
  //   surface3: {
  //     template: 'surface3',
  //   },
  // },
});

export type Themes = typeof builtThemes;

// the process.env conditional here is optional but saves web client-side bundle
// size by leaving out themes JS. tamagui automatically hydrates themes from CSS
// back into JS for you, and the bundler plugins set TAMAGUI_ENVIRONMENT. so
// long as you are using the Vite, Next, Webpack plugins this should just work,
// but if not you can just export builtThemes directly as themes:
export const themes: Themes =
  process.env.TAMAGUI_ENVIRONMENT === 'client' &&
    process.env.NODE_ENV === 'production'
    ? ({} as any)
    : (builtThemes as any);
