import React, { useState, useEffect } from 'react';
import { ViewProps } from 'react-native';
import { MotiView } from 'moti';
import { FieldError } from 'react-hook-form'; // Assuming FieldError comes from react-hook-form

interface MyMotiProps extends ViewProps {
    error: FieldError | undefined;
}

const MyMoti: React.FC<React.PropsWithChildren<MyMotiProps>> = ({ children, error, ...props }) => {
    const [shake, setShake] = useState(false);
    const TRANSLATION_AMPLITUDE = 2; // Max translation distance for each shake
    const SHAKE_DURATION = 200; // Total duration of the shake effect in milliseconds
    const NUMBER_OF_SHAKES = 6; // How many back-and-forth movements

    useEffect(() => {
        if (error) {
            setShake(true);
            // Reset shake after the animation duration
            const timer = setTimeout(() => setShake(false), SHAKE_DURATION);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Generate the shake animation sequence
    const generateShakeSequence = () => {
        if (!shake) return 0; // No shake if shake state is false

        const sequence = [];
        // Start from 0, then alternate between -TRANSLATION_AMPLITUDE and TRANSLATION_AMPLITUDE
        // Ending at 0
        for (let i = 0; i < NUMBER_OF_SHAKES; i++) {
            const translation = (i % 2 === 0 ? -1 : 1) * TRANSLATION_AMPLITUDE;
            sequence.push(translation);
        }
        sequence.push(0); // Ensure it ends at the original position

        return sequence;
    };

    return (
        <MotiView
            animate={{ translateX: generateShakeSequence() }}
            transition={{
                type: 'timing', // Use timing for precise control
                duration: SHAKE_DURATION / (NUMBER_OF_SHAKES + 1), // Divide total duration by number of steps
                loop: false,
                // Repeat 0 times means it runs once. We're controlling the sequence directly.
                repeatReverse: false,
            }}
            {...props}
        >
            {children}
        </MotiView>
    );
};

export default MyMoti;