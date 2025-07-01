"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange, signInWithEmail, signUpWithEmail, signOut, resendConfirmation } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 사용자 상태 가져오기
    const getUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // 세션이 없는 것은 정상적인 상황이므로 에러 로그를 줄임
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage !== "Auth session missing!") {
          console.error('Error getting user:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // 인증 상태 변화 리스너 설정
    const subscription = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { user, error } = await signInWithEmail(email, password);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const handleSignUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { user, error } = await signUpWithEmail(email, password);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleResendConfirmation = async (email: string) => {
    try {
      const result = await resendConfirmation(email);
      return result;
    } catch (error) {
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resendConfirmation: handleResendConfirmation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 