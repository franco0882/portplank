import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { User } from '../types/database';
import { generateMockData } from '../lib/mockData';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: string, agencyData: any, phone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create a timeout promise that rejects after a specified time
const createTimeoutPromise = (ms: number, operation: string) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operation} timed out after ${ms}ms`));
    }, ms);
  });
};

// Create demo user profile
const createDemoProfile = (userId?: string): User => ({
  id: userId || 'demo-user-id',
  email: 'demo@agency.com',
  full_name: 'Demo User',
  role: 'agency_owner',
  agency_id: 'demo-agency-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Robust session fetching with timeout
  const getSessionWithTimeout = async (): Promise<{ session: any; user: SupabaseUser | null }> => {
    console.log('🔄 Fetching session with timeout...');
    
    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = createTimeoutPromise(3000, 'getSession');
      
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      const { data: { session }, error } = result as any;
      
      if (error) {
        console.error('❌ Session fetch error:', error);
        throw error;
      }
      
      console.log('✅ Session fetched successfully:', session ? 'Found' : 'None');
      return { session, user: session?.user || null };
    } catch (error) {
      console.error('❌ Session fetch failed or timed out:', error);
      return { session: null, user: null };
    }
  };

  // Robust profile fetching with timeout
  const getUserProfileWithTimeout = async (userId: string): Promise<User | null> => {
    console.log('🔄 Fetching user profile for:', userId);
    
    try {
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = createTimeoutPromise(3000, 'getUserProfile');
      
      const result = await Promise.race([profilePromise, timeoutPromise]);
      const { data: profile, error } = result as any;
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ No profile found for user:', userId);
          return null;
        }
        console.error('❌ Profile fetch error:', error);
        throw error;
      }
      
      console.log('✅ Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('❌ Profile fetch failed or timed out:', error);
      return null;
    }
  };

  // Main initialization function
  const initializeAuth = async (): Promise<void> => {
    console.log('🚀 Starting auth initialization...');
    
    try {
      // Step 1: Get session with timeout
      const { session, user: sessionUser } = await getSessionWithTimeout();
      
      if (!sessionUser) {
        console.log('📝 No session found, setting up unauthenticated state');
        setUser(null);
        setUserProfile(null);
        return;
      }
      
      console.log('👤 Session user found:', sessionUser.id);
      setUser(sessionUser);
      
      // Step 2: Get user profile with timeout
      const profile = await getUserProfileWithTimeout(sessionUser.id);
      
      if (!profile) {
        console.log('🎭 No profile found, creating demo profile');
        const demoProfile = createDemoProfile(sessionUser.id);
        setUserProfile(demoProfile);
        toast.success('Welcome! Using demo mode.');
      } else {
        console.log('✅ Profile loaded successfully');
        setUserProfile(profile);
      }
      
    } catch (error) {
      console.error('💥 Auth initialization failed:', error);
      
      // Always fall back to demo mode on any error
      console.log('🎭 Falling back to demo mode');
      const demoProfile = createDemoProfile();
      setUserProfile(demoProfile);
      toast.error('Authentication failed. Using demo mode.');
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const runInitialization = async () => {
      try {
        // Use Promise.race to guarantee initialization completes within 8 seconds
        const initPromise = initializeAuth();
        const maxTimeoutPromise = createTimeoutPromise(8000, 'Auth initialization');
        
        await Promise.race([initPromise, maxTimeoutPromise]);
        
      } catch (error) {
        console.error('🚨 Auth initialization timed out or failed:', error);
        
        if (mounted) {
          // Force demo mode if everything fails
          console.log('🎭 Forcing demo mode due to timeout');
          const demoProfile = createDemoProfile();
          setUserProfile(demoProfile);
          setUser(null);
          toast.error('Authentication timed out. Using demo mode.');
        }
      } finally {
        if (mounted) {
          console.log('🏁 Auth initialization complete, setting loading to false');
          setLoading(false);
        }
      }
    };

    runInitialization();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.id);
        
        if (!mounted) {
          console.log('⚠️ Component unmounted, ignoring auth state change');
          return;
        }

        try {
          if (session?.user) {
            console.log('👤 Auth state change: user signed in');
            setUser(session.user);
            
            // Fetch profile with timeout
            const profile = await getUserProfileWithTimeout(session.user.id);
            
            if (!profile) {
              console.log('🎭 No profile in auth change, using demo profile');
              const demoProfile = createDemoProfile(session.user.id);
              setUserProfile(demoProfile);
            } else {
              console.log('✅ Profile updated from auth change');
              setUserProfile(profile);
            }
          } else {
            console.log('👋 Auth state change: user signed out');
            setUser(null);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('❌ Error in auth state change handler:', error);
          
          if (session?.user) {
            // If we have a user but profile fetch failed, use demo
            const demoProfile = createDemoProfile(session.user.id);
            setUserProfile(demoProfile);
          }
        } finally {
          // Always ensure loading is false after auth state changes
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        toast.error('Failed to sign in: ' + error.message);
        return { error };
      }
      
      console.log('✅ Sign in successful');
      toast.success('Welcome back!');
      return { error: null };
      
    } catch (error) {
      console.error('💥 Sign in exception:', error);
      toast.error('Sign in failed');
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string, agencyData: any, phone?: string) => {
    console.log('📝 Attempting sign up for:', email);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        console.error('❌ Sign up auth error:', authError);
        return { error: authError };
      }

      if (authData.user) {
        console.log('✅ Auth user created, setting up agency and profile...');
        
        try {
          // Create agency first
          const { data: agencyResult, error: agencyError } = await supabaseAdmin
            .from('agencies')
            .insert({
              name: agencyData.name,
              slug: agencyData.slug || agencyData.name.toLowerCase().replace(/\s+/g, '-'),
              website: agencyData.website,
              phone: agencyData.phone,
              billing_address: agencyData.billing_address,
              billing_city: agencyData.billing_city,
              billing_zip: agencyData.billing_zip,
              billing_country: agencyData.billing_country || 'Canada'
            })
            .select('id')
            .single();

          if (agencyError) {
            console.error('❌ Error creating agency:', agencyError);
            return { error: agencyError };
          }

          // Create user profile
          const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
              id: authData.user.id,
              email: email,
              full_name: fullName,
              role: role as any,
              agency_id: agencyResult.id
            });

          if (userError) {
            console.error('❌ Error creating user profile:', userError);
            return { error: userError };
          }

          console.log('✅ Sign up complete');
          toast.success('Account created successfully!');

        } catch (error) {
          console.error('💥 Error in signup process:', error);
          return { error };
        }
      }

      return { error: null };
    } catch (error) {
      console.error('💥 Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('👋 Signing out...');
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      console.log('✅ Sign out successful');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      toast.error('Sign out failed');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      console.error('❌ No user logged in for profile update');
      return { error: new Error('No user logged in') };
    }

    console.log('🔄 Updating profile for:', user.id);

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        toast.error('Failed to update profile');
        return { error };
      }

      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      console.log('✅ Profile updated successfully');
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('💥 Profile update exception:', error);
      toast.error('Failed to update profile');
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};