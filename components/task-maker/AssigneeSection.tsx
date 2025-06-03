import { HorizontalSelectedUserList } from '../shared/HorizontalSelectedUserList';
import { useAppContext } from '@/contexts';
import { TaskAttachmentInsertInputType } from '@/schemas';
import { useAssigneePickerStore, useAuthStore, useProfileStore } from '@/stores';
import { useRouter } from 'expo-router';
import React from 'react';
import { Control, Controller, useFieldArray, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form';
import { Text, View } from 'tamagui';

export const AssigneeSection = ({
    control,
    getValues,
    setValue,
    members,
    readOnly,
}: {
    control: Control<TaskAttachmentInsertInputType>;
    getValues: UseFormGetValues<TaskAttachmentInsertInputType>;
    setValue: UseFormSetValue<TaskAttachmentInsertInputType>;
    members: Record<string, any>;
    readOnly: boolean;
}) => {
    const fetchUserProfile = useProfileStore(e => e.fetchUserProfile);
    const userId = useAuthStore(e => e.session)?.user.id;
    const router = useRouter();
    const setPicker = useAssigneePickerStore(e => e.setPicker);
    const milestoneField = useFieldArray({
        control,
        name: 'milestones',
    });
    const milestones = useWatch({
        control,
        name: 'milestones'
    });
    const assignees = useWatch({
        control,
        name: 'assignees'
    });
    const { channel } = useAppContext();

    if (!userId || !channel) return null;

    const fixMilestoneAssigneeRemoved = (taskAssigneeIds: string[]) => {
        const allowedSet = new Set(taskAssigneeIds);

        milestones?.forEach((milestone, index) => {
            const filtered = (milestone.assignees ?? []).filter(assignee =>
                allowedSet.has(assignee.user_id)
            );

            setValue(
                `milestones.${index}.assignees`,
                filtered
            );
        });
    };

    const pickAssignee = (value: TaskAttachmentInsertInputType['assignees']) => {
        setPicker(
            Object.keys(members),
            (ids) => {
                const newAssignees = ids.map((id) => ({ user_id: id }));
                setValue(`assignees`, newAssignees);
                fixMilestoneAssigneeRemoved(ids);
            },
            value?.map(v => v.user_id) ?? []
        );

        router.push(`channel-list/channel/${channel.cid}/(pick-assignee)`);
    };

    return (
        <>
            <Text px='$5' my='$2' fow='700' color='$color9'>Assignee(s)</Text>
            <View px='$5' pt='$2'>
                <Controller
                    control={control}
                    name='assignees'
                    render={({ field: { value } }) => {
                        return (
                            <HorizontalSelectedUserList
                                selectedUserIds={assignees ? new Set(assignees.map(e => e.user_id)) : new Set()}
                                addButton
                                addButtonOnpress={() => pickAssignee(value)}
                                readOnly={readOnly}
                            />
                        );
                    }}
                />
            </View>
        </>
    );
};