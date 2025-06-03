import React, { useState } from 'react';
import { Button, Stack } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

type DateTimePickerComponentProps = {
    setDate: React.Dispatch<React.SetStateAction<Date | null>>;
    setTime: React.Dispatch<React.SetStateAction<Date | null>>;
} | {
    setDate: React.Dispatch<React.SetStateAction<Date | null>>;
    setTime?: never;
} | {
    setDate?: never;
    setTime: React.Dispatch<React.SetStateAction<Date | null>>;
};

const DateTimePickerComponent: React.FC<React.PropsWithChildren<DateTimePickerComponentProps>> = ({
    setDate,
    setTime,
    children,
}) => {
    // const mode = setDate && setTime ? 'datetime' : setDate ? 'date' : 'time';

    const [showDatePicker, setShowDatePicker] = useState<boolean>(false); // Show date picker
    const [showTimePicker, setShowTimePicker] = useState<boolean>(false); // Show time picker

    const [date, setInternalDate] = useState<Date | null>(null); // Internal state for date
    const [time, setInternalTime] = useState<Date | null>(null); // Internal state for time

    const onDateChange = (event: any, selectedDate: Date | undefined) => {
        if (setDate) {
            const currentDate = selectedDate || date;
            setShowDatePicker(false); // Dismiss the date picker
            setInternalDate(currentDate); // Set internal date state
            setDate(currentDate); // Set the parent component's date state
        }
    };

    const onTimeChange = (event: any, selectedTime: Date | undefined) => {
        if (setTime) {
            const currentTime = selectedTime || time;
            setShowTimePicker(false); // Dismiss the time picker
            setInternalTime(currentTime); // Set internal time state
            setTime!(currentTime); // Set the parent component's time state
        }
    };

    return (
        <Stack padding={16}>
            {/* Button to trigger the DatePicker */}
            {children ? children : () => {

                if (setDate) () => (
                    <Button onPress={() => setShowDatePicker(true)} size="large">
                        Select Date
                    </Button>);

                {/* Button to trigger the TimePicker */ }
                <Button onPress={() => setShowTimePicker(true)} size="large">
                    Select Time
                </Button>;
            }}

            {/* Conditionally render the DateTimePicker for Date */}
            {showDatePicker && (
                <DateTimePicker
                    value={date || new Date()} // Default to current date if no date selected
                    mode="date" // Mode is 'date' for selecting the date
                    onChange={onDateChange} // Handle date change
                    display="default" // Default display for Android
                    minimumDate={new Date()}
                />
            )}

            {/* Conditionally render the DateTimePicker for Time */}
            {showTimePicker && (
                <DateTimePicker
                    value={time || new Date()} // Default to current time if no time selected
                    mode="time" // Mode is 'time' for selecting the time
                    onChange={onTimeChange} // Handle time change
                    display="default" // Default display for Android
                />
            )}
        </Stack>
    );
};

export default DateTimePickerComponent;
