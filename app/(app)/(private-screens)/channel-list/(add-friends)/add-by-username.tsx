import { buildTextInput } from '@/components';
import { Stack } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { H3, H4, H5, YStack } from 'tamagui';

interface IAddByUsernameProps {
}

const AddByUsername: React.FC<IAddByUsernameProps> = (props) => {


    const { control, handleSubmit, formState: { errors, dirtyFields }, watch, trigger } = useForm<FormData>({
        defaultValues: {
            username: '',
        },
    });

    return (
        <>
            <Stack.Screen options={{ title: "Add by Username" }} />

            <YStack p='$5' pt='$8' h='100%' bg='$background'>

                <H5 pb='$3'>Who would you like to add as a friend?</H5>


                {buildTextInput({
                    name: "username",
                    placeholder: "Enter a username",
                    control: control,
                    handleFocus: () => { },

                })}
                <H5 pb='$3'>Your username is</H5>
            </YStack>
        </>
    );
};

export default AddByUsername;
