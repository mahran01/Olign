import React from "react";
import { Dialog, Button, Input, Unspaced, XStack } from "tamagui";
import { X } from "@tamagui/lucide-icons";
import { useFriendContext, useUserContext } from "@/contexts";

interface AddFriendByUsernameDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const AddFriendByUsernameDialog: React.FC<AddFriendByUsernameDialogProps> = ({ open, setOpen }) => {

    const { handleAddFriend } = useFriendContext();
    const { getUserIdByUsername } = useUserContext();

    const handleAddFriendByUsername = async () => {
        const addFriend = async () => {
            const id = await getUserIdByUsername("m6mah_ran");
            if (id) handleAddFriend(id);
        };
        await addFriend();
    };

    return (
        <Dialog modal open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay
                    key="overlay"
                    backgroundColor="$shadow6"
                    animation="quick"
                    enterStyle={{ opacity: 0 }}
                    exitStyle={{ opacity: 0 }}
                    onPress={() => setOpen(false)} // Close on outside click
                />

                <Dialog.Content
                    miw={400}
                    bordered
                    elevate
                    key="content"
                    animateOnly={['transform', 'opacity']}
                    animation={[
                        'quicker',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                    enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                    exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                    gap="$5"
                >
                    <Dialog.Title>Add by Username</Dialog.Title>
                    <Dialog.Description>
                        Enter the username of your friend
                    </Dialog.Description>
                    <Input id="name" placeholder="username" />
                    <Unspaced>
                        <Dialog.Close asChild>
                            <Button
                                position="absolute"
                                top="$3"
                                right="$3"
                                size="$2"
                                circular
                                icon={X}
                                onPress={() => setOpen(false)}
                            />
                        </Dialog.Close>
                    </Unspaced>

                    <XStack alignSelf="flex-end" gap="$4">
                        <Dialog.Close asChild>
                            <Button aria-label="Cancel" onPress={() => setOpen(false)}>
                                Cancel
                            </Button>
                        </Dialog.Close>

                        <Dialog.Close asChild>
                            <Button theme="accent" aria-label="Send Friend Request" onPress={() => console.log('STAR')}>
                                Send Friend Request
                            </Button>
                        </Dialog.Close>
                    </XStack>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};

export default AddFriendByUsernameDialog;
