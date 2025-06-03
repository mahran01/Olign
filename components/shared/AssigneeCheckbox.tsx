import { useState } from 'react';
import { Checkbox, XStack, Text } from 'tamagui';
import { Check } from '@tamagui/lucide-icons';

type Props = {
    label: string;
    id: string;
    initial: boolean;
    onToggle: (checked: boolean) => Promise<void>;
};

export const AssigneeCheckbox = ({ label, id, initial, onToggle }: Props) => {
    const [checked, setChecked] = useState(initial);
    const [loading, setLoading] = useState(false);

    return (
        <XStack px='$2' ai='center' jc='space-between'>
            <Text fontSize='$4'>{label}</Text>
            <Checkbox
                id={id}
                size='$5'
                checked={checked}
                disabled={loading}
                onCheckedChange={async (c) => {
                    const next = c as boolean;
                    setChecked(next);
                    setLoading(true);
                    try {
                        await onToggle(next);
                    } catch (err) {
                        console.error(err);
                        setChecked(!next); // rollback on error
                    } finally {
                        setLoading(false);
                    }
                }}
            >
                <Checkbox.Indicator>
                    <Check />
                </Checkbox.Indicator>
            </Checkbox>
        </XStack>
    );
};