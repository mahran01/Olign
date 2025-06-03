import { Header } from '@/components';
import { useAuthStore } from '@/stores';
// import { useAuthContext } from '@/contexts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, H2, H4, H5, Spinner, useTheme, XStack, YStack } from 'tamagui';

interface ISetupUsernameProps {
}

const SetupUsername: React.FC<ISetupUsernameProps> = (props) => {


  const theme = useTheme();
  const router = useRouter();
  const credential = JSON.parse(useLocalSearchParams().credential as string);
  const email = credential.email;
  const password = credential.password;
  // const { signIn, resendEmailLink } = useAuthContext();
  const { signIn, resendEmailLink } = useAuthStore();


  const [error, setError] = useState('');
  const [status, setStatus] = useState<'waiting' | 'verified' | 'error'>('waiting');
  const [resendTimer, setResendTimer] = useState(0);
  const [verifyTimer, setVerifyTimer] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const testVerify = async () => {
    const { user, error } = await signIn(email, password);

    if (user) {
      setStatus('verified');
      console.log('Sign-in successful:', user);
      router.replace('/');
    }

    if (error) {
      setStatus('error');
      if (error.includes('Email not confirmed')) {
        console.log('Email not verified yet. Retrying in 10 seconds...');
        setStatus('waiting');
        setVerifyTimer(10);
      } else {
        console.error('Sign-in error:', error);
      }
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (verifyTimer === 0) testVerify();
    else if (verifyTimer > 0) {
      timer = setInterval(() => {
        setVerifyTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [verifyTimer]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const resendLink = async () => {
    const { error } = await resendEmailLink(email);
    if (error) {
      setError(error);
      setStatus('error');
      console.log(error);
    }
    else {
      console.log('Email sent successfully!');
    }
    setStatus('waiting');
  };

  return (
    <>
      <Header backButton title="Confirm your email" swicthDarkThem color={theme.background.val} />
      <YStack bg="$background" flex={1} w='100%' h='100%' gap="$2" p="$6"  >
        <H2>Please verify your email address</H2>
        <H4>Waiting for email verification...</H4>
        {status === 'waiting' && (
          <Spinner py='$3' size='large' />
        )}
        <H5 pb='$3'>This screens will automatically load once you have verified your email address. If you didn’t receive an email, try resending the link.</H5>
        <XStack gap={10}>
          <Button onPress={() => resendLink()} themeInverse={resendTimer == 0} disabled={resendTimer > 0} w='50%' mt={'$4'} >
            Resend Link{resendTimer !== 0 ? `(${resendTimer})` : ''}
          </Button>
          <Button onPress={() => setVerifyTimer(0)} theme='accent' w='50%' mt={'$4'}>
            Refresh
          </Button>
        </XStack>
      </YStack >
    </>
  );
};

export default SetupUsername;
