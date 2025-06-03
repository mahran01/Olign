import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useMemo, useState } from 'react';

type AuthResult = {
  user?: User | null;
  session?: Session | null;
  error?: string;
};

interface IAuthContextProps {
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<{ error?: string; }>;
  resendEmailLink: (email: string) => Promise<{ data?: Object, error?: string; }>;
  setUserIsReady: (isReady: boolean) => Promise<{ data?: Object, error?: string; }>;
  updateUserData: (data: any) => Promise<{ data?: Object, error?: string; }>;
  authenticateStream: (userId?: string) => Promise<{ data?: Object, error?: string; }>;
  session?: Session | null;
  streamData: { apiKey: string, token: string; };
  isLoading: boolean;
  userIsReady: boolean;
}

export const AuthContext = createContext<IAuthContextProps>({
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => ({}),
  resendEmailLink: async () => ({}),
  setUserIsReady: async () => ({}),
  authenticateStream: async () => ({}),
  updateUserData: async () => ({}),
  session: null,
  streamData: { apiKey: '', token: '' },
  isLoading: false,
  userIsReady: false,
});

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userIsReady, _setUserIsReady] = useState(false);
  const [streamData, setStreamData] = useState({ apiKey: '', token: 'string' });
  const router = useRouter();

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoading(true);
        console.log(event);
        if (event === 'SIGNED_OUT') {
          setSession(null);
          _setUserIsReady(false);
          setStreamData({ apiKey: '', token: 'string' });
          router.replace('/');
        } else if (session) {
          setSession(session);
          _setUserIsReady(session?.user.user_metadata.is_ready);
        }
        setIsLoading(false);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const _authenticateStream = async () => {
      if (session && userIsReady) {
        const { error } = await authenticateStream(session.user.id);
        if (error) {
          console.error("Use Effect Error authenticateStream: ", error);
        }

      }
    };
    _authenticateStream();
  }, [session, userIsReady]);


  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const { data: { user, session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          is_ready: false,
        }
      }
    });
    setIsLoading(false);

    return { user, session, error: error?.message };
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (session?.user.user_metadata.is_ready) {
      await authenticateStream();
    }
    setIsLoading(false);
    return { user, session, error: error?.message };
  };

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);
    return { error: error?.message };
  };

  const resendEmailLink = async (email: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    setIsLoading(false);
    return { data, error: error?.message };
  };

  const setUserIsReady = async (isReady: boolean) => {
    setIsLoading(true);
    const { data, error } = await updateUserData({ is_ready: isReady });
    _setUserIsReady(isReady);
    setIsLoading(false);
    return { data, error: error };
  };

  const updateUserData = async (data: any) => {
    setIsLoading(true);
    const { data: dataUpdate, error } = await supabase.auth.updateUser({ data });
    setIsLoading(false);
    return { dataUpdate, error: error?.message };
  };

  const authenticateStream = async (userId = session?.user.id) => {

    setIsLoading(true);

    const { data, error } = await supabase.functions.invoke('create-stream-token', {
      body: { userId }
    });
    if (error) {
      console.error(error);
      setIsLoading(false);
      await signOut();
      return { data, error: error.message };
    }
    else {
      const { apiKey, token } = JSON.parse(data);

      setStreamData({ apiKey, token });
      setIsLoading(false);
      return { data, error: error.message };
    }
  };

  const value = useMemo(
    () => ({
      signIn,
      signUp,
      signOut,
      resendEmailLink,
      setUserIsReady,
      updateUserData,
      authenticateStream,
      session,
      streamData,
      isLoading,
      userIsReady
    }),
    [session, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};