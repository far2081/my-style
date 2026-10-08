import { supabase, isSupabaseConfigured } from './supabase';
import { User, UserProfile } from '../types';

export const authService = {
  /**
   * Get current active session
   */
  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase getSession error:', error.message);
      return null;
    }
    return session;
  },

  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      avatarUrl: data.avatar_url || '',
      role: data.role || 'customer',
      preferredColors: data.preferred_colors || [],
      preferredEvents: data.preferred_events || [],
      preferredStyle: data.preferred_style || '',
      budgetRange: data.budget_range || { min: 50000, max: 500000 },
      savedSizes: data.saved_sizes || { dress: 'M', bust: 36, waist: 29, hips: 39 },
      shippingAddress: data.shipping_address || {},
    };
  },

  /**
   * Register a new user
   */
  async signUp(email: string, password: string, name: string) {
    if (!isSupabaseConfigured) {
      return {
        user: null,
        error: 'Supabase credentials not configured in .env. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to register live accounts.',
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'customer' },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/#auth-confirmed` : undefined,
      },
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Sign up failed' };

    // Insert customer profile into database
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      name,
      role: 'customer',
      preferred_colors: ['Deep Plum', 'Champagne Gold'],
      preferred_events: ['Bridal', 'Barat'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const user: User = {
      id: data.user.id,
      name,
      email,
      role: 'customer',
      profile: {
        name,
        email,
        role: 'customer',
        preferredColors: ['Deep Plum', 'Champagne Gold'],
        preferredEvents: ['Bridal', 'Barat'],
      },
    };
    return { user, error: null };
  },

  /**
   * Log in user with real credentials
   */
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return {
        user: null,
        error: 'Supabase backend not connected. Please set your live VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to perform live authentication.',
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Authentication failed' };

    const profile = await this.getProfile(data.user.id);
    const user: User = {
      id: data.user.id,
      name: profile?.name || data.user.user_metadata?.name || 'Customer',
      email: data.user.email || email,
      role: profile?.role || 'customer',
      profile: profile || undefined,
    };

    return { user, error: null };
  },

  /**
   * Sign out
   */
  async signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  /**
   * Password reset request
   */
  async resetPassword(email: string) {
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Password reset link sent to ' + email };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Password reset instructions sent.' };
  },
};
