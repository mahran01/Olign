import React, { useState } from 'react';
import { Text, Separator, ListItem } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';
import { MilestoneAccordion } from './MilestoneAccordion';
import { TaskAttachmentInsertInputType } from '@/schemas';
import YesOrNoDialog from '../modals/YesOrNoDialog';
import { Control, useFieldArray, useForm, useFormContext, UseFormGetValues, UseFormResetField, UseFormSetValue, useFormState, UseFormUnregister, useWatch } from 'react-hook-form';
import { Keyboard } from 'react-native';

import rnuuid from 'react-native-uuid';

export const MilestoneSection = ({
    control,
    getValues,
    setValue,
    members,
    accordionState,
    unregister,
    resetField,
    defaultAssignee,
    readOnly
}: {
    control: Control<TaskAttachmentInsertInputType>;
    getValues: UseFormGetValues<TaskAttachmentInsertInputType>;
    setValue: UseFormSetValue<TaskAttachmentInsertInputType>;
    members: Record<string, any>;
    accordionState: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>];
    unregister: UseFormUnregister<TaskAttachmentInsertInputType>;
    resetField: UseFormResetField<TaskAttachmentInsertInputType>;
    defaultAssignee?: string;
    readOnly?: boolean;
}) => {

    const [_, setExpandedId] = accordionState;

    const watchedMilestones = useWatch({
        control,
        name: 'milestones'
    });

    const milestoneField = useFieldArray({
        control,
        name: 'milestones'
    });

    const addMilestone = () => {
        const temp_id = rnuuid.v4();
        const newMilestone = {
            title: '',
            description: '',
        };

        milestoneField.append({
            temporary_id: temp_id,
            milestone: newMilestone,
            assignees: defaultAssignee ? [{ user_id: defaultAssignee }] : undefined
        });
        setExpandedId(temp_id);
    };
    return (
        <>
            <Text px="$5" my="$2" fow="700" color="$color9">
                Milestone(s)
            </Text>
            {milestoneField.fields.length > 0 && (
                <MilestoneAccordion
                    control={control}
                    getValues={getValues}
                    setValue={setValue}
                    members={members}
                    accordionState={accordionState}
                    unregister={unregister}
                    resetField={resetField}
                    defaultAssignee={defaultAssignee}
                    readOnly={readOnly}
                />)}
            {!readOnly && (
                <>
                    <Separator mt="$2" mb={0} />
                    <ListItem
                        bg="$colorTransparent"
                        px="$5"
                        py="$4"
                        title={<Text fow="700" color="$color9" fos="$5">Add Milestone</Text>}
                        iconAfter={<Plus size="$2" />}
                        onPress={addMilestone}
                        hoverTheme
                        pressTheme
                    />
                    <Separator mb='$2' /></>
            )}
        </>
    );
};