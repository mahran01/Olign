import React from 'react';
import { MessageSimple, type MessageSimpleProps } from 'stream-chat-expo';
import { Card, Text, YStack } from 'tamagui';

const CustomMessageSimple = (props: MessageSimpleProps) => {
    const { message } = props;

    if (!message) {
        // No message to render, just fallback
        return <MessageSimple {...props} />;
    }

    const taskAttachment = message.attachments?.find((a) => a.type === 'task');

    return (
        <>
            {taskAttachment && (
                <Card p="$3" m="$2" bordered>
                    <YStack>
                        <Text fontWeight="bold">{taskAttachment.title ?? 'Untitled Task'}</Text>
                        <Text>{taskAttachment.description ?? 'No description'}</Text>
                    </YStack>
                </Card>
            )}
            <MessageSimple {...props} />
        </>
    );
};

export default CustomMessageSimple;
