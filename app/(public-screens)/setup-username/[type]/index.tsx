import React, { useEffect, useState } from 'react';
import { buildTextInput as buildDefaultTextInput, Header } from '@/components';
import { AlertCircle, AtSign, CloudMoon, CloudSun, Pencil } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Avatar, Button, Form, Input, Spinner, useTheme, View, XGroup, Text, ScrollView, XStack } from 'tamagui';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase';
import { useAuthContext } from '@/contexts';
import { decode } from 'base64-arraybuffer';

type FormData = {
  username: string;
  name: string;
};

interface ISetupUsernameProps {
}

const SetupUsername: React.FC<ISetupUsernameProps> = (props) => {

  const theme = useTheme();
  const router = useRouter();
  const { session, signOut, setUserIsReady, updateUserData } = useAuthContext();

  const param = useLocalSearchParams<{
    type: string;
    username?: string;
    name?: string;
    avatarUri?: string;
  }>();

  if (param.type === 'update') {
    const userMetadata = session?.user.user_metadata;
    param.username = userMetadata?.username;
    param.name = userMetadata?.name;
    param.avatarUri = userMetadata?.avatar_uri;
  }

  const { control, handleSubmit, formState: { errors, dirtyFields }, watch, trigger, setValue } = useForm<FormData>({
    defaultValues: {
      username: param.username,
      name: param.name
    },
  });

  const [avatarUri, setAvatarUri] = useState(param.avatarUri || '');
  const [status, setStatus] = useState<'off' | 'submitting' | 'submitted' | 'error'>('off');
  const [usernameError, setUsernameError] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [dirtied, setDirtied] = useState<Record<keyof FormData, boolean>>({
    username: false,
    name: false
  });

  const { username, name } = watch();

  useEffect(() => {
    usernameError && setUsernameError('');
    dirtied.username && trigger('username');
  }, [username]);

  useEffect(() => {
    dirtied.username && trigger('username');
  }, [usernameError]);

  useEffect(() => {
    dirtied.name && trigger('name');
  }, [name]);

  const handleFocus = (fieldname: keyof FormData) => {
    if (!dirtied[fieldname]) {
      const newDirtied = { ...dirtied };
      newDirtied[fieldname] = true;
      setDirtied(newDirtied);
    }
  };

  const buildTextInput = (param: Omit<Parameters<typeof buildDefaultTextInput>[0], 'control' | 'handleFocus'>) =>
    buildDefaultTextInput({ control, handleFocus, ...param });
  const buttonInactive = Object.keys(errors).length > 0;

  const pickAvatar = async () => {
    console.log(param);
    console.log('PickAvatar');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
      const fileName = `public/avatar-${session?.user.id}.png`;

      const { data, error } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, decode(result.assets[0].base64!), {
          contentType: 'image/png',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading image:', error.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (publicUrlData) {
        setAvatarUri(`${publicUrlData.publicUrl}?timestamp=${Date.now()}`); // Set the avatarUri for form submission
      }
    }
  };

  const onSubmit = async ({ username, name }: any) => {
    setStatus('submitting');

    if (param.type === 'create') {
      const { data: insertData, error: insertError } = await supabase
        .from('user_profiles')
        .insert({ username, name, avatar_uri: avatarUri })
        .single();

      if (insertError) {
        if (insertError?.message.includes("duplicate key value")) {
          if (insertError?.message.includes("user_data_user_id_key")) {
            setErrorText('Something went wrong, please try again later');
          }
          else if (insertError?.message.includes("user_data_username_key")) {
            setUsernameError('Username is not available');
          }
        }
        setStatus('off');
        return;
      }
    }
    else if (param.type === 'update') {
      const { data: updatedData, error: updateError } = await supabase
        .from("user_profiles")
        .update({ username, name, avatar_uri: avatarUri })
        .eq("user_id", session?.user.id);

      if (updateError) {
        if (updateError?.message.includes("duplicate key value") && updateError?.message.includes("user_data_username_key")) {
          setUsernameError('Username is not available');
          setStatus('off');
          return;
        }
      }
    }
    const { error } = await supabase.functions.invoke('create-stream-user', {
      body: {
        userId: session?.user.id,
        name: name,
        username: username,
        avatar_uri: avatarUri,
      },
    });
    const { error: updateError } = await updateUserData({ username, name, avatar_uri: avatarUri });

    if (error || updateError) {
      console.log(error);
      return;
    }

    setSuccessText('Profile updated successfully!');
    if (!error && !updateError && param.type === 'create') {
      const { error } = await setUserIsReady(true);
      if (!error) {
        router.replace('/');
      }
    }
    setStatus('off');
  };

  return (
    <>
      <Header backButton backButtonFunction={param.type === 'create' ? signOut : undefined} title="Setup your profile" swicthDarkThem color={theme.background.val} />
      <View bg="$background" flex={1}>
        <ScrollView keyboardShouldPersistTaps='handled'>
          <Form ai='center' w='100%' h='100%' gap="$2" p="$6" onSubmit={handleSubmit(onSubmit)}  >
            <View pos='relative'>
              <Avatar circular size="$12" onPress={pickAvatar} >
                {avatarUri !== '' ? <Avatar.Image
                  accessibilityLabel={avatarUri}
                  src={avatarUri}
                /> : void (0)}
                <Avatar.Fallback backgroundColor='$accentBackground' f={1} jc='center' ai="center">
                  <Text fontSize='$12' color='white'>{param.name?.charAt(0).toUpperCase()}</Text>
                </Avatar.Fallback>
              </Avatar>
              <Button bw='$1' themeInverse bs='solid' bc={theme.background.val} theme='accent' circular icon={Pencil} pos='absolute' bottom={0} right={0} onPress={pickAvatar} />
            </View>
            {
              buildTextInput({
                name: "username",
                rules: {
                  required: 'Username is required',
                  validate: {
                    containsValidCharacters: (value: string) =>
                      /^[A-Za-z0-9_]+$/.test(value) ||
                      'Username can only contain letters, numbers, and underscores',
                    containsAtLeastOneLetter: (value: string) =>
                      /[A-Za-z]/.test(value) ||
                      'Username must include at least one letter',
                    noLeadingOrTrailingUnderscores: (value: string) =>
                      /^[A-Za-z0-9](.*[A-Za-z0-9])?$/.test(value) ||
                      'Username cannot start or end with underscore',
                    userNameNotAvailable: () => usernameError || true,
                  },
                },
                label: "Your username",
                error: errors.username,
                input: ({ onChange, value, onBlur }: any) => (
                  <XGroup>
                    <XGroup.Item>
                      <Button disabled><Button.Icon><AtSign /></Button.Icon></Button>
                    </XGroup.Item>
                    <XGroup.Item>
                      <Input f={1}
                        onChangeText={onChange}
                        value={value} onBlur={onBlur}
                        placeholder='Please enter your username'
                        autoComplete='username-new'
                        textContentType='username'
                        maxLength={20}
                        selectTextOnFocus
                        onFocus={() => handleFocus('username')}
                      />
                    </XGroup.Item>
                  </XGroup>
                )
              })
            }
            {
              buildTextInput({
                name: "name",
                rules: {
                  required: 'Name is required',
                  pattern:
                  {
                    value: /^[A-Za-z0-9À-ÿÆæØøÅåÉéÑñÜü\-'\s]+$/,
                    message: "Special character are not allowed except spaces, hyphens, apostrophes, and accented letters.",
                  },
                  validate: {
                    containsAtLeastOneLetter: (value: string) =>
                      /[A-Za-z]/.test(value) ||
                      'Name must include at least one letter',
                  }
                },
                label: "Your name",
                placeholder: "Please enter your name",
                error: errors.name,
                autoComplete: 'name',
                textContentType: 'name',
                maxLength: 50,
                selectTextOnFocus: true,
              })
            }

            <Form.Trigger asChild disabled={status !== 'off'} mt={'$4'}>
              <Button theme={buttonInactive ? 'active' : 'accent'} w='100%' icon={status === 'submitting' ? () => <Spinner /> : undefined}>
                {param.type === 'create' ? 'Proceed' : 'Update'}
              </Button>
            </Form.Trigger>
            {errorText && (
              <XStack ai='center' pt='$2' pl='$1'>
                <AlertCircle color='$error' size='$1' mr='$2' />
                <Text f={1} textWrap='wrap' w='100%' color='$error'>{errorText}</Text>
              </XStack>
            )}
            {successText && (
              <Text f={1} ta='center' textWrap='wrap' pt='$3' w='100%' color='$color'>{successText}</Text>
            )}
          </Form >
        </ScrollView >
      </View >
    </>
  );
};

export default SetupUsername;
