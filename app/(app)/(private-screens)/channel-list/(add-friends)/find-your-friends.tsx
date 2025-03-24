import { buildListItem, buildTextInput } from '@/components';
import { AtSign, ChevronDown, ContactRound } from '@tamagui/lucide-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Accordion, H3, H4, H5, ListItem, Paragraph, Square, Switch, View, XStack, YGroup, YStack } from 'tamagui';

interface IFindYourFriendProps {
}

const FindYourFriend: React.FC<IFindYourFriendProps> = (props) => {


    const { control, handleSubmit, formState: { errors, dirtyFields }, watch, trigger } = useForm<FormData>({
        defaultValues: {
            username: '',
        },
    });

    const [checked, setChecked] = useState(false);


    return (
        <>
            <Stack.Screen options={{ title: "Find Your Friends" }} />

            <View p='$4' h='100%' bg='$background'>

                <YGroup>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            icon={<ContactRound size='$1' />}
                        >
                            <YStack f={1}>
                                <ListItem.Text>Sync Contact Number</ListItem.Text>
                                <ListItem.Subtitle>Sync is {checked ? "enabled" : "disabled"}</ListItem.Subtitle>
                            </YStack>

                            <Switch checked={checked} onCheckedChange={setChecked} bg={checked ? '$accentColor' : '$gray6'}>
                                <Switch.Thumb animation='quicker' bg={checked ? 'whitesmoke' : 'whitesmoke'} />
                            </Switch>
                        </ListItem>
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem>
                            <Accordion overflow="hidden" w='100%' mih='$3' type="multiple">
                                <Accordion.Item value="a1">
                                    <Accordion.Trigger fd="row" jc="space-between" unstyled gap='$3.5'>
                                        {({
                                            open,
                                        }: {
                                            open: boolean;
                                        }) => (
                                            <>
                                                <AtSign size='$1' />
                                                <ListItem.Text>
                                                    Add by Username
                                                </ListItem.Text>
                                                <Square animation="quick" rotate={open ? '180deg' : '0deg'}>
                                                    <ChevronDown size="$1" />
                                                </Square>
                                            </>
                                        )}
                                    </Accordion.Trigger>
                                    <Accordion.HeightAnimator animation="medium">
                                        <Accordion.Content animation="medium" exitStyle={{ opacity: 0 }}>

                                            {buildTextInput({
                                                name: "username",
                                                placeholder: "Enter a username",
                                                control: control,
                                                handleFocus: () => { },

                                            })}
                                        </Accordion.Content>
                                    </Accordion.HeightAnimator>
                                </Accordion.Item>
                            </Accordion>
                        </ListItem>
                    </YGroup.Item>
                    {/* <YGroup.Item>
                        <ListItem>
                            <YStack f={1}>


                                {buildTextInput({
                                    name: "username",
                                    placeholder: "Enter a username",
                                    control: control,
                                    handleFocus: () => { },

                                })}
                                <H5 pb='$3'>Your username is</H5>

                            </YStack>

                        </ListItem>


                    </YGroup.Item> */}
                </YGroup>
            </View>
        </>
    );
};

export default FindYourFriend;
