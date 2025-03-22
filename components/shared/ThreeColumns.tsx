import React from 'react';
import { XStack, YStack } from 'tamagui';

interface IThreeColumnsProps {
    left?: () => React.ReactNode;
    middle?: () => React.ReactNode;
    right?: () => React.ReactNode;
}

const ThreeColumns: React.FC<IThreeColumnsProps> = ({ left, middle, right }) => {
    return (
        <XStack ai="center" jc="space-between" w="100%">
            {left && <XStack mx={8}>{left()}</XStack>}
            <YStack flex={1} jc="center" mx={8}>
                {middle && middle()}
            </YStack>
            {right && <XStack mx={8}>{right()}</XStack>}
        </XStack>
    );
};

export default ThreeColumns;