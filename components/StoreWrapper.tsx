import { useAuthStore, useFriendStore, useProfileStore, useTaskStore } from '@/stores';
import { useToastController } from '@tamagui/toast';
import React, { useEffect } from 'react';
import { View } from 'tamagui';

interface IStoreWrapperProps {
}

const StoreWrapper: React.FC<React.PropsWithChildren<IStoreWrapperProps>> = ({ children }) => {
    const session = useAuthStore(s => s.session);
    const {
        toastMessage: friendToastMessage,
        resetToastMessage: resetFriendToastMessage,
        fetchAll: fetchAllFriends,
        subscribeToChanges: subscribeToFriendChanges,
    } = useFriendStore();

    const {
        toastMessage: taskToastMessage,
        resetToastMessage: resetTaskToastMessage,
        fetchAll: fetchAllTasks,
        subscribeToChanges: subscribeToTaskChanges,
    } = useTaskStore();

    const subscribeToProfileChanges = useProfileStore(e => e.subscribeToChanges);


    useEffect(() => {
        if (session) {

            // Friends
            fetchAllFriends();
            subscribeToFriendChanges();

            // Tasks
            fetchAllTasks();
            subscribeToTaskChanges();

            // Profiles
            subscribeToProfileChanges();
        }
    }, [session]);

    const toast = useToastController();

    useEffect(() => {
        if (friendToastMessage) {
            toast.show(friendToastMessage.title, { ...friendToastMessage });
            resetFriendToastMessage();
        }
        if (taskToastMessage) {
            toast.show(taskToastMessage.title, { ...taskToastMessage });
            resetTaskToastMessage();
        }
    }, [friendToastMessage, taskToastMessage]);

    return <>{children}</>;
};

export default StoreWrapper;
