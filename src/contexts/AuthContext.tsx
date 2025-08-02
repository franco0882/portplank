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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // Set a timeout to force loading to false after 5 seconds
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('Auth timeout reached, forcing loading to false');
            setLoading(false);
            toast.error('Authentication timeout. Using demo mode.');
            
            // Set up demo user
            const demoUser = {
              id: 'demo-user-id',
              email: 'demo@agency.com',
              full_name: 'Demo User',
              role: 'agency_owner' as const,
              agency_id: 'demo-agency-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setUserProfile(demoUser);
          }
        }, 5000);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!mounted) return;

        if (session?.user) {
          console.log('Session found for user:', session.user.id);
          setUser(session.user);
          
          try {
            // Try to fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.log('Profile error:', profileError);
              
              if (profileError.code === 'PGRST116') {
                console.log('No profile found, creating demo profile');
                // Create a demo profile for this user
                const demoProfile: User = {
                  id: session.user.id,
                  email: session.user.email || 'demo@agency.com',
                  full_name: session.user.user_metadata?.full_name || 'Demo User',
                  role: 'agency_owner',
                  agency_id: 'demo-agency-id',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setUserProfile(demoProfile);
              } else {
                throw profileError;
              }
            } else {
              console.log('Profile found:', profile);
              setUserProfile(profile);
            }
          } catch (profileError) {
            console.error('Error handling profile:', profileError);
            // Fall back to demo profile
            const demoProfile: User = {
              id: session.user.id,
              email: session.user.email || 'demo@agency.com',
              full_name: session.user.user_metadata?.full_name || 'Demo User',
              role: 'agency_owner',
              agency_id: 'demo-agency-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setUserProfile(demoProfile);
          }
        } else {
          console.log('No session found');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          toast.error('Authentication error. Using demo mode.');
          
          // Set up demo user as fallback
          const demoUser = {
            id: 'demo-user-id',
            email: 'demo@agency.com',
            full_name: 'Demo User',
            role: 'agency_owner' as const,
            agency_id: 'demo-agency-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUserProfile(demoUser);
        }
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          console.log('Auth initialization complete, setting loading to false');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError || !profile) {
              // Use demo profile
              const demoProfile: User = {
                id: session.user.id,
                email: session.user.email || 'demo@agency.com',
                full_name: session.user.user_metadata?.full_name || 'Demo User',
                role: 'agency_owner',
                agency_id: 'demo-agency-id',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setUserProfile(demoProfile);
            } else {
              setUserProfile(profile);
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            // Use demo profile as fallback
            const demoProfile: User = {
              id: session.user.id,
              email: session.user.email || 'demo@agency.com',
              full_name: session.user.user_metadata?.full_name || 'Demo User',
              role: 'agency_owner',
              agency_id: 'demo-agency-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setUserProfile(demoProfile);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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