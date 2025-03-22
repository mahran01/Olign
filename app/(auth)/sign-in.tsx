import { buildTextInput as buildDefaultTextInput } from '@/components';
import { useAuthContext } from '@/contexts';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Form, Spinner, View } from 'tamagui';

type FormData = {
    email: string;
    password: string;
};

interface ISignInProps {
}

const SignIn: React.FC<ISignInProps> = (props) => {

    const router = useRouter();
    const { signIn } = useAuthContext();

    const { control, handleSubmit, formState: { errors, dirtyFields }, watch, trigger } = useForm<FormData>({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const [error, setError] = useState('');
    const [status, setStatus] = useState<'off' | 'submitting' | 'submitted' | 'error'>('off');
    const [dirtied, setDirtied] = useState<Record<keyof FormData, boolean>>({
        email: false,
        password: false
    });

    const { email, password } = watch();

    useEffect(() => {
        dirtied.email && trigger('email');
        setError('');
    }, [email]);

    useEffect(() => {
        dirtied.password && trigger('password');
        setError('');
    }, [password]);

    useEffect(() => {
        dirtied.email && trigger('email');
        dirtied.password && trigger('password');
    }, [error]);

    useEffect(() => {
        setStatus('off');
    }, [email, password]);

    const handleFocus = (fieldname: keyof FormData) => {
        if (!dirtied[fieldname]) {
            const newDirtied = { ...dirtied };
            newDirtied[fieldname] = true;
            setDirtied(newDirtied);
        }
    };

    const buildTextInput = (param: Omit<Parameters<typeof buildDefaultTextInput>[0], 'control' | 'handleFocus'>) =>
        buildDefaultTextInput({ control, handleFocus, ...param });
    const areAllFieldsDirty = Object.keys(dirtyFields).length === 2;
    const buttonInactive = !areAllFieldsDirty || Object.keys(errors).length > 0;

    const onSubmit = async (data: any) => {
        setStatus('submitting');
        const { email, password } = data;
        const { error } = await signIn(email, password);

        if (error?.includes("Email not confirmed")) {
            setStatus('submitted');
            router.replace(`/waiting-confirmation/${JSON.stringify({ email, password })}`);
        }
        else if (error?.includes('Invalid login credentials')) {
            console.log('Error during sign-in:', error);
            setError(error);
            setStatus('error');
        }
        else if (error) {
            console.log('Error during sign-in:', error);
            setError(error);
            setStatus('error');
        }
        else {
            setStatus('submitted');
            router.replace('/');
        }
    };

    console.log("Inside signin");
    return (
        <View bg="$background" flex={1}>
            <Form ai='center' w='100%' h='100%' gap="$2" p="$6" onSubmit={handleSubmit(onSubmit)} >
                {
                    buildTextInput({
                        name: "email",
                        rules: {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address',
                            },
                            validate: () => error === '' || 'Invalid email or password',
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
                            validate: () => error === '' || 'Invalid email or password',
                        },
                        label: "Password",
                        placeholder: "Create your password",
                        error: errors.password,
                        autoComplete: 'password',
                        textContentType: 'password',
                        secureTextEntry: true
                    })
                }

                <Form.Trigger asChild disabled={status !== 'off'} mt={'$4'}>
                    <Button theme={buttonInactive ? 'active' : "accent"} w='100%' icon={status === 'submitting' ? () => <Spinner /> : undefined}>
                        Sign In
                    </Button>
                </Form.Trigger>
            </Form >
        </View >
    );
};

export default SignIn;