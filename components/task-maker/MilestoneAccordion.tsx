import React, { useEffect, useState } from 'react';
import { Accordion, Card, Text } from 'tamagui';
import { MilestonesIndices } from './MilestonesIndices';
import { CollapsedMilestone } from './CollapsedMilestone';
import { ExpandedMilestone } from './ExpandedMilestone';
import { TaskAttachmentInsertInputType } from '@/schemas';
import { Keyboard } from 'react-native';
import YesOrNoDialog from '../modals/YesOrNoDialog';
import { Control, SetFieldValue, useFieldArray, UseFormGetValues, UseFormResetField, UseFormSetValue, UseFormUnregister, useWatch } from 'react-hook-form';

export const MilestoneAccordion = ({
    control,
    getValues,
    setValue,
    members,
    accordionState: [expandedId, setExpandedId],
    unregister,
    resetField,
    defaultAssignee,
    readOnly
}: {
    control: Control<TaskAttachmentInsertInputType>;
    getValues: UseFormGetValues<TaskAttachmentInsertInputType>;
    setValue: UseFormSetValue<TaskAttachmentInsertInputType>;
    members: any;
    accordionState: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>];
    unregister: UseFormUnregister<TaskAttachmentInsertInputType>;
    resetField: UseFormResetField<TaskAttachmentInsertInputType>;
    defaultAssignee?: string;

    readOnly?: boolean;
}) => {
    const milestoneField = useFieldArray({
        control,
        name: 'milestones'
    });

    const watchedMilestones = useWatch({
        control,
        name: 'milestones'
    });

    const toggleExpand = (id: string) => {
        const sameExpand = expandedId === id;
        setExpandedId(sameExpand ? undefined : id);
    };

    const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);
    const [deleteMilestoneDialogOpen, setDeleteMilestoneDialogOpen] = useState<boolean>(false);

    const deleteMilestone = (id: string) => {
        setDeleteMilestoneId(id);
        Keyboard.dismiss();
        setDeleteMilestoneDialogOpen(true);
    };

    const confirmDelete = () => {
        if (deleteMilestoneId === null || !watchedMilestones) {
            return;
        }
        const filteredMilestone = getValues('milestones')?.filter((m) => m.temporary_id !== deleteMilestoneId);
        setValue('milestones', filteredMilestone);
        setDeleteMilestoneId(null);
    };

    if (!watchedMilestones || watchedMilestones.length <= 0) {
        return null;
    }

    return (
        <>
            <YesOrNoDialog
                open={deleteMilestoneDialogOpen}
                setOpen={setDeleteMilestoneDialogOpen}
                title='Confirm Delete Milestone?'
                message='Are you sure you want to delete this milestone?'
                onConfirm={confirmDelete}
            />
            <Accordion overflow="hidden" type="single" value={expandedId} collapsable collapsible>
                {watchedMilestones.map((milestone, index) => {
                    const isExpanded = expandedId === milestone.temporary_id;
                    if (!milestone.temporary_id) return;
                    return (
                        <Accordion.Item key={milestone.temporary_id} value={milestone.temporary_id}>
                            <MilestonesIndices index={index}>
                                <Card
                                    f={1}
                                    pressTheme
                                    hoverTheme
                                    overflow="hidden"
                                    onPress={() => toggleExpand(milestone.temporary_id)}
                                >
                                    <CollapsedMilestone
                                        index={index}
                                        disabled={!isExpanded}
                                        control={control}
                                        getValues={getValues}
                                        members={members}
                                        deleteMilestone={() => deleteMilestone(milestone.temporary_id)}
                                        defaultAssignee={defaultAssignee}
                                        readOnly={readOnly}
                                    >
                                        {isExpanded ? (
                                            <Accordion.HeightAnimator animation="medium">
                                                <Accordion.Content
                                                    animation="medium"
                                                    exitStyle={{ opacity: 0 }}
                                                    px="$3"
                                                    pt={0}
                                                    pb="$3"
                                                    overflow="hidden"
                                                    jc="space-between"
                                                >
                                                    <ExpandedMilestone
                                                        members={members}
                                                        index={index}
                                                        control={control}
                                                        getValues={getValues}
                                                        setValue={setValue}
                                                        defaultAssignee={defaultAssignee}
                                                        readOnly={readOnly}
                                                    />
                                                </Accordion.Content>
                                            </Accordion.HeightAnimator>
                                        ) : <></>}
                                    </CollapsedMilestone>
                                </Card>
                            </MilestonesIndices>
                        </Accordion.Item>
                    );
                })}
            </Accordion >
        </>
    );
};
