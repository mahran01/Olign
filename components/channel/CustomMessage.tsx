import React from 'react';
import { Text, View } from 'react-native';
import { useMessageContext } from 'stream-chat-expo';

interface ICustomMessageProps {
}

const CustomMessage: React.FC<ICustomMessageProps> = (props) => {
  const { message, isMyMessage } = useMessageContext();

  return (
    <View style={{
      alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
      backgroundColor: isMyMessage ? '#ADD8E6' : '#ededed',
      padding: 10,
      margin: 10,
      borderRadius: 10,
      width: '70%',
    }}>
      <Text>{message.text}</Text>
    </View>
  );
};

export default CustomMessage;
