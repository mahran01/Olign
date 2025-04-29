import { useAppContext } from "@/contexts";
import { CalendarArrowUp, Paperclip, PlusCircle } from "@tamagui/lucide-icons";
import { MessageInput, useMessageInputContext } from "stream-chat-expo";
import { Button, ListItem, Popover, PopoverProps, YGroup } from "tamagui";

export const CustomMessageInput = () => {
    const { channel } = useAppContext();

    const { toggleAttachmentPicker } = useMessageInputContext();

    const MoreOptionsPopover = ({ Icon, Name, ...props }: PopoverProps & { Icon?: any; Name?: string; }) => {
        return (
            <Popover allowFlip stayInFrame offset={15} resize {...props} >
                <Popover.Trigger asChild style={{ aspectRatio: '1/1' }} >
                    <Button icon={Icon} bg='$background0' />
                </Popover.Trigger>

                {/* {shouldAdapt && (
                    <Adapt when={shouldAdapt} platform="touch">
                        <Popover.Sheet animation="medium" modal dismissOnSnapToBottom>
                            <Popover.Sheet.Frame padding="$4">
                                <Adapt.Contents />
                            </Popover.Sheet.Frame>
                            <Popover.Sheet.Overlay
                                backgroundColor="$shadowColor"
                                animation="lazy"
                                enterStyle={{ opacity: 0 }}
                                exitStyle={{ opacity: 0 }}
                            />
                        </Popover.Sheet>
                    </Adapt>
                )} */}

                <Popover.Content
                    padding={0} margin={0}
                    borderWidth={1}
                    borderColor="$borderColor"
                    width='$13'
                    enterStyle={{ y: -10, opacity: 0 }}
                    exitStyle={{ y: -10, opacity: 0 }}
                    // elevate
                    animation={[
                        'quick',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                >
                    <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

                    <Popover.Close asChild>
                        <YGroup>
                            <YGroup.Item>
                                <ListItem
                                    icon={<Paperclip />}
                                    title='Upload files'
                                    onPress={toggleAttachmentPicker}
                                />
                            </YGroup.Item>
                            <YGroup.Item>
                                <ListItem
                                    icon={<CalendarArrowUp />}
                                    title='Send a task'
                                />
                            </YGroup.Item>
                        </YGroup>
                    </Popover.Close>

                </Popover.Content >
            </Popover >
        );
    };

    const sendTask = async () => {
        console.log('Sending task');

        if (channel) {
            const data = await channel.sendMessage({
                text: "Task created",
                attachments: [
                    {
                        type: "task",
                        id: Date.now().toString(),
                        created_at: new Date().toISOString(),
                        completed: false,
                        title: "New Task",
                        description: "Task description here",
                        assignees: [],
                    },
                ],
            });
            console.log('Data: ' + data.toString());
        } else {
            console.error("Something went wrong.");
        }
    };

    return (
        <MessageInput
            InputButtons={() => (
                <MoreOptionsPopover
                    placement='top-start'
                    Icon={<PlusCircle size='$2' color='$color10' />}
                    Name="POPOVER"
                />
            )}
        />
    );
};;
