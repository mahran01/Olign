import { AssigneeSection, ControlledField, DateTimePicker, Header, MilestoneSection } from '@/components';
import { AppContext } from '@/contexts';
import { TaskAttachmentFetchSchema, TaskAttachmentInsertInputSchema, TaskAttachmentInsertInputType } from '@/schemas';
import { insertTaskWithRelatedData } from '@/services';
import { useAuthStore, useTaskStore } from '@/stores';
import { formatDeadline, validate } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, SendHorizontal } from '@tamagui/lucide-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Keyboard, SafeAreaView } from 'react-native';
import rnuuid from 'react-native-uuid';
import { Button, Form, Input, ScrollView, Separator, Text, TextArea, useTheme, View, XStack, YStack } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';
import { useLocalSearchParams } from "expo-router";
import { normalizeFetchedAttachment } from '@/schemas/task.schema';

interface ITaskMakerProps {
}

const TaskMaker: React.FC<ITaskMakerProps> = (props) => {


    const param = useLocalSearchParams();
    const router = useRouter();
    const theme = useTheme();
    const session = useAuthStore(e => e.session);
    let { channel } = useContext(AppContext);
    const [expandedId, setExpandedId] = useState<string | undefined>();
    const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off');
    const [selectedAssignee, setSelectedAssignee] = useState<Set<string>>(new Set<string>());
    const [defaultAssignee, setDefaultAssignee] = useState<string>();
    const createTask = useTaskStore(e => e.createTask);

    const loading = () => (
        <SafeAreaView>
            <Text>Loading...</Text>
        </SafeAreaView>
    );

    if (!channel || !session) return loading();

    const testValue = {
        task: {
            title: "",
            description: "",
            // TODO: add priority
            // priority: "medium",
            deadline: new Date(),
            creator_id: session.user.id,
            completed: false,
        },
        // TODO: add tags
        // tags: [],
        assignees: [
            { "user_id": "c9330db9-aad3-417e-a596-c84927fdd283", "completed": false }
        ],
        milestones: [
            {
                "temporary_id": rnuuid.v4(),
                "milestone": {
                    "title": "WireframesWireframesWireframesWireframesWireframesWireframes",
                    "description": "Sketch basic wireframes",
                    "completed": false,
                    "deadline": new Date(),
                },
                "assignees": [
                    { "user_id": "c9330db9-aad3-417e-a596-c84927fdd283", "completed": false }
                ]
            },
            {
                "temporary_id": rnuuid.v4(),
                "milestone": {
                    "title": "High-Fidelity Mockups",
                    "description": "Design polished UI screens",
                    "completed": false,
                }
            }
        ],
    };

    const getParamIfExist = () => {
        try {
            if (param?.taskAttachment && param?.readOnly) {
                const taskAttachment = param.taskAttachment;
                const attachmentStr = Array.isArray(taskAttachment) ? taskAttachment[0] : taskAttachment;
                const parsedAttachment = attachmentStr ? JSON.parse(attachmentStr) : null;
                const validated = validate(TaskAttachmentFetchSchema, parsedAttachment);
                const transformed = normalizeFetchedAttachment(validated);

                const readOnly = param.readOnly;
                const readOnlyStr = Array.isArray(readOnly) ? readOnly[0] : readOnly;
                const parsedReadOnly = readOnlyStr ? JSON.parse(readOnlyStr) as boolean : null;

                return { taskAttachment: transformed, readOnly: parsedReadOnly };
            }

        }
        catch (e: any) {
            console.log(e);
        }
    };

    const defaultValues: TaskAttachmentInsertInputType = getParamIfExist()?.taskAttachment ?? {
        // TODO: add priority, recurrence, tags
        task: {
            title: "",
            description: "",
            creator_id: session.user.id,
        },
        assignees: [],
    };

    const [date, setDate] = useState<Date | null>(defaultValues.task.deadline ?? null);
    const [time, setTime] = useState<Date | null>(defaultValues.task.deadline ?? null);
    const [datetime, setDatetime] = useState<Date | null>(defaultValues.task.deadline ?? null);

    const { control, handleSubmit, getValues, getFieldState, setValue, watch, unregister, resetField, reset } = useForm<TaskAttachmentInsertInputType>({
        resolver: zodResolver(TaskAttachmentInsertInputSchema),
        defaultValues: defaultValues
    });

    const [watchedAssignees] = watch(['assignees']);
    const readOnly = (getParamIfExist()?.readOnly) ?? false;

    const assigneeField = useFieldArray({
        control,
        name: 'assignees'
    });

    const members = channel.state.members;
    const myId = session.user.id;
    const numberOfMember = Object.keys(members).length;
    let channelType: 'direct' | 'group' | 'private' | 'invalid' =
        channel.data?.is_direct ? 'direct' :
            channel.data?.is_group ? 'group' :
                channel.data?.is_private ? 'private' :
                    'invalid';

    if (channelType === 'invalid') return loading();

    // TODO: Fix group check because group aren't necessarily have more than 2 members
    useEffect(() => {
        if (!(myId in members)) {
            return;
        }
        if (numberOfMember === 1) {
            setSelectedAssignee(new Set([myId]));
            setValue('assignees', [{ user_id: myId }]);
            setDefaultAssignee(myId);
            return;
        }
        if (numberOfMember === 2 && channelType === 'direct') {
            const selectedMember = Object.keys(members).find(m => m !== myId);
            if (!selectedMember) return; //! Shouldn't reach
            setSelectedAssignee(new Set([selectedMember]));
            setValue('assignees', [{ user_id: selectedMember }]);
            setDefaultAssignee(selectedMember);
            return;
        }
    }, [channel, session]);

    useEffect(() => {
        console.log(defaultAssignee);
        if (date && time) {

            setDatetime(() => {
                const combinedDate = new Date(date);
                combinedDate.setHours(time.getHours(), time.getMinutes());
                return combinedDate;
            });
        }

        else if (date) {

            setDatetime(() => {
                const combinedDate = new Date(date);
                combinedDate.setHours(time?.getHours() ?? 0, time?.getMinutes());
                return combinedDate;
            });
        }

        else if (time) {

            setDatetime(() => {
                const combinedDate = new Date();
                combinedDate.setHours(time?.getHours() ?? 0, time?.getMinutes());
                return combinedDate;
            });
        }

        else {
            setDatetime(null);
        }

        setValue('task.deadline', datetime);
    }, [date, time]);

    const onSubmit = async (data: TaskAttachmentInsertInputType) => {
        try {
            await createTask(data, channel);
            router.back();
            reset();
        }
        catch (err: any) {
            console.warn(err.message);
        }
    };

    const getDeadline = () => getValues('task.deadline');

    const makeHeader = () => {
        const color = theme.background.val;

        return (
            <Header
                color={color}
                backButton={true}
                title={readOnly ? 'View Task' : 'Create Task'}
            />
        );
    };
    const HeaderSection = () => (
        <YStack px='$5'>
            <ControlledField
                control={control}
                name='task.title'
                maxLength={50}
            >
                {({ value, onChangeText, onBlur, onFocus }) => (
                    <Input
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onChangeText={onChangeText}
                        value={value}
                        placeholder='Task name'
                        fow='900'
                        bg='$colorTransparent'
                        bw={0}
                        fos='$8'
                        px={0}
                        maxLength={50}
                        disabled={readOnly}
                    />
                )}
            </ControlledField>
            <ControlledField
                control={control}
                name='task.description'
                maxLength={200}
            >
                {({ value, onChangeText, onBlur, onFocus }) => {
                    if (readOnly && (!value || value.length === 0))
                        return <></>;
                    return (
                        <TextArea
                            onBlur={onBlur}
                            onChangeText={onChangeText}
                            onFocus={onFocus}
                            value={value ?? ''}
                            placeholder='Task description (optional)'
                            bg='$colorTransparent'
                            bw={0}
                            px={0}
                            pb='$2'
                            maxLength={200}
                            disabled={readOnly}
                        />
                    );
                }}
            </ControlledField>
        </YStack>
    );
    const DeadlineSection = () => (
        <YStack px='$5' >
            <Text my='$2' fow='700' color='$color9'>Deadline</Text>
            <XStack w='100%' display='flex' gap='$3'>
                <Controller
                    control={control}
                    name='task.deadline'
                    render={({ field: { value } }) => {
                        return (
                            <>
                                <DateTimePicker value={date} setValue={setDate} mode='date'
                                    disabled={readOnly}>
                                    <Button
                                        icon={Calendar}
                                        pl={0}
                                        f={1}
                                        br={0}
                                        jc='flex-start'
                                        btw={0} blw={0} brw={0}
                                        bbw='$1'
                                        variant='outlined'
                                        bc='$accent6'
                                        disabled={readOnly}
                                    >
                                        <Text>{value ? formatDeadline(value, 'longDate') : 'Select Date'}</Text>
                                    </Button>
                                </DateTimePicker>
                                <DateTimePicker value={time} setValue={setTime} mode='time'
                                    disabled={readOnly}>
                                    <Button
                                        bg='$colorTransparent'
                                        iconAfter={Clock}
                                        br={0}
                                        btw={0} blw={0} brw={0}
                                        bbw='$1'
                                        variant='outlined'
                                        bc='$accent6'
                                        disabled={readOnly}
                                    >
                                        <Text>{value ? value.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Select Time'}</Text>
                                    </Button>
                                </DateTimePicker>
                            </>
                        );
                    }}
                />
            </XStack>
            {
                // TODO: Implement reapeat
            }
            {/* <ListItem
            px={0}
            bg='$colorTransparent'
            icon={RotateCcw}
            title={<Label fow="700" color="$color9">Repeat</Label>}
            iconAfter={
                <XStack ai='center'>
                    <Label fow="700" fos='$2' color="$color9">Once</Label>
                    <ChevronRight mt='$1.5' size='$1' color="$color9" />
                </XStack>
            }
            onPress={() => { }}
        /> */}
        </YStack>
    );
    const disableAssignee = () => {
        if (channelType === 'private' || channelType === 'direct') return true;
        if (numberOfMember < 2) return true;
        else return false;
    };
    return (
        <LinearGradient
            colors={['$color1', '$color2']}
            start={[0, 0]}
            end={[0, 2]}
            flex={1} h='100%' w='100%'
            onPress={() => {
                Keyboard.dismiss();
                setExpandedId(undefined);
            }}
        >
            <Stack.Screen options={{ header: makeHeader }} />
            <Form onSubmit={handleSubmit(onSubmit)} h='100%' disabled={readOnly}>
                <YStack h='100%' py='$2'>
                    <ScrollView>
                        <HeaderSection />
                        <Separator my='$2' />
                        <DeadlineSection />
                        <Separator mt='$4' mb='$2' />
                        {!disableAssignee() && (
                            <>
                                <AssigneeSection
                                    control={control}
                                    getValues={getValues}
                                    setValue={setValue}
                                    members={members}
                                    readOnly={readOnly}
                                />
                                <Separator mt='$4' mb='$2' />
                            </>
                        )}
                        <MilestoneSection
                            control={control}
                            getValues={getValues}
                            setValue={setValue}
                            members={members}
                            accordionState={[expandedId, setExpandedId]}
                            unregister={unregister}
                            resetField={resetField}
                            defaultAssignee={defaultAssignee}
                            readOnly={readOnly}
                        />
                        <View h='$20' />
                    </ScrollView>
                </YStack>

                {!readOnly && (
                    <Form.Trigger asChild disabled={status !== 'off'} >
                        <Button
                            onPress={handleSubmit(onSubmit, (err) => {
                                console.warn("Form validation failed", err);
                            })}
                            pos="absolute" b='$5' r='$5' size='$6' circular theme='accent'
                        >
                            <Button.Icon>
                                <SendHorizontal size='$2' />
                            </Button.Icon>
                        </Button>
                    </Form.Trigger>

                )}
            </Form>
        </LinearGradient >
    );
};

export default TaskMaker;
