import React, { Dispatch, SetStateAction, useState } from "react";
import { Channel } from "stream-chat";
import { DefaultStreamChatGenerics, MessageType } from 'stream-chat-expo';

interface iAppContextProps {
    channel: Channel | null;
    setChannel: Dispatch<SetStateAction<Channel | null>>;
    thread: MessageType | null;
    setThread: Dispatch<SetStateAction<MessageType<DefaultStreamChatGenerics> | null>>;
}

export const AppContext = React.createContext<iAppContextProps>({
    channel: null,
    setChannel: () => { },
    thread: null,
    setThread: () => { },
});

export const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [channel, setChannel] = useState<Channel | null>(null);
    const [thread, setThread] = useState<MessageType | null>(null);

    return (
        <AppContext.Provider value={{ channel, setChannel, thread, setThread }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AuthProvider');
    }
    return context;
};