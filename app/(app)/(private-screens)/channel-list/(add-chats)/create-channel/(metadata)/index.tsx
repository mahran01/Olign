import { Header } from '@/components';
import { useAppContext } from '@/contexts';
import { useAuthStore } from '@/stores';
import { supabase } from '@/utils';
import { Check, ImagePlus } from '@tamagui/lucide-icons';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useContext, useEffect, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { Keyboard } from 'react-native';
import rnuuid from 'react-native-uuid';
import { ChatContext } from 'stream-chat-expo';
import { Button, Form, Image, Input, Text, TextArea, useTheme, View, XStack, YStack } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

type FormData = {
    title: string;
    description?: string;
};

interface ICreateChannelProps { }

const CreateChannel: React.FC<ICreateChannelProps> = () => {

    const { members } = useLocalSearchParams();

    const selectedMembers = members ? JSON.parse(decodeURIComponent(members as string)) as string[] : [];

    const router = useRouter();
    const theme = useTheme();
    const session = useAuthStore.getState().session;
    const { client } = useContext(ChatContext);
    const { setChannel } = useAppContext();
    const [channelImageUri, setChannelImageUri] = useState<string | null>(null);
    const [pendingImage, setPendingImage] = useState<{
        uri: string;
        base64: string;
        filename: string;
    } | null>(null);

    const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off');
    const { control, handleSubmit } = useForm<FormData>({
        defaultValues: { title: '', description: '' },
    });


    const CustomInput = ({ type, maxLength, name, control, placeholder, rules, ...props }: any) => {
        const { field, fieldState } = useController({ control, defaultValue: '', name, rules });
        const [shake, setShake] = useState(false);

        useEffect(() => {
            if (fieldState.error) {
                setShake(true);
                setTimeout(() => setShake(false), 100);
            }
        }, [fieldState.error]);

        return (
            <MotiView style={{ flex: 1 }} animate={{ translateX: shake ? [-10, 10, -10, 10, 0] : 0 }} transition={{ type: 'spring', damping: 4 }}>
                {type && (type as string).toLowerCase() === 'textarea' ? (
                    <TextArea
                        maxLength={maxLength}
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder={placeholder}
                        {...props}
                    />
                )
                    : (
                        <Input
                            maxLength={maxLength}
                            value={field.value}
                            onChangeText={field.onChange}
                            placeholder={placeholder}
                            {...props}
                            numberOfLines={1} // optional for native compatibility
                            f={1}
                            ellipsizeMode="tail"

                        />
                    )}
                {fieldState.error && (
                    <Text color="red" fontSize="$2" mt="$1">
                        {fieldState.error.message}
                    </Text>
                )}
            </MotiView>
        );
    };

    const pickImageOnly = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            if (asset.base64) {
                setPendingImage({
                    uri: asset.uri,              // for displaying the image in <Image />
                    base64: asset.base64,        // for uploading later
                    filename: asset.fileName ?? `temp-${Date.now()}.png`
                });
            }
            return {
                uri: asset.uri,              // for displaying the image in <Image />
                base64: asset.base64,        // for uploading later
                filename: asset.fileName ?? `temp-${Date.now()}.png`
            };
        }

        return null;
    };

    const uploadPendingImage = async (uuid: string) => {
        if (!pendingImage || !session?.user.id) return;

        const fileName = `public/channel-${uuid}.png`;

        const { data, error } = await supabase
            .storage
            .from('avatars')
            .upload(fileName, decode(pendingImage.base64), {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) {
            throw new Error(`Error uploading image: ${error.message}`);
        }

        const { data: publicUrlData } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(fileName);

        if (publicUrlData) {
            setChannelImageUri(`${publicUrlData.publicUrl}?timestamp=${Date.now()}`);
            return `${publicUrlData.publicUrl}?timestamp=${Date.now()}`;
        }
        else {
            throw new Error('Failed to get public URL for uploaded image');
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!session?.user.id) return;

        setStatus('submitting');
        const uuid = rnuuid.v4();

        try {
            const newUri = await uploadPendingImage(uuid);
            console.log('submitting 2');

            const channel = client.channel("messaging", uuid, {
                name: data.title,
                image: newUri,
                members: selectedMembers,
                description: data.description,
                is_group: true,
            });
            await channel.create();
            await channel.watch();
            setChannel(channel);
            router.replace(`/channel-list/channel/${channel.cid}`);

            setTimeout(() => setStatus('submitted'), 1000);
        }
        catch (error) {
            console.log("Error creating channel: ", error);
            setStatus('off');
        }
    };

    const makeHeader = () => (
        <Header color={theme.background.val} backButton={true} title='Create Channel' />
    );

    return (
        <LinearGradient colors={['$color1', '$color2']} start={[0, 0]} end={[0, 2]} flex={1} h={1000} w='100%' onPress={() => Keyboard.dismiss()}>
            <Stack.Screen options={{ header: makeHeader }} />
            <YStack f={1} w='100%'>
                <Form onSubmit={handleSubmit(onSubmit)} h='100%'>
                    <YStack gap='$2' h='100%' py='$2' px='$5'>
                        <XStack ai='center' w='100%'>
                            <Button circular mr='$3' size='$6' theme='accent' onPress={pickImageOnly} ov='hidden'>
                                <Button.Icon>
                                    {pendingImage ? (
                                        <Image
                                            source={{ uri: pendingImage.uri }}
                                            style={{ width: 100, height: 100, borderRadius: 10 }}
                                        />
                                    ) : <ImagePlus size='$2' />
                                    }
                                </Button.Icon>
                            </Button>
                            <View w='100%' f={1} h='100%'>
                                <CustomInput
                                    name='title'
                                    control={control}
                                    placeholder='Channel name'
                                    rules={{
                                        required: 'Channel name is required',
                                        maxLength: {
                                            value: 30,
                                            message: 'Channel name cannot exceed 30 characters',
                                        }
                                    }}
                                    maxLength={30}
                                    autoFocusadfad
                                    fow='900'
                                    bg='$colorTransparent'
                                    bw={0}
                                    fos='$8'
                                    px={0}
                                />
                            </View>
                        </XStack>
                        <CustomInput
                            type='textArea'
                            name='description'
                            control={control}
                            placeholder='Channel description (optional)'
                            rules={{
                                maxLength: {
                                    value: 300,
                                    message: 'Channel name cannot exceed 300 characters',
                                }
                            }}
                            maxLength={300}
                            bg='$colorTransparent'
                            bw={0}
                            px={0}
                            mt='$3'
                            p='$2'
                            textAlignVertical="top"
                            mih='$19'
                        />
                    </YStack>
                    <Form.Trigger asChild disabled={status !== 'off'} >
                        <Button onPress={handleSubmit(onSubmit)} pos='absolute' b='$5' r='$5' size='$6' circular theme='accent'>
                            <Button.Icon>
                                <Check size='$2' />
                            </Button.Icon>
                        </Button>
                    </Form.Trigger>
                </Form>
            </YStack >
        </LinearGradient >
    );
};

export default CreateChannel;
