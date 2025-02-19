import { tokens, config } from '@tamagui/config/v3';
import { createTamagui, createTokens } from 'tamagui';
import * as themes from '@/theme-output';

const myTokens = createTokens({
    ...tokens,
    color: {
        ...tokens.color,
        darkError: '#D32F2F',
        lightError: '#FF5252',
    },
});

const tamaguiConfig = createTamagui({
    ...config,
    tokens: myTokens,
    themes: {
        ...config.themes,
        ...themes,
        dark: {
            ...config.themes.dark,
            ...themes.dark,
            error: myTokens.color.darkError,
        },
        light: {
            ...config.themes.light,
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