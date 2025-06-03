import { useAppContext } from "@/contexts";
import { TaskAttachmentType } from "@/models";
import { CalendarArrowUp, Paperclip, PlusCircle } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { MessageInput, useMessageInputContext } from "stream-chat-expo";
import { Button, ListItem, Popover, PopoverProps, YGroup } from "tamagui";
import MoreOptionsPopover from "../shared/MoreOptionsPopover";

export const CustomMessageInput = () => {
    const { channel } = useAppContext();
    const router = useRouter();

    const { toggleAttachmentPicker } = useMessageInputContext();

    const MoreOptionsPopover = ({ Icon, ...props }: PopoverProps & { Icon?: any; }) => {
        return (
            <Popover size="$5" allowFlip stayInFrame offset={15} resize {...props} >
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
                    <Popover.Arrow bg='$color2' borderWidth={1} borderColor="$borderColor" />

                    <Popover.Close asChild>
                        <YGroup p={0}>
                            <YGroup.Item>

                                <ListItem
                                    icon={<Paperclip />}
                                    title='Upload files'
                                    onPress={toggleAttachmentPicker}
                                >
                                    <Popover.Close />
                                </ListItem>
                            </YGroup.Item>
                            <YGroup.Item>
                                <Popover.Close asChild flexDirection="row">
                                    <ListItem
                                        icon={<CalendarArrowUp />}
                                        title='Send a task'
                                        onPress={() => {
                                            if (channel) {
                                                router.push(`channel-list/channel/${channel.cid}/(task-maker)`);
                                            }
                                        }}
                                    >
                                    </ListItem>
                                </Popover.Close>
                            </YGroup.Item>
                        </YGroup>
                    </Popover.Close>
                </Popover.Content >
            </Popover >
        );
    };

    // const MoreOptionsMenu = () => {
    //     const { channel } = useAppContext();
    //     const router = useRouter();
    //     const { openAttachmentPicker } = useMessageInputContext();

    //     return (
    //         <MoreOptionsPopover
    //             placement='top'
    //             Icon={<PlusCircle size='$2' color='$color10' />}
    //             showArrow
    //         >
    //             <YGroup.Item>

    //                 <ListItem
    //                     icon={<Paperclip />}
    //                     title='Upload files'
    //                     onPress={toggleAttachmentPicker}
    //                 >
    //                     <Popover.Close />
    //                 </ListItem>
    //             </YGroup.Item>
    //             <YGroup.Item>
    //                 <Popover.Close asChild flexDirection="row">
    //                     <ListItem
    //                         icon={<CalendarArrowUp />}
    //                         title='Send a task'
    //                         onPress={() => {
    //                             if (channel) {
    //                                 router.push(`channel-list/channel/${channel.cid}/(task-maker)`);
    //                             }
    //                         }}
    //                     >
    //                     </ListItem>
    //                 </Popover.Close>
    //             </YGroup.Item>
    //         </MoreOptionsPopover>
    //     );
    // };

    return (
        <MessageInput
            InputButtons={() => (
                <MoreOptionsPopover
                    placement='top-start'
                    Icon={<PlusCircle size='$2' color='$color10' />}
                />
            )}
        />
    );
};;
