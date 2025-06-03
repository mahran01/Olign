import React, { useState } from 'react';
import { Button, Stack, ButtonProps, Text } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

type IDateTimePickerComponentProps = ButtonProps & {
    value: Date | null | undefined;
    setValue: React.Dispatch<React.SetStateAction<Date | null>>;
};

const DateTimePickerComponent: React.FC<React.PropsWithChildren<IDateTimePickerComponentProps>> = ({
    value,
    setValue,
    children,
    ...props
}) => {
    const [tempDate, setTempDate] = useState<Date>(value ?? new Date());
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (event?.type === 'dismissed' || !selectedDate) {
            setShowDate(false);
            return;
        }

        const updatedDate = new Date(selectedDate);
        setTempDate(updatedDate);
        setShowDate(false);
        setShowTime(true);
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTime(false);
        if (event?.type === 'dismissed' || !selectedTime) return;

        const updatedDate = new Date(tempDate);
        updatedDate.setHours(selectedTime.getHours());
        updatedDate.setMinutes(selectedTime.getMinutes());
        setValue(updatedDate);
    };

    const showPickers = () => {
        setShowDate(true);
    };

    return (
        <>
            {children ? (
                React.cloneElement(children as React.ReactElement<ButtonProps>, {
                    onPress: showPickers,
                })
            ) : (
                <Button onPress={showPickers} {...props}>
                    {value ? value.toLocaleString() : 'Select Date & Time'}
                </Button>
            )}

            {showDate && (
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}


                />
            )}

            {showTime && (
                <DateTimePicker
                    value={tempDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={false}
                    onChange={handleTimeChange}
                />
            )}
        </>
    );
};

export default DateTimePickerComponent;
