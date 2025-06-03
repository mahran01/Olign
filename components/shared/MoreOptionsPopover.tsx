import { Popover, Button, YGroup, YStack, PopoverProps, Adapt } from 'tamagui';

// interface MoreOptionsPopoverProps extends React.ComponentProps<typeof Popover> {
//     Icon?: any;
//     placement?: 'top' | 'bottom';
//     showArrow?: boolean;
//     children: React.ReactNode; // custom menu content
// }

// const MoreOptionsPopover: React.FC<MoreOptionsPopoverProps> = ({
//     Icon,
//     placement = 'top',
//     showArrow = true,
//     children,
//     ...props
// }) => {
//     const popoverPosition = placement === 'top' ? { y: -10 } : { y: 10 };

//     return (
//         <Popover size="$5" allowFlip stayInFrame offset={15} resize {...props} placement={placement}>
//             <Popover.Trigger asChild style={{ aspectRatio: '1/1' }}>
//                 <Button icon={Icon} bg="$background0" />
//             </Popover.Trigger>

//             <Popover.Content
//                 padding={0}
//                 margin={0}
//                 borderWidth={1}
//                 borderColor="$borderColor"
//                 width="$13"
//                 height={'$10'}
//                 enterStyle={{ ...popoverPosition, opacity: 0 }}
//                 exitStyle={{ ...popoverPosition, opacity: 0 }}
//                 animation={[
//                     'quick',
//                     {
//                         opacity: {
//                             overshootClamping: true,
//                         },
//                     },
//                 ]}
//             >
//                 {showArrow && (
//                     <Popover.Arrow
//                         bg="$color2"
//                         borderWidth={1}
//                         borderColor="$borderColor"
//                     />
//                 )}
//                 <Popover.Close asChild>
//                     <YGroup p={0}>
//                         {children}
//                     </YGroup>
//                 </Popover.Close>
//             </Popover.Content>
//         </Popover>
//     );
// };

// export default MoreOptionsPopover;

export function MoreOptionsPopover({
    Icon,
    Name,
    shouldAdapt,
    showArrow = true,
    renderButton,
    children,
    ...props
}: PopoverProps & {
    Icon?: any;
    Name?: string;
    shouldAdapt?: boolean;
    showArrow?: boolean,
    renderButton?: () => React.ReactElement;
}) {
    return (
        <Popover size="$5" allowFlip stayInFrame offset={15} resize {...props}>
            <Popover.Trigger asChild>
                {renderButton ? renderButton() : (
                    <Button icon={Icon} aspectRatio={1} bg='$colorTransparent' />
                )}
            </Popover.Trigger>

            {shouldAdapt && (
                <Adapt when={true} platform="touch">
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
            )}

            <Popover.Content
                padding={0}
                margin={0}
                borderWidth={1}
                borderColor="$borderColor"
                width='$13'
                enterStyle={{ y: -10, opacity: 0 }}
                exitStyle={{ y: -10, opacity: 0 }}
                elevate
                animation={[
                    'quick',
                    {
                        opacity: {
                            overshootClamping: true,
                        },
                    },
                ]}
            >

                {showArrow && (
                    <Popover.Arrow
                        bg="$color1"
                        borderWidth={1}
                        borderColor="$borderColor"
                    />
                )}
                <Popover.Close asChild>
                    <YGroup p={0}>
                        {children}
                    </YGroup>
                </Popover.Close>
            </Popover.Content>
        </Popover>
    );
}


export default MoreOptionsPopover;