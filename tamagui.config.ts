import { themes } from '@/themes';
import { config } from '@tamagui/config/v3';
import { createTamagui } from 'tamagui';

const tamaguiConfig = createTamagui({
    ...config,
    themes: {
        ...config.themes,
        ...themes,
    }
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}