import { buildTextInput as buildDefaultTextInput } from '@/components';
import { useAuthContext } from '@/contexts';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Form, Spinner, View } from 'tamagui';

type FormData = {
    email: string;
    password: string;
    confirmPassword: string;
};

interface ISignUpProps {
}

const SignUp: React.FC<ISignUpProps> = (props) => {
    const { signUp } = useAuthContext();
    const router = useRouter();

    const { control, handleSubmit, formState: { errors, dirtyFields }, watch, trigger } = useForm<FormData>({
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: ''
        },
    });

    const [emailError, setEmailError] = useState('');
    const [status, setStatus] = useState<'off' | 'submitting' | 'submitted' | 'error'>('off');

    const [dirtied, setDirtied] = useState<Record<keyof FormData, boolean>>({
        email: false,
        password: false,
        confirmPassword: false
    });

    const { email, password, confirmPassword } = watch();

    useEffect(() => {
        emailError && setEmailError('');
        dirtied.email && trigger('email');
    }, [email]);

    useEffect(() => {
        dirtied.email && trigger('email');
    }, [emailError]);

    useEffect(() => {
        dirtied.password && trigger('password');
        dirtied.confirmPassword && trigger('confirmPassword');
    }, [password]);

    useEffect(() => {
        dirtied.confirmPassword && trigger('confirmPassword');
    }, [confirmPassword]);

    useEffect(() => {
        setStatus('off');
    }, [email, password, confirmPassword]);

    const handleFocus = (fieldname: keyof FormData) => {
        if (!dirtied[fieldname]) {
            const newDirtied = { ...dirtied };
            newDirtied[fieldname] = true;
            setDirtied(newDirtied);
        }
    };

    const buildTextInput = (param: Omit<Parameters<typeof buildDefaultTextInput>[0], 'control' | 'handleFocus'>) =>
        buildDefaultTextInput({ control, handleFocus, ...param });
    const areAllFieldsDirty = Object.keys(dirtyFields).length === 3;
    const buttonInactive = !areAllFieldsDirty || Object.keys(errors).length > 0;

    const onSubmit = async (data: any) => {
        setStatus('submitting');
        const { email, password } = data;
        const { error } = await signUp(email, password);
        if (error?.includes('User already registered')) {
            console.log('Error during sign-up:', error);
            setEmailError('Email address is not available');
            setStatus('error');
        }
        if (error?.includes('Email address') && error?.includes('is invalid')) {
            console.log('Error during sign-up:', error);
            setEmailError('Invalid email address');
            setStatus('error');
        }
        else if (error) {
            console.log('Error during sign-up:', error);
            setStatus('error');
        }
        else {
            setStatus('submitted');
            router.replace(`/waiting-confirmation/${JSON.stringify({ email, password })}`);
        }
    };

    return (
        <View bg="$background" flex={1}>
            <Form ai='center' w='100%' h='100%' gap="$2" p="$6" onSubmit={handleSubmit(onSubmit)}>
                {
                    buildTextInput({
                        name: "email",
                        rules: {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address',
                            },
                            validate: () => emailError || true
                        },
                        label: "Email Address",
                        placeholder: "example@domain.com",
                        error: errors.email,
                        autoComplete: 'email',
                        textContentType: 'emailAddress',
                    })
                }
                {
                    buildTextInput({
                        name: "password",
                        rules: {
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters',
                            },
                        },
                        label: "Password",
                        placeholder: "Create your password",
                        error: errors.password,
                        autoComplete: 'new-password',
                        textContentType: 'newPassword',
                        secureTextEntry: true
                    })
                }
                {
                    buildTextInput({
                        name: "confirmPassword",
                        rules: {
                            required: 'Please confirm your password',
                            validate: (value: string) => value === password || 'Passwords do not match',
                        },
                        label: "Confirm Password",
                        placeholder: "Re-enter your password",
                        error: errors.confirmPassword,
                        autoComplete: 'new-password',
                        textContentType: 'newPassword',
                        secureTextEntry: true
                    })
                }

                <Form.Trigger asChild disabled={status !== 'off'} mt={'$4'}>
                    <Button theme={buttonInactive ? 'active' : "accent"} w='100%' icon={status === 'submitting' ? () => <Spinner /> : undefined}>
                        Sign Up
                    </Button>
                </Form.Trigger>
            </Form >
        </View>
    );
};

export default SignUp;