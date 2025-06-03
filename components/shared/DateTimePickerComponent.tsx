import React, { useState } from 'react';
import { Button, Text, Stack, ButtonProps } from 'tamagui'; // Tamagui UI components
import DateTimePicker from '@react-native-community/datetimepicker'; // DateTimePicker from Expo
import { Platform } from 'react-native';

type IDateTimePickerComponentProps = ButtonProps & {
    value: Date | null;
    setValue: React.Dispatch<React.SetStateAction<Date | null>>;
    mode: 'date' | 'time' | 'datetime';
};

const DateTimePickerComponent: React.FC<React.PropsWithChildren<IDateTimePickerComponentProps>> = ({
    value,
    setValue,
    mode,
    children,
    ...props
}) => {
    if (Platform.OS === 'android' && mode === 'datetime') {
        mode = 'date';
    }
    // State to hold the selected date
    const [date, setDate] = useState<Date | null>(value);
    const [show, setShow] = useState<boolean>(false); // Whether the picker is shown

    // Handler when a date is selected
    const onChange = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || date; // if no date selected, use the current date
        setShow(false);
        setDate(currentDate);
        setValue(currentDate);
    };

    // Show Date Picker when button is clicked
    const showDatePicker = () => setShow(true);

    return (
        <>
            {/* Button to trigger the Date Picker */}
            {children ? React.cloneElement(children as React.ReactElement<ButtonProps>, {
                onPress: showDatePicker,  // Attach custom or default onPress handler
            }) : (
                <Button onPress={showDatePicker} {...props}>
                    {`Select ${mode === 'datetime' ? 'Date & Time' : mode === 'date' ? 'Date' : 'Time'}`}
                </Button>
            )}

            {/* Conditionally render the DateTimePicker */}
            {show && (
                <DateTimePicker
                    value={date ?? new Date()} // Default to current date if no date selected
                    mode={mode} // You can change to 'date' or 'time' if needed
                    is24Hour={false} // Use 12-hour format, set true for 24-hour format
                    onChange={onChange}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} // `spinner` display for iOS, `default` for Android
                // minimumDate={new Date()}

                />
            )}
        </>
    );
};

export default DateTimePickerComponent;
