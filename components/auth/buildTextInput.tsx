import { AlertCircle } from "@tamagui/lucide-icons";
import React from 'react';
import { Controller } from "react-hook-form";
import { Input, Label, Text, XStack, YStack } from "tamagui";

type TextInputProps = {
    control: any;
    name: string;
    label?: string,
    placeholder?: string;
    rules?: object;
    error?: any;
    autoComplete?: any;
    textContentType?: any;
    secureTextEntry?: boolean;
    maxLength?: number;
    selectTextOnFocus?: boolean;
    handleFocus: (name: any) => void;
    input?: ({ onChange, value, onBlur }: any) => React.ReactElement;
};

export const buildTextInput = (({
    control,
    name,
    label,
    placeholder,
    rules,
    error,
    autoComplete,
    textContentType,
    secureTextEntry,
    maxLength,
    selectTextOnFocus,
    handleFocus,
    input,
}: TextInputProps) => (
    <YStack w="100%">
        {label && <Label>{label}</Label>}
        <Controller
            control={control}
            rules={rules}
            render={({ field: { onChange, value, onBlur } }) => (
                input ? input({ onChange, value, onBlur }) : <Input
                    onChangeText={onChange}
                    value={value} onBlur={onBlur}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    textContentType={textContentType}
                    secureTextEntry={secureTextEntry}
                    maxLength={maxLength}
                    selectTextOnFocus={selectTextOnFocus}
                    onFocus={() => handleFocus(name)}
                />
            )}
            name={name}
        />
        {error && (
            <XStack ai='center' pt='$2' pl='$1'>
                <AlertCircle color='$error' size='$1' mr='$2' />
                <Text f={1} textWrap='wrap' w='100%' color='$error'>{error.message}</Text>
            </XStack>
        )}
    </YStack >
));
