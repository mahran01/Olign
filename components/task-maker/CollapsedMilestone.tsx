import React, { useEffect, useState } from 'react';
import { XStack, View, Text, Input, Button, Separator } from 'tamagui';
import { X } from '@tamagui/lucide-icons';
import { ControlledField } from '../shared/ControlledField';
import { AvatarGroup } from '../shared/AvatarGroup';
import { TaskAttachmentInsertInputType } from '@/schemas';
import { Control, UseFormGetValues, useWatch } from 'react-hook-form';
import { formatDeadline } from '@/utils';

export const CollapsedMilestone = ({
    index,
    disabled,
    control,
    getValues,
    children,
    members,
    deleteMilestone,
    defaultAssignee,
    readOnly
}: {
    index: number;
    disabled: boolean;
    control: Control<TaskAttachmentInsertInputType>;
    getValues: UseFormGetValues<TaskAttachmentInsertInputType>;
    children: any;
    members: any;
    deleteMilestone: any;
    defaultAssignee?: string;

    readOnly?: boolean;
}) => {

    const milestones = useWatch({ control, name: 'milestones' });
    const deadline = useWatch({ control, name: `milestones.${index}.milestone.deadline` });
    const [pressed, setPressed] = useState<boolean>(false);

    const milestoneData = milestones?.[index];
    if (!milestoneData || !milestoneData.milestone) return null;

    const { milestone, assignees } = milestoneData;

    const users = assignees?.map(({ user_id }: { user_id: string; }) => ({
        name: members[user_id]?.user?.name ?? '?',
        imageUri: members[user_id]?.user?.image as string ?? undefined,
    }));

    const displayBottom = deadline || (assignees && assignees.length > 0 && !defaultAssignee);

    return (
        <>
            <XStack px="$3" py="$2" bg="$color2" overflow="hidden" minHeight="$4" jc="space-between" ai="center">
                <View flex={3} mr="$2">
                    <ControlledField
                        control={control}
                        name={`milestones.${index}.milestone.title`}
                        maxLength={50}
                    >
                        {({ value, onChangeText, onBlur, onFocus }) => (disabled || !pressed || readOnly) ? (
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                fow="900"
                                fos="$6"
                                px={0}
                                py="$2"
                                my={2}
                                onPress={disabled || readOnly ? undefined : () => setPressed(true)}
                                color={(!value || value === '') ? '$color9' : undefined}
                            >
                                {value || 'Milestone name'}
                            </Text>
                        ) : (
                            <Input
                                value={value}
                                onBlur={() => {
                                    setPressed(false);
                                    onBlur();
                                }}
                                onChangeText={onChangeText}
                                onFocus={onFocus}
                                autoFocus
                                placeholder="Milestone name"
                                fow="900"
                                bg="$colorTransparent"
                                bw={0}
                                fos="$6"
                                px={0}
                                py="$2"
                                maxLength={50}
                            />
                        )}
                    </ControlledField>
                </View>
                {!readOnly && (
                    <XStack flex={1} ai="center" jc="flex-end" gap="$2">
                        <Button circular icon={X} size="$2" onPress={() => deleteMilestone(index)} />
                    </XStack>
                )}
            </XStack>
            {children}
            {displayBottom && (
                <>
                    <Separator />
                    <XStack px="$3" py="$2" bg="$color2" overflow="hidden" minHeight="$4" jc="space-between" ai="center">
                        <View>
                            <Text>
                                {deadline
                                    ? formatDeadline(deadline)
                                    : 'No deadline'}
                            </Text>
                        </View>
                        {!defaultAssignee && (
                            <View>
                                {(users && users.length > 0) ? (
                                    <AvatarGroup users={users} size="very-small" overlap={10} />
                                ) : (
                                    <Text>Non Assigned</Text>
                                )}
                            </View>
                        )}
                    </XStack>
                </>
            )}
        </>
    );
};
