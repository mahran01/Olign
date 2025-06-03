import React from "react";
import { Dialog, Button, Input, Unspaced, XStack } from "tamagui";
import { X } from "@tamagui/lucide-icons";
import { useUserContext } from "@/contexts";
// import { useAuthContext, useUserContext } from "@/contexts";
import { useAuthStore, useFriendStore } from "@/stores";
import { UserPublicProfileType } from "@/models";
import { supabase } from "@/utils/supabase";
import { Keyboard } from "react-native";

interface AddFriendByUsernameDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    message?: string;
    onConfirm: () => void;
    onConfirmDisabled?: boolean;
}

const YesOrNoDialog: React.FC<AddFriendByUsernameDialogProps> = ({
    open, setOpen, title, message: description, onConfirm, onConfirmDisabled = false
}) => {

    React.useEffect(() => {
        if (!open) {
            Keyboard.dismiss();
        }
    }, [open]);

    const handleClose = () => {
        setOpen(false);
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
                    <Dialog.Title>{title}</Dialog.Title>
                    <Dialog.Description>{description}</Dialog.Description>
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
                                aria-label="Confirm"
                                onPress={onConfirm}
                                disabled={onConfirmDisabled}
                            >
                                Confirm
                            </Button>
                        </Dialog.Close>
                    </XStack>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};

export default YesOrNoDialog;
