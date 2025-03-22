import { Stack } from 'expo-router';
import React from 'react';
import { YStack } from 'tamagui';

interface IAddByUsernameProps {
}

const AddByUsername: React.FC<IAddByUsernameProps> = (props) => {
    return (
        <>
            <Stack.Screen options={{ title: "Add by Username" }} />
            <YStack p='$4' h='100%' bg='$background'>

            </YStack>
        </>
    );
};

export default AddByUsername;
