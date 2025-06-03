
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    Controller,
    Control,
    FieldValues,
    ControllerRenderProps,
    FieldError,
} from 'react-hook-form';
import { ViewProps } from 'react-native';
import { Text, YStack } from 'tamagui';
import MyMoti from './MyMoti';

type ControlledFieldProps<T extends FieldValues> = {
    control: Control<T>;
    name: string;
    maxLength?: number;
    children: (inputProps: {
        value: string;
        onChangeText: (text: string) => void;
        onBlur: () => void;
        onFocus: () => void;
        error?: FieldError | undefined;
    }) => React.ReactNode;
};

export function ControlledField<T extends FieldValues>({
    control,
    name,
    maxLength,
    children,
}: ControlledFieldProps<T>) {
    const [focused, setFocused] = React.useState(false);

    return (
        <Controller
            control={control as Control<FieldValues>}
            name={name}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
                const val = value ?? '';

                return (
                    <MyMoti error={error}>
                        <YStack>
                            {children({
                                value: val,
                                onChangeText: onChange,
                                onBlur: () => {
                                    const trimmed = val.trim();
                                    if (trimmed !== val) onChange(trimmed);
                                    onBlur();
                                    setFocused(false);
                                },
                                onFocus: () => setFocused(true),
                            })}

                            {error ? (
                                <Text color="red" fontSize="$2" >
                                    {error.message}
                                </Text>
                            ) : (maxLength !== undefined && focused) && (
                                <Text color={val.length >= maxLength ? 'red' : '$color6'} fontSize="$2" >
                                    {val.length}/{maxLength} characters
                                </Text>
                            )}
                        </YStack>
                    </MyMoti>
                );
            }}
        />
    );
}
