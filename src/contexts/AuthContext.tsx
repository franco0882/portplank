import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { User } from '../types/database';
import { DatabaseService } from '../lib/database';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          
          // Fetch real user profile from database
          try {
            const profile = await DatabaseService.getUser(session.user.id);
            if (mounted) {
              setUserProfile(profile);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            if (mounted) {
              // If profile doesn't exist, sign out the user
              await supabase.auth.signOut();
              setUser(null);
              setUserProfile(null);
              toast.error('Profile not found. Please sign in again.');
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          toast.error('Authentication error. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch real user profile from database
          try {
            const profile = await DatabaseService.getUser(session.user.id);
            if (mounted) {
              setUserProfile(profile);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            if (mounted) {
              setUserProfile(null);
              toast.error('Profile not found. Please sign in again.');
            }
          }
        } else {
          if (mounted) {
            setUserProfile(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error('Failed to sign in');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: string, agencyData: any, phone?: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (authError) return { error: authError };

    if (authData.user) {
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
          console.error('Error creating agency:', agencyError);
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
          console.error('Error creating user profile:', userError);
          return { error: userError };
        }

      } catch (error) {
        console.error('Error in signup process:', error);
        return { error };
      }

      toast.success('Account created successfully!');
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    toast.success('Signed out successfully');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to update profile');
        return { error };
      }

      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
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