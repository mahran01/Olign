import React from 'react';
import { YStack, Text } from 'tamagui';

interface IDashboardScreenProps {
}

const DashboardScreen: React.FC<IDashboardScreenProps> = (props) => {
    return (
        <YStack>
            <Text>DASHBOARD</Text>
        </YStack>
    );
};

export default DashboardScreen;
