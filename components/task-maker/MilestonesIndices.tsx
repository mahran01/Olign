import React from 'react';
import { XStack, YStack, Separator, View, Text } from 'tamagui';

export const MilestonesIndices = ({ index, children }: any) => (
    <XStack px="$3" gap="$3" mt="$1.5">
        <YStack ai="center">
            <Separator vertical bs="dashed" mah="$0.75" />
            <View
                aspectRatio={1}
                br={99999}
                bg="$color3"
                w="$2"
                jc="center"
                ai="center"
                my="$2"
            >
                <Text>{index + 1}</Text>
            </View>
            <Separator vertical bs="dashed" />
        </YStack>
        {children}
    </XStack>
);
