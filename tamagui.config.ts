import { tokens, defaultConfig } from '@tamagui/config/v4';
import { createTamagui, createTokens } from 'tamagui';
import { themes } from './themes';

const myTokens = createTokens({
    ...tokens,
    color: {
        darkError: '#D32F2F',
        lightError: '#FF5252',
    },
});

const tamaguiConfig = createTamagui({
    ...defaultConfig,
    tokens: myTokens,
    themes: {
        ...defaultConfig.themes,
        ...themes,
        dark: {
            ...defaultConfig.themes.dark,
            ...themes.dark,
            error: myTokens.color.darkError,
        },
        light: {
            ...defaultConfig.themes.light,
            ...themes.light,
            error: myTokens.color.lightError,
        }
    }
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}