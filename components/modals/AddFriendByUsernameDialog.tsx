import React from "react";
import { Dialog, Button, Input, Unspaced, XStack } from "tamagui";
import { X } from "@tamagui/lucide-icons";
import { useAuthContext, useUserContext } from "@/contexts";
import { useFriendStore } from "@/stores";
import { UserPublicProfileType } from "@/models";
import { supabase } from "@/utils/supabase";
import { Keyboard } from "react-native";

interface AddFriendByUsernameDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const AddFriendByUsernameDialog: React.FC<AddFriendByUsernameDialogProps> = ({ open, setOpen }) => {
    const inputRef = React.useRef<any>(null);

    const { getUserIdByUsername } = useUserContext();
    const { sendFriendRequest } = useFriendStore();
    const { session } = useAuthContext();

    const [username, setUsername] = React.useState("");

    React.useEffect(() => {
        if (open) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            Keyboard.dismiss();
        }
    }, [open]);

    const handleClose = () => {
        // Keyboard.dismiss();
        setOpen(false);
    };

    const getUserPublicProfile = async (id: string) => {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('name, username, avatar_uri')
            .eq('user_id', id)
            .single();

        if (error || !data) {
            console.error("Error fetching user profile:", error);
            return null;
        }

        return { username: data.username, name: data.name, avatarUri: data.avatar_uri };
    };

    const handleAddFriendByUsername = async () => {
        console.log(username);

        const id = await getUserIdByUsername(username);

        console.log("User ID: ", id);
        if (!id) {
            console.error("User not found");
            return;
        }
        const publicProfile = await getUserPublicProfile(id);
        console.log("User Profile: ", publicProfile);
        if (!publicProfile) {
            console.error("User Profile not found");
            return;
        }

        await sendFriendRequest(id, publicProfile, session);
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
                    onPress={handleClose}
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
                    onPress={() => {
                        Keyboard.dismiss();
                    }}
                >
                    <Dialog.Title>Add by Username</Dialog.Title>
                    <Dialog.Description>
                        Enter the username of your friend
                    </Dialog.Description>
                    <Input ref={inputRef} id="name" placeholder="username" onChangeText={setUsername} autoFocus={false} />
                    <Unspaced>
                        <Dialog.Close bg='$background' asChild>
                            <Button
                                pos="absolute"
                                t="$3"
                                r="$3"
                                circular
                                icon={<X size='$1' />}
                                onPress={handleClose}
                            />
                        </Dialog.Close>
                    </Unspaced>

                    <XStack alignSelf="flex-end" gap="$4">
                        <Dialog.Close asChild>
                            <Button aria-label="Cancel" onPress={handleClose}>
                                Cancel
                            </Button>
                        </Dialog.Close>

                        <Dialog.Close asChild>
                            <Button
                                theme="accent"
                                aria-label="Send Friend Request"
                                onPress={async () => {
                                    await handleAddFriendByUsername();
                                    handleClose();
                                }}
                                disabled={!username.trim()}
                            >
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
