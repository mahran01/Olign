import * as React from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider as DefaultProvider } from '@react-navigation/native';

type Props = {
    value: ReactNavigation.Theme | undefined;
    children: React.ReactNode;
};

export function ThemeProvider({ value, children }: Props) {
    return (
        <DefaultProvider value={value}>
            {children}</DefaultProvider>
    );
}
