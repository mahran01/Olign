import React, { useEffect, useState } from 'react';
import { TextArea, XStack, Button, View, YStack, Text } from 'tamagui';
import { Calendar, CalendarClock, UserPlus } from '@tamagui/lucide-icons';
import { ControlledField } from '../shared/ControlledField';
import { Control, Controller, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form';
import { TaskAttachmentInsertInputType } from '@/schemas';
import { default as DateTimePicker } from '../shared/SecondDateTimePickerComponent';
import { formatDeadline } from '@/utils';
import { useAssigneePickerStore, useAuthStore, useProfileStore } from '@/stores';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/contexts';

export const ExpandedMilestone = ({
    index,
    control,
    getValues,
    setValue,
    members,
    defaultAssignee,
    readOnly
}: {
    index: number;
    control: Control<TaskAttachmentInsertInputType>;
    getValues: UseFormGetValues<TaskAttachmentInsertInputType>;
    setValue: UseFormSetValue<TaskAttachmentInsertInputType>;
    members: Record<string, any>;
    defaultAssignee?: string;

    readOnly?: boolean;
}) => {
    const fetchUserProfile = useProfileStore(e => e.fetchUserProfile);
    const userId = useAuthStore(e => e.session)?.user.id;
    const router = useRouter();
    const setPicker = useAssigneePickerStore(e => e.setPicker);
    const milestones = useWatch({
        control,
        name: 'milestones'
    });
    const { channel } = useAppContext();

    if (!userId || !channel || !milestones || milestones.length === 0 || index < 0 || index > milestones.length - 1) return null;

    const { milestone, assignees } = milestones[index];

    const clearDeadline = () => {
        setValue(`milestones.${index}.milestone.deadline`, null);
    };

    const fixTaskAssigneeee = (ids: string[]) => {
        if (ids.length === 0) return;
        const taskAssignee = getValues('assignees');
        const taskAssigneeSet = new Set(taskAssignee.map(e => e.user_id));
        ids.forEach(e => taskAssigneeSet.add(e));
        setValue('assignees', Array.from(taskAssigneeSet.values()).map(e => ({ user_id: e })));
    };


    const pickAssignee = (value: NonNullable<TaskAttachmentInsertInputType['milestones']>[number]['assignees']) => {
        setPicker(
            Object.keys(members),
            (ids) => {
                const newAssignees = ids.map((id) => ({ user_id: id }));
                setValue(`milestones.${index}.assignees`, newAssignees);
                fixTaskAssigneeee(ids);

            },
            value?.map(v => v.user_id) ?? []
        );

        router.push(`channel-list/channel/${channel.cid}/(pick-assignee)`);
    };

    const clearAssignee = () => {
        setValue(`milestones.${index}.assignees`, null);
    };

    const hasDeadlineOrAssignee = () => {
        return milestone.deadline || (assignees && assignees?.length > 0);
    };

    const DeadlineControl = () => (
        <Controller
            control={control}
            name={`milestones.${index}.milestone.deadline`}
            render={({ field: { onChange, value } }) => (
                <XStack gap='$2' f={1}>
                    <DateTimePicker value={value} setValue={onChange}>
                        <Button size="$3" icon={CalendarClock} f={1}>
                            {value ? formatDeadline(value) : 'Deadline'}
                        </Button>
                    </DateTimePicker>
                    {value && (
                        <Button size="$3" icon={CalendarClock} onPress={clearDeadline} bg='$red11' color={'white'}>
                            Clear
                        </Button>
                    )}
                </XStack>
            )}
        />
    );

    const AssigneeControl = () => (
        <Controller
            control={control}
            name={`milestones.${index}.assignees`}
            render={({ field: { onChange, value } }) => {
                const [name, setName] = useState('');
                useEffect(() => {
                    const loadName = async () => {
                        if (value && value.length > 0) {
                            try {
                                const profile = await fetchUserProfile(value[0].user_id);
                                setName(profile.name ?? 'Unknown');
                            } catch (e) {
                                setName('Unknown');
                            }
                        }
                    };
                    loadName();
                }, [value]);

                const hasAssignee = value && value.length > 0;
                return (
                    <XStack gap='$2' f={1} >
                        <Button size="$3" icon={UserPlus} onPress={() => pickAssignee(value)} f={1} >
                            {hasAssignee
                                ? (
                                    <>
                                        <Text fs={1} numberOfLines={1}>{name}</Text>
                                        {value.length === 1 ? (
                                            <Text> is selected</Text>
                                        ) : (
                                            <Text numberOfLines={1}>+{value.length - 1} more</Text>
                                        )}
                                    </>
                                )
                                : (
                                    <Text>Assignee</Text>
                                )}
                        </Button>
                        {hasAssignee && (
                            <Button size="$3" icon={UserPlus} onPress={clearAssignee} bg='$red11' color={'white'}>
                                Clear
                            </Button>
                        )}
                    </XStack>
                );
            }}
        />
    );

    return (
        <>
            <XStack>
                <View f={7}>
                    <ControlledField
                        control={control}
                        name={`milestones.${index}.milestone.description`}
                        maxLength={200}
                    >
                        {({ value, onChangeText, onBlur, onFocus }) => (
                            <TextArea
                                maxLength={200}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                onChangeText={onChangeText}
                                value={value ?? ''}
                                placeholder="Milestone description (optional)"
                                bg="$colorTransparent"
                                bw={0}
                                p={0}
                                disabled={readOnly}
                            />
                        )}
                    </ControlledField>
                    <View mt="$4" gap="$3" fd={hasDeadlineOrAssignee() ? 'column' : 'row'} w='100%'>
                        {!readOnly && <DeadlineControl />}
                        {!defaultAssignee && !readOnly && <AssigneeControl />}
                    </View>
                </View>
                <View f={1} /></XStack>
        </>
    );
};
